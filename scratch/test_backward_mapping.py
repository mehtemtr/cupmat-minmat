import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"
baba_path = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"
ana_path = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"


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


# Load students
students = []
with open(elogr_path, "rb") as f:
    f.seek(10)  # skip header
    elogr_content = f.read()

record_size = 1496
num_records = len(elogr_content) // record_size
for i in range(num_records):
    start = i * record_size
    rec = elogr_content[start : start + record_size]
    std_no = rec[0:8].decode("ascii", errors="ignore").strip()
    name_len = rec[8]
    name = decode_cp857(rec[9 : 9 + name_len])
    students.append({"no": std_no, "name": name, "father": "-", "mother": "-"})

print(f"Loaded {len(students)} students.")

# Parse BABA.DAT
with open(baba_path, "rb") as f:
    baba_content = f.read()
b_offset = 7
b_rec_size = 16
b_num_records = (len(baba_content) - b_offset) // b_rec_size

print(f"Parsing {b_num_records} father records from BABA.DAT...")
mapped_fathers = 0
for i in range(b_num_records):
    start = b_offset + i * b_rec_size
    rec = baba_content[start : start + b_rec_size]
    l = rec[0]
    if 1 <= l <= 13:
        name = decode_cp857(rec[1 : 1 + l])
        # Student index at bytes 14..15
        std_idx = struct.unpack("<H", rec[14:16])[0]
        if 0 <= std_idx < len(students):
            students[std_idx]["father"] = name
            mapped_fathers += 1
            if mapped_fathers <= 15:
                print(
                    f"Father Rec {i:3d} | Father: '{name:12s}' -> maps to Student {std_idx:3d}: {students[std_idx]['name']} ({students[std_idx]['no']})"
                )

# Parse ANA.DAT
with open(ana_path, "rb") as f:
    ana_content = f.read()
a_offset = 15
a_rec_size = 16
a_num_records = (len(ana_content) - a_offset) // a_rec_size

print(f"\nParsing {a_num_records} mother records from ANA.DAT...")
mapped_mothers = 0
for i in range(a_num_records):
    start = a_offset + i * a_rec_size
    rec = ana_content[start : start + a_rec_size]
    l = rec[0]
    if 1 <= l <= 13:
        name = decode_cp857(rec[1 : 1 + l])
        # Student index at bytes 14..15
        std_idx = struct.unpack("<H", rec[14:16])[0]
        if 0 <= std_idx < len(students):
            students[std_idx]["mother"] = name
            mapped_mothers += 1
            if mapped_mothers <= 15:
                print(
                    f"Mother Rec {i:3d} | Mother: '{name:12s}' -> maps to Student {std_idx:3d}: {students[std_idx]['name']} ({students[std_idx]['no']})"
                )

print(f"\nTotal mapped fathers: {mapped_fathers}")
print(f"Total mapped mothers: {mapped_mothers}")
