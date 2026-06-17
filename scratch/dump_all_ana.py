import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

offset = 0
record_size = 16
num_records = len(content) // record_size

print(f"Total records in ANA.DAT: {num_records}")

valid_names = 0
for i in range(num_records):
    start = offset + i * record_size
    rec = content[start : start + record_size]
    l = rec[0]
    if 2 <= l <= 15:
        string_bytes = rec[1 : 1 + l]
        is_printable = True
        for b in string_bytes:
            if not (
                32 <= b <= 126
                or b in [0x9E, 0x9F, 0x98, 0x8D, 0x87, 0x94, 0x92, 0x80]
            ):
                is_printable = False
                break
        if is_printable:
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
            text = "".join(decoded).strip()
            valid_names += 1
            print(
                f"Index {i:3d} (Offset {start:4d}) | Name: '{text}' | Raw bytes: {rec.hex()}"
            )

print(f"Total valid names parsed: {valid_names}")
