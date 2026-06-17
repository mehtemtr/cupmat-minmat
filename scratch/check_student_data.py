import os
import glob
import sys

sys.stdout.reconfigure(encoding="utf-8")

# Find all files ending in OGR.DAT (case-insensitive)
pattern = os.path.join(r"d:\2026 dünya\farklı oku", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

target_no = b"96222009"

for fpath in ogr_files:
    try:
        with open(fpath, "rb") as f:
            content = f.read()

        # Search for the student number in the file
        idx = content.find(target_no)
        if idx != -1:
            print(f"=== Found {target_no.decode()} in {fpath} ===")
            print(f"Byte offset: {idx}")
            # Determine record offset and dump
            # QBasic files usually have a 10-byte header, let's see where the record starts
            # If records are 1496 bytes, let's see if (idx - 10) % 1496 == 0
            is_aligned = (idx - 10) % 1496 == 0
            print(f"Aligned with 1496-byte record: {is_aligned}")

            # Dump 120 bytes starting from idx
            record = content[idx : idx + 120]
            print("Hex dump:")
            print(record.hex())
            print("Ascii representation:")
            decoded = []
            for b in record:
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
            print("-" * 60)
    except Exception as e:
        print(f"Error reading {fpath}: {e}")
