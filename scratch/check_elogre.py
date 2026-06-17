import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:/2026 dünya/farklı oku/1/NORMAL/ELOGRE.DAT"

if os.path.exists(filePath):
    with open(filePath, "rb") as f:
        content = f.read()
    print("ELOGRE.DAT file size:", len(content))
    if len(content) > 10:
        print("Header (hex):", content[:10].hex())
        print("First 200 bytes as hex:")
        print(content[10:210].hex())
        print("First 200 bytes as text:")
        decoded = []
        for b in content[10:210]:
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
    print("ELOGRE.DAT not found in NORMAL directory.")
