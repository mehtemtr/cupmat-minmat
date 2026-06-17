import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\NORMAL\ELBAH98T.DAT"

if os.path.exists(filePath):
    with open(filePath, "rb") as f:
        content = f.read()

    print(f"File size: {len(content)} bytes")
    print("Header (hex):", content[:10].hex())

    # Let's search for student 94289023
    target = b"94289023"
    idx = content.find(target)
    if idx != -1:
        print(f"Found {target.decode()} at offset {idx}")
        # Print surrounding bytes to understand the record size
        print("Surrounding hex:", content[idx : idx + 100].hex())
        # Let's print the ASCII text
        decoded = []
        for b in content[idx : idx + 100]:
            char = chr(b)
            if b < 32 or b > 126:
                char = "."
            decoded.append(char)
        print("Text:", "".join(decoded))
    else:
        print("Student not found. Let's list the first 5 records.")
        # If record size is around 40 or 50 bytes, let's see:
        # Let's check common record sizes by looking at first 200 bytes
        print("First 200 bytes:")
        print(content[10:210].hex())
else:
    print(f"{filePath} not found.")
