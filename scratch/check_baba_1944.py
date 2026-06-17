import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"

with open(filePath, "rb") as f:
    f.seek(1920)
    data = f.read(100)

print("Bytes 1920-2020 as hex:")
print(data.hex())

print("\nBytes 1920-2020 as text:")
decoded = []
for b in data:
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
