import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"
baba_path = r"d:\2026 dünya\farklı oku\1\NORMAL\BABA.DAT"
ana_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ANA.DAT"

def decode_cp857(byte_arr):
    decoded = []
    for b in byte_arr:
        char = chr(b)
        if b == 0x9E or b == 0x9F:
            char = "ş"
        elif b == 0x98 or b == 0x8D:
            char = "ı"
        elif b == 0x87:
            char = "ç"
        elif b == 0x94 or b == 0x92:
            char = "ö"
        elif b == 0x80:
            char = "Ç"
        decoded.append(char)
    return "".join(decoded).strip()

# 1. Load students
with open(elogr_path, "rb") as f:
    f.read(10)
    elogr_content = f.read()

record_size = 1496
num_students = len(elogr_content) // record_size
students = []
for i in range(num_students):
    start = i * record_size
    rec = elogr_content[start : start + record_size]
    std_no = rec[0:8].decode("ascii", errors="ignore").strip()
    name_len = rec[8]
    name = decode_cp857(rec[9 : 9 + name_len])
    students.append({"index": i, "no": std_no, "name": name})

print(f"Loaded {num_students} students from ELOGR.DAT.")

# 2. Compare BABA.DAT
if os.path.exists(baba_path):
    with open(baba_path, "rb") as f:
        baba_content = f.read()
    
    # Method A: Backward index (using bytes 14-15 of name records)
    method_a_fathers = {}
    header_offset = 7
    name_rec_size = 16
    num_name_recs = (len(baba_content) - header_offset) // name_rec_size
    
    # Let's extract all name records
    name_table = {}
    for idx in range(num_name_recs):
        start = header_offset + idx * name_rec_size
        rec = baba_content[start : start + name_rec_size]
        l = rec[0]
        if 1 <= l <= 13:
            name = decode_cp857(rec[1 : 1 + l])
            name_table[idx] = name
            # Method A maps using backward index at bytes 14-15
            std_idx = struct.unpack("<H", rec[14:16])[0]
            if 0 <= std_idx < num_students:
                method_a_fathers[std_idx] = name

    # Method B: Pointer array (16-bit little-endian pointers at header_offset)
    method_b_fathers = {}
    for i in range(num_students):
        ptr_offset = header_offset + i * 2
        if ptr_offset + 2 <= len(baba_content):
            name_idx = struct.unpack("<H", baba_content[ptr_offset : ptr_offset + 2])[0]
            if name_idx in name_table:
                method_b_fathers[i] = name_table[name_idx]
            else:
                method_b_fathers[i] = f"INVALID_PTR_{name_idx}"
                
    # Compare first 20 students
    print("\n--- Comparing Father Mappings for first 20 students ---")
    for i in range(min(num_students, 20)):
        std = students[i]
        fa = method_a_fathers.get(i, "-")
        fb = method_b_fathers.get(i, "-")
        print(f"Student {i:2d} | No: {std['no']} | Name: {std['name']:20s} | Method A: {fa:12s} | Method B: {fb:12s}")
else:
    print("BABA.DAT not found.")
