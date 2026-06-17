import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

print(f"ANA.DAT file size: {len(content)}")

# Let's search for the alignment offset and record size of ANA.DAT
# We can find all possible printables by scanning lengths
for r_size in [16, 18, 20]:
    for off in range(16):
        # Count how many valid names we can parse in first 50 records
        valid = 0
        limit = min((len(content) - off) // r_size, 50)
        for i in range(limit):
            start = off + i * r_size
            rec = content[start : start + r_size]
            if len(rec) == 0:
                continue
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
                    valid += 1
        if valid > 10:
            print(
                f"Candidate found: record_size={r_size}, offset={off}, valid_count={valid} out of {limit}"
            )
            # Print first 5 valid names
            printed = 0
            for i in range(limit):
                start = off + i * r_size
                rec = content[start : start + r_size]
                l = rec[0]
                if 2 <= l <= 15:
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
                        decoded.append(char)
                    name = "".join(decoded)
                    print(
                        f"  Rec {i:3d} (Offset {start:4d}) | Name: '{name}'"
                    )
                    printed += 1
                    if printed >= 5:
                        break
