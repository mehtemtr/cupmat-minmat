import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

print(f"File size: {len(content)}")

offset = 15
record_size = 16
num_records = (len(content) - offset) // record_size

print(f"=== Printing 20 records starting at offset {offset} ===")
for i in range(min(num_records, 120)):
    start = offset + i * record_size
    rec = content[start : start + record_size]
    l = rec[0]
    text = ""
    if 1 <= l <= 15:
        string_bytes = rec[1 : 1 + l]
        try:
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
            text = "".join(decoded)
        except:
            text = "(error)"

    extra_bytes = rec[1 + l :]
    if text.strip():
        print(
            f"Rec {i:3d} | Offset {start:4d} | Len {l:2d} | Mother Name: '{text.strip():15s}' | Extra bytes (hex): {extra_bytes.hex()}"
        )
