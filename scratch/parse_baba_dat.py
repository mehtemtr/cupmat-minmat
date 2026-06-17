import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

filePath = r"d:\2026 dünya\farklı oku\1\ABDULLAH\MEZUN\NORMAL\BABA.DAT"

if not os.path.exists(filePath):
    print(f"Error: {filePath} not found.")
    sys.exit(1)

with open(filePath, "rb") as f:
    content = f.read()

print(f"File size: {len(content)} bytes")

# We want to find all ASCII strings of length > 2
# A string in QBasic files often starts with a 1-byte length prefix (len),
# followed by 'len' ASCII characters.
# Let's iterate through all possible string positions.
i = 0
while i < len(content):
    # Let's see if we can find a length prefix 'l' at index i
    l = content[i]
    if 2 <= l <= 40 and i + 1 + l <= len(content):
        # Check if the next 'l' bytes are printable CP857 characters
        chunk = content[i + 1 : i + 1 + l]
        is_printable = True
        for b in chunk:
            # Printable range + Turkish chars
            if not (
                32 <= b <= 126
                or b in [0x9E, 0x9F, 0x98, 0x8D, 0x87, 0x94, 0x92, 0x80]
            ):
                is_printable = False
                break
        if is_printable:
            # We found a potential string!
            # Let's decode it
            s = []
            for b in chunk:
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
                s.append(char)
            text = "".join(s)

            # Print details
            pre_bytes = content[max(0, i - 10) : i]
            print(
                f"Offset {i:4d} | Len {l:2d} | String: '{text.strip()}' | Pre-bytes (hex): {pre_bytes.hex()}"
            )
            # Skip the string length to continue search
            i += l + 1
            continue
    i += 1
