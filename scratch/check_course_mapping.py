import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

drs_path = r"d:\2026 dünya\farklı oku\1\NORMAL\DRS.DAT"
elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"


def decode_cp857(byte_arr):
    decoded = []
    for b in byte_arr:
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
    return "".join(decoded).strip()


# Load all courses from DRS.DAT
# Each record is 46 bytes:
# Bytes 0-5: Code
# Bytes 6-35: Name (30 bytes)
# Bytes 36-45: metadata
courses = {}
if os.path.exists(drs_path):
    with open(drs_path, "rb") as f:
        f.seek(10)  # skip header
        drs_content = f.read()

    rec_size = 46
    num_courses = len(drs_content) // rec_size
    for i in range(num_courses):
        start = i * rec_size
        rec = drs_content[start : start + rec_size]
        code = rec[0:6].decode("cp857", errors="ignore").strip()
        name = decode_cp857(rec[6:36])
        courses[i] = {"code": code, "name": name}
    print(f"Loaded {len(courses)} courses from DRS.DAT.")
else:
    print("DRS.DAT not found.")

# Read student 94289023's grades from ELOGR.DAT
if os.path.exists(elogr_path):
    with open(elogr_path, "rb") as f:
        f.seek(10)  # skip header
        elogr_content = f.read()

    # Student 1 (index 0)
    rec = elogr_content[0:1496]

    print("\n=== Direct mapping from ELOGR.DAT and DRS.DAT ===")
    print("Vize block (offset 416):")
    for i in range(15):
        offset = 416 + i * 3
        course_id = struct.unpack("<H", rec[offset : offset + 2])[0]
        grade_val = rec[offset + 2]
        if course_id != 0:
            course = courses.get(
                course_id, {"code": "???", "name": f"Unknown ID {course_id}"}
            )
            print(
                f"  Course ID {course_id:4d} | Code: {course['code']:8s} | Name: {course['name']:30s} | Grade score: {grade_val}"
            )

    print("\nFinal block (offset 518):")
    for i in range(15):
        offset = 518 + i * 3
        course_id = struct.unpack("<H", rec[offset : offset + 2])[0]
        grade_val = rec[offset + 2]
        if course_id != 0:
            course = courses.get(
                course_id, {"code": "???", "name": f"Unknown ID {course_id}"}
            )
            print(
                f"  Course ID {course_id:4d} | Code: {course['code']:8s} | Name: {course['name']:30s} | Grade score: {grade_val}"
            )
