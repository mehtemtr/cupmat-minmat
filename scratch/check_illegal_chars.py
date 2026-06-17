import os
import glob
import struct
import sys
import re
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

# Let's import reconstruct_database functions
sys.path.append(r"d:\2026 dünya\scratch")
import reconstruct_database

# We will run the student loader part of main()
print("Scanning for illegal characters...")
pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

ILLEGAL_CHARACTERS_RE = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]"
)

for fpath in sorted(ogr_files):
    folder_dir = os.path.dirname(fpath)
    try:
        with open(fpath, "rb") as f:
            header = f.read(10)
            content = f.read()
            
        record_size = 1496
        num_records = len(content) // record_size
        
        for i in range(num_records):
            start = i * record_size
            rec = content[start : start + record_size]
            std_no = rec[0:8].decode("ascii", errors="ignore").strip()
            if not std_no or not std_no.isdigit():
                continue
                
            name_len = rec[8]
            name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
            
            bp_len = rec[35]
            birthplace = rec[36 : 36 + bp_len].decode("cp857", errors="ignore").strip()
            
            # Check for illegal characters
            m1 = ILLEGAL_CHARACTERS_RE.search(name)
            m2 = ILLEGAL_CHARACTERS_RE.search(birthplace)
            
            if m1:
                print(f"File: {fpath} | Student: {std_no} | Name '{name}' has illegal char at index {m1.start()}: {repr(name[m1.start()])}")
            if m2:
                print(f"File: {fpath} | Student: {std_no} | Birthplace '{birthplace}' has illegal char at index {m2.start()}: {repr(birthplace[m2.start()])}")
    except Exception as e:
        pass
