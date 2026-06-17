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


# Load BABA.DAT names
baba_names = {}
with open(baba_path, "rb") as f:
    baba_content = f.read()
b_offset = 7
b_rec_size = 16
for i in range((len(baba_content) - b_offset) // b_rec_size):
    start = b_offset + i * b_rec_size
    rec = baba_content[start : start + b_rec_size]
    l = rec[0]
    if 1 <= l <= 15:
        baba_names[i] = decode_cp857(rec[1 : 1 + l])
    else:
        baba_names[i] = "-"

# Load ANA.DAT names
ana_names = {}
with open(ana_path, "rb") as f:
    ana_content = f.read()
a_offset = 15
a_rec_size = 16
for i in range((len(ana_content) - a_offset) // a_rec_size):
    start = a_offset + i * a_rec_size
    rec = ana_content[start : start + a_rec_size]
    l = rec[0]
    if 1 <= l <= 15:
        ana_names[i] = decode_cp857(rec[1 : 1 + l])
    else:
        ana_names[i] = "-"

# Read ELOGR.DAT records
with open(elogr_path, "rb") as f:
    header = f.read(10)
    elogr_content = f.read()

record_size = 1496
num_records = len(elogr_content) // record_size
print(f"Total students in ELOGR.DAT: {num_records}")

for i in range(min(15, num_records)):
    start = i * record_size
    rec = elogr_content[start : start + record_size]

    std_no = rec[0:8].decode("ascii", errors="ignore").strip()

    name_len = rec[8]
    name = decode_cp857(rec[9 : 9 + name_len])

    gender = chr(rec[34])

    bp_len = rec[35]
    birthplace = decode_cp857(rec[36 : 36 + bp_len])

    # Date of birth at 51..54 (day, month, year uint16)
    d, m, y = struct.unpack("<BBH", rec[51:55])
    birthdate = f"{d:02d}/{m:02d}/{y}"

    # Father name index at 57 (uint16)
    f_idx = struct.unpack("<H", rec[57:59])[0]
    father = baba_names.get(f_idx, f"Unknown ID {f_idx}")

    # Mother name index at 136 (uint16)
    m_idx = struct.unpack("<H", rec[136:138])[0]
    mother = ana_names.get(m_idx, f"Unknown ID {m_idx}")

    print(
        f"Student {i+1:2d} | No: {std_no:8s} | Name: {name:20s} | Gender: {gender} | Birth: {birthplace:10s} {birthdate} | Father: {father:10s} (ID {f_idx:3d}) | Mother: {mother:10s} (ID {m_idx:3d})"
    )
