import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")
filepath = r"d:\2026 dünya\farklı oku\90lar\scratch\master_transcripts.csv"

seen = set()
with open(filepath, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get("number", "").strip() == "94289023":
            # deduplicate
            key = (row["term"], row["course_code"], row["course_name"], row["midterm"], row["final"])
            if key not in seen:
                seen.add(key)
                print(f"{row['term']:12s} | {row['course_code']:8s} | {row['course_name']:30s} | Midterm: {row['midterm']:5s} | Final: {row['final']:5s}")
