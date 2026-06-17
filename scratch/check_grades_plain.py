import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")

filepath = r"d:\2026 dünya\farklı oku\90lar\scratch\master_transcripts.csv"

grades = set()
with open(filepath, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        val = row.get("final")
        if val:
            grades.add(val.strip())

print("Unique grades in 'final' column:")
print(sorted(list(grades)))
