import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

print(f"File size: {len(content)}")

# Let's find the first few strings by scanning
# and print 10 records of size 16 starting from the alignment offset.
# From parse_baba_dat.py, we know offset 5751 is a length byte.
# 5751 % 16 = 7.
# So the alignment offset should be 7!
# Let's verify this by printing 20 records starting at offset 7.
offset = 7
record_size = 16
num_records = 20

print(f"=== Printing {num_records} records starting at offset {offset} ===")
for i in range(num_records):
    start = offset + i * record_size
    rec = content[start : start + record_size]
    # The first byte of the record should be the string length
    l = rec[0]
    string_bytes = rec[1 : 1 + l]
    text = ""
    try:
        # CP857 decoding
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
    print(
        f"Rec {i:3d} | Offset {start:4d} | Len {l:2d} | Name: '{text.strip():15s}' | Extra bytes (hex): {extra_bytes.hex()}"
    )
