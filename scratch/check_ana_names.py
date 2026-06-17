import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

with open(filePath, "rb") as f:
    content = f.read()

female_names = [b"Fatma", b"Ayse", b"Hatice", b"Zeynep", b"Emine", b"Fadime"]

for name in female_names:
    idx = content.find(name)
    if idx != -1:
        print(f"Found '{name.decode()}' at offset {idx}")
        # print 50 bytes around it
        start = max(0, idx - 15)
        end = min(len(content), idx + 25)
        print(f"  Surrounding (hex): {content[start:end].hex()}")
        print(f"  Surrounding (text): {content[start:end]}")
