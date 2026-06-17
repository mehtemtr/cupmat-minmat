import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"

with open(elogr_path, "rb") as f:
    f.seek(10)  # skip header
    elogr_content = f.read()

# Read student 1
rec = elogr_content[0:1496]

# Read semesters
semesters = []
for offset in range(200, 280, 4):
    year = struct.unpack("<H", rec[offset : offset + 2])[0]
    sem = rec[offset + 2]
    count = rec[offset + 3]
    if year != 0 or sem != 0 or count != 0:
        semesters.append({"year": year, "sem": sem, "count": count})

print("=== Semester Info ===")
for idx, s in enumerate(semesters):
    sem_name = "Güz" if s["sem"] == 1 else "Bahar"
    print(
        f"Semester {idx+1}: Year={s['year']}-{s['year']+1-1900} | Term={sem_name} | Course Count={s['count']}"
    )

print("\n=== Course Grades List ===")
courses_taken = []
for i in range(15):
    # Vize block
    v_off = 416 + i * 3
    v_id = struct.unpack("<H", rec[v_off : v_off + 2])[0]
    v_grade = rec[v_off + 2]

    # Final block
    f_off = 518 + i * 3
    f_id = struct.unpack("<H", rec[f_off : f_off + 2])[0]
    f_grade = rec[f_off + 2]

    if v_id != 0 or f_id != 0:
        courses_taken.append(
            {"index": i, "v_id": v_id, "v_grade": v_grade, "f_grade": f_grade}
        )
        print(
            f"Course index {i:2d} | Course ID: {v_id:4d} | Vize Score: {v_grade:3d} | Final Score: {f_grade:3d}"
        )

# Group them by semester counts
print("\n=== Grouped by Semesters ===")
course_idx = 0
for idx, s in enumerate(semesters):
    sem_name = "Güz" if s["sem"] == 1 else "Bahar"
    term_label = f"{s['year']}-{sem_name}"
    print(f"\nTerm: {term_label} ({s['count']} courses):")
    for _ in range(s["count"]):
        if course_idx < len(courses_taken):
            c = courses_taken[course_idx]
            print(
                f"  - Course ID: {c['v_id']} | Vize: {c['v_grade']} | Final: {c['f_grade']}"
            )
            course_idx += 1
        else:
            print("  - [Warning] No course record left for this count!")
