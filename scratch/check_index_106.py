import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

# Read index 106
idx = 106
start = 7 + idx * 16
rec = content[start : start + 16]
l = rec[0]
string_bytes = rec[1 : 1 + l]
decoded = []
for b in string_bytes:
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
name = "".join(decoded)
print(f"BABA.DAT index {idx} (offset {start}): Name='{name}' | Raw={rec.hex()}")
