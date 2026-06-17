import sys
import csv
from collections import Counter

filepath = r"d:\2026 dünya\farklı oku\90lar\scratch\master_student_database.csv"

fathers = []
mothers = []

with open(filepath, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        f_val = row.get("father", "").strip()
        m_val = row.get("anne_adi", "").strip()
        if f_val:
            fathers.append(f_val)
        if m_val:
            mothers.append(m_val)

father_counts = Counter(fathers)
mother_counts = Counter(mothers)

print("=== FATHER NAME STATISTICS ===")
print("Total rows with father name:", len(fathers))
print("Unique father names:", len(father_counts))
print("Top 30 most frequent father names:")
for val, count in father_counts.most_common(30):
    print(f"  - '{val}': {count} times")

print("\n=== MOTHER NAME STATISTICS ===")
print("Total rows with mother name:", len(mothers))
print("Unique mother names:", len(mother_counts))
print("Top 30 most frequent mother names:")
for val, count in mother_counts.most_common(30):
    print(f"  - '{val}': {count} times")
