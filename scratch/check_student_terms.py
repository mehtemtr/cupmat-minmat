import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")

filepath = r"d:\2026 dünya\farklı oku\90lar\scratch\master_transcripts.csv"

term_courses = {}
with open(filepath, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        std_num = row.get("number", "").strip()
        if std_num == "94289023":
            term = row.get("term", "").strip()
            course = row.get("course_name", "").strip()
            grade = row.get("final", "").strip()
            if term not in term_courses:
                term_courses[term] = []
            term_courses[term].append(f"{course} (Grade: {grade})")

print("=== Terms and Courses for Student 94289023 ===")
for term, courses_list in sorted(term_courses.items()):
    print(f"\nTerm: '{term}' (Total: {len(courses_list)} courses):")
    # print first 5 courses
    for c in courses_list[:5]:
        print(f"  - {c}")
    if len(courses_list) > 5:
        print(f"  - ... and {len(courses_list) - 5} more")
