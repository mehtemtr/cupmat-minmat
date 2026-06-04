import os
import zipfile
import re
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def extract_strings_from_bin(file_path):
    print(f"Extracting printable strings from {file_path}...")
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            if 'xl/sharedStrings.bin' in zip_ref.namelist():
                content = zip_ref.read('xl/sharedStrings.bin')
                
                # Extract ascii-like strings
                ascii_strings = []
                # Simple scanner for bytes in printable range
                current = []
                for b in content:
                    if 32 <= b <= 126:
                        current.append(chr(b))
                    else:
                        if len(current) >= 4:
                            ascii_strings.append("".join(current))
                        current = []
                if len(current) >= 4:
                    ascii_strings.append("".join(current))
                
                # Also try scanning for UTF-16 strings (Excel uses UTF-16 a lot)
                utf16_strings = []
                # Excel XLSB shared strings might be stored as length-prefixed UTF-16 or UTF-8.
                # Let's decode the entire binary file to UTF-16 with 'ignore' or 'replace' and run a regex
                text_utf16 = content.decode('utf-16-le', errors='ignore')
                utf16_matches = re.findall(r'[a-zA-Z0-9\s\u0080-\uFFFF]{4,40}', text_utf16)
                
                print(f"Found {len(ascii_strings)} ASCII strings and {len(utf16_matches)} UTF-16 strings.")
                
                # Merge and clean unique strings
                all_strings = set()
                for s in ascii_strings:
                    clean = s.strip()
                    if len(clean) >= 4: all_strings.add(clean)
                for s in utf16_matches:
                    clean = s.strip()
                    if len(clean) >= 4: all_strings.add(clean)
                
                print(f"Total unique cleaned strings: {len(all_strings)}")
                
                # Let's sort and print some samples containing keywords or general samples
                all_list = sorted(list(all_strings))
                
                # Print any player names or clubs
                print("\n=== Sample extracted strings (first 100): ===")
                for s in all_list[:100]:
                    print(f"- {s}")
                    
                # Look for Turkey players specifically
                print("\n=== Search for Turkey players / keywords: ===")
                turkey_keywords = ["arda", "guler", "yildiz", "hakan", "calhanoglu", "mert", "altay", "ferdi", "samet", "kaplan"]
                for s in all_list:
                    if any(k in s.lower() for k in turkey_keywords):
                        print(f"Match: {s}")
            else:
                print("sharedStrings.bin not found.")
    except Exception as e:
        print(f"Error: {e}")

extract_strings_from_bin("d:\\Kitap2((Unsaved-312571281026902844)).xlsb")
