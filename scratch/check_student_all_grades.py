import os
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"
drs_path = r"d:\2026 dünya\farklı oku\1\NORMAL\DRS.DAT"

# Load courses catalog
courses = {}
with open(drs_path, "rb") as f:
    f.seek(10)
    drs_content = f.read()
rec_size = 46
for i in range(len(drs_content) // rec_size):
    start = i * rec_size
    rec = drs_content[start : start + rec_size]
    code = rec[0:6].decode("cp857", errors="ignore").strip()
    name = rec[6:36].decode("cp857", errors="ignore").strip()
    courses[i] = {"code": code, "name": name}

with open(elogr_path, "rb") as f:
    f.seek(10)
    elogr_content = f.read()

# Let's write a parser that dumps student courses
record_size = 1496


def parse_student(std_idx):
    start = std_idx * record_size
    rec = elogr_content[start : start + record_size]

    std_no = rec[0:8].decode("ascii", errors="ignore").strip()
    name_len = rec[8]
    name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()

    print(f"\n=== Student {std_idx+1}: {name} ({std_no}) ===")

    # Read semesters
    semesters = []
    # Semester counts/header starts at offset 320 or 336
    # Let's read the number of semesters
    num_sems = struct.unpack("<H", rec[320:322])[0]
    print(f"Number of semesters: {num_sems}")

    for s_idx in range(num_sems):
        off = 336 + s_idx * 4
        year = struct.unpack("<H", rec[off : off + 2])[0]
        sem = rec[off + 2]
        count = rec[off + 3]
        sem_name = "Güz" if sem == 1 else "Bahar"
        semesters.append(
            {
                "year": year,
                "sem": sem,
                "sem_name": sem_name,
                "count": count,
                "label": f"{year}-{sem_name}",
            }
        )
        print(
            f"  Sem {s_idx+1}: {year}-{sem_name} | Course count: {count} courses"
        )

    # Now let's collect courses from the student record
    # We suspect courses are stored sequentially in slots
    # Slot 0 to 33:
    # Vize is at 416 + slot * 3 (Course ID: 2 bytes, Vize grade: 1 byte)
    # Final is at 518 + slot * 3 (Course ID: 2 bytes, Final grade: 1 byte)
    # Slot 34 to 67:
    # Vize is at 632 + (slot-34) * 3
    # Final is at 740? Let's check!
    # Wait, let's write a function to get slot course
    def get_course_at_slot(slot):
        if slot < 34:
            v_off = 416 + slot * 3
            f_off = 518 + slot * 3
        else:
            v_off = 632 + (slot - 34) * 3
            f_off = 740 + (slot - 34) * 3  # let's assume Final block 2 is at 740

        if v_off + 3 <= record_size and f_off + 3 <= record_size:
            v_id = struct.unpack("<H", rec[v_off : v_off + 2])[0]
            v_grade = rec[v_off + 2]
            f_id = struct.unpack("<H", rec[f_off : f_off + 2])[0]
            f_grade = rec[f_off + 2]
            return v_id, v_grade, f_grade
        return 0, 0, 0

    # Read all courses sequentially
    all_courses = []
    for slot in range(100):
        c_id, v_grade, f_grade = get_course_at_slot(slot)
        if c_id != 0:
            course = courses.get(
                c_id, {"code": f"Unknown {c_id}", "name": "Unknown"}
            )
            all_courses.append(
                {
                    "slot": slot,
                    "id": c_id,
                    "code": course["code"],
                    "name": course["name"],
                    "vize": v_grade,
                    "final": f_grade,
                }
            )

    print(f"Total courses read: {len(all_courses)}")

    # Map courses to semesters
    course_idx = 0
    for sem in semesters:
        print(f"\n  Semester: {sem['label']} ({sem['count']} courses):")
        for _ in range(sem["count"]):
            if course_idx < len(all_courses):
                c = all_courses[course_idx]
                print(
                    f"    - [{c['code']}] {c['name']:30s} | Vize: {c['vize']:3d} | Final: {c['final']:3d}"
                )
                course_idx += 1
            else:
                print("    - [Warning] No course records left!")


parse_student(0)
parse_student(1)
