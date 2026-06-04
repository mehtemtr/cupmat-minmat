import os
import zipfile
import re
import xml.etree.ElementTree as ET
import sys

# Reconfigure stdout to support unicode prints on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def get_shared_strings_from_xlsx(file_path):
    strings = []
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            # Shared strings are typically in xl/sharedStrings.xml
            if 'xl/sharedStrings.xml' in zip_ref.namelist():
                xml_content = zip_ref.read('xl/sharedStrings.xml')
                # Parse XML using ElementTree
                root = ET.fromstring(xml_content)
                # Find all <t> tags which contain cell text
                # We need to account for namespace
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for t_node in root.findall('.//ns:t', ns):
                    if t_node.text:
                        strings.append(t_node.text)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return strings

def main():
    root_dir = "d:\\"
    
    # Dynamically find all .xlsx files in D:\
    xlsx_files = [f for f in os.listdir(root_dir) if f.lower().endswith('.xlsx')]

    for file_name in xlsx_files:
        full_path = os.path.join(root_dir, file_name)
        print(f"\nAnalyzing Excel file: {file_name}")
        strings = get_shared_strings_from_xlsx(full_path)
        print(f"Total unique strings found: {len(strings)}")
        
        # Check if it has any player-like names or keywords
        keywords = ["player", "squad", "manager", "hakan", "calhanoglu", "mbappe", "messi", "ronaldo", "kadro", "futbolcu"]
        found_keywords = [k for k in keywords if any(k in s.lower() for s in strings)]
        print(f"Found keywords: {found_keywords}")
        
        # Print a few samples of the strings
        print("Sample strings (first 20):")
        for s in strings[:20]:
            print(f"- {s}")

if __name__ == "__main__":
    main()
