import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

baba_path = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"
ana_path = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\ANA.DAT"

if os.path.exists(baba_path):
    with open(baba_path, "rb") as f:
        baba_content = f.read()
    print("BABA.DAT size:", len(baba_content))
    # Print the first 200 bytes as hex and cp857 text
    print("BABA.DAT Header + First 200 bytes as text:")
    decoded = []
    for b in baba_content[:300]:
        char = chr(b)
        if b == 0x9E or b == 0x9F:
            char = "ş"
        elif b == 0x98 or b == 0x8D:
            char = "ı"
        elif b == 0x87:
            char = "ç"
        elif b == 0x94 or b == 0x92:
            char = "ö"
        elif b < 32 or b > 126:
            char = "."
        decoded.append(char)
    print("".join(decoded))
else:
    print("BABA.DAT not found.")

if os.path.exists(ana_path):
    with open(ana_path, "rb") as f:
        ana_content = f.read()
    print("ANA.DAT size:", len(ana_content))
    # Print the first 200 bytes as hex and cp857 text
    print("ANA.DAT Header + First 200 bytes as text:")
    decoded = []
    for b in ana_content[:300]:
        char = chr(b)
        if b == 0x9E or b == 0x9F:
            char = "ş"
        elif b == 0x98 or b == 0x8D:
            char = "ı"
        elif b == 0x87:
            char = "ç"
        elif b == 0x94 or b == 0x92:
            char = "ö"
        elif b < 32 or b > 126:
            char = "."
        decoded.append(char)
    print("".join(decoded))
else:
    print("ANA.DAT not found.")
