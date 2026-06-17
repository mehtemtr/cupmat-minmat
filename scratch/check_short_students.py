import os
import glob
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

# Let's search for OGR.DAT files in "d:\2026 dünya\farklı oku\1"
pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

test_nos = ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010"]

print("Searching for students in raw DAT files...")
for fpath in sorted(ogr_files):
    folder_dir = os.path.dirname(fpath)
    baba_path = os.path.join(folder_dir, "BABA.DAT")
    ana_path = os.path.join(folder_dir, "ANA.DAT")
    
    try:
        with open(fpath, "rb") as f:
            f.read(10)
            content = f.read()
        rec_size = 1496
        num_records = len(content) // rec_size
        
        # Load father/mother mappings if they exist
        father_mapping = {}
        if os.path.exists(baba_path):
            with open(baba_path, "rb") as f:
                b_content = f.read()
            offset = 7
            b_rec_size = 16
            b_num_recs = (len(b_content) - offset) // b_rec_size
            for idx in range(b_num_recs):
                start = offset + idx * b_rec_size
                rec = b_content[start : start + b_rec_size]
                l = rec[0]
                if 1 <= l <= 13:
                    name = rec[1 : 1 + l].decode("cp857", errors="ignore").strip()
                    std_idx = struct.unpack("<H", rec[14:16])[0]
                    if 0 <= std_idx < num_records:
                        father_mapping[std_idx] = (idx, name)
                        
        mother_mapping = {}
        if os.path.exists(ana_path):
            with open(ana_path, "rb") as f:
                a_content = f.read()
            offset = 15
            a_rec_size = 16
            a_num_recs = (len(a_content) - offset) // a_rec_size
            for idx in range(a_num_recs):
                start = offset + idx * a_rec_size
                rec = a_content[start : start + a_rec_size]
                l = rec[0]
                if 1 <= l <= 13:
                    name = rec[1 : 1 + l].decode("cp857", errors="ignore").strip()
                    std_idx = struct.unpack("<H", rec[14:16])[0]
                    if 0 <= std_idx < num_records:
                        mother_mapping[std_idx] = (idx, name)
                        
        for i in range(num_records):
            start = i * rec_size
            rec = content[start : start + rec_size]
            std_no = rec[0:8].decode("ascii", errors="ignore").strip()
            if std_no in test_nos:
                name_len = rec[8]
                name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
                father_info = father_mapping.get(i, ("-", "-"))
                mother_info = mother_mapping.get(i, ("-", "-"))
                print(f"File: {os.path.basename(fpath)} | Index {i:3d} | Student No: {std_no} | Name: {name}")
                print(f"  Mapped Father: Rec {father_info[0]} -> Name: '{father_info[1]}'")
                print(f"  Mapped Mother: Rec {mother_info[0]} -> Name: '{mother_info[1]}'")
    except Exception as e:
        print(f"Error in {fpath}: {e}")
