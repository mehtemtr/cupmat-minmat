import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

# Inspect record 101 (offset 1616)
start = 1616
rec = content[start : start + 16]
print("Record 101 raw bytes (hex):", rec.hex())
l = rec[0]
print("Length byte:", l)
string_bytes = rec[1 : 1 + l]
print("String bytes (hex):", string_bytes.hex())
for idx, b in enumerate(string_bytes):
    in_range = 32 <= b <= 126
    in_list = b in [0x9E, 0x9F, 0x98, 0x8D, 0x87, 0x94, 0x92, 0x80]
    print(
        f"  Byte {idx:2d}: 0x{b:02x} ({b:3d}) | char: '{chr(b)}' | in_range: {in_range} | in_list: {in_list}"
    )
