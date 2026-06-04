import os
import zipfile
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def inspect_xlsb(file_path):
    print(f"\nAnalyzing XLSB: {file_path}")
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            file_list = zip_ref.namelist()
            print(f"File list sample (first 10): {file_list[:10]}")
            
            # Look for sharedStrings.bin
            shared_string_file = None
            for name in file_list:
                if 'sharedStrings' in name:
                    shared_string_file = name
                    break
            
            if shared_string_file:
                print(f"Found shared strings file: {shared_string_file}")
                content = zip_ref.read(shared_string_file)
                # Just search for some names in binary format (utf-8 / utf-16)
                names_to_test = ["guler", "yildiz", "hakan", "calhanoglu", "mbappe", "messi"]
                found = []
                for name in names_to_test:
                    # check utf-8 and utf-16 encodings of name
                    if name.encode('utf-8') in content.lower() or name.encode('utf-16-le') in content.lower():
                        found.append(name)
                print(f"Found names in binary search: {found}")
                
                # Let's write a regex to find ascii strings in the binary file to get a sample
                ascii_strings = re.findall(rb'[a-zA-Z\s]{4,30}', content)
                print(f"Total ASCII-like strings found in binary: {len(ascii_strings)}")
                # Print a few samples
                samples = [s.decode('ascii', errors='ignore') for s in ascii_strings[:20]]
                print("Samples:", samples)
            else:
                print("No sharedStrings file found in XLSB.")
    except Exception as e:
        print(f"Error: {e}")

import re
inspect_xlsb("d:\\Kitap1((Unsaved-312571150610416390)).xlsb")
inspect_xlsb("d:\\Kitap2((Unsaved-312571281026902844)).xlsb")
