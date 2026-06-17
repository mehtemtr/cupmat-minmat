import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\NORMAL\ELBAH98L.DAT"

if os.path.exists(filePath):
    with open(filePath, "rb") as f:
        content = f.read()

    print(f"File size of ELBAH98L.DAT: {len(content)} bytes")
    if len(content) > 10:
        print("Header (hex):", content[:10].hex())
        # Let's inspect the first 300 bytes of data (offset 10 to 310)
        print("First 300 bytes of data (hex):")
        print(content[10:310].hex())
        print("\nFirst 300 bytes of data (text):")
        decoded = []
        for b in content[10:310]:
            char = chr(b)
            if b < 32 or b > 126:
                char = "."
            decoded.append(char)
        print("".join(decoded))
else:
    print(f"{filePath} not found.")
