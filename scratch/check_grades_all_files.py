import os
import glob
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

# Find all files matching *OGR.DAT
pattern = os.path.join(r"d:\2026 dünya\farklı oku", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

target_no = b"94289023"

for fpath in ogr_files:
    try:
        with open(fpath, "rb") as f:
            content = f.read()

        idx = content.find(target_no)
        if idx != -1:
            print(f"=== Student {target_no.decode()} in {fpath} ===")
            # Get record
            # We know it starts at idx
            record = content[idx : idx + 1496]
            print("Vize block grades:")
            for i in range(15):
                offset = 416 + i * 3
                course_id = struct.unpack("<H", record[offset : offset + 2])[0]
                grade_val = record[offset + 2]
                if course_id != 0:
                    print(f"  Course ID {course_id:4d}: Grade = {grade_val}")
            print("-" * 50)
    except Exception as e:
        print(f"Error reading {fpath}: {e}")
