import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")
filepath = r"d:\2026 dünya\farklı oku\90lar\scratch\master_student_database.csv"

count = 0
with open(filepath, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        father = row.get("father", "").strip()
        if father == "Besim":
            count += 1
            print(
                "Match #",
                count,
                "| Folder:",
                row.get("folder"),
                "| No:",
                row.get("number"),
                "| Name:",
                row.get("name"),
                "| Father:",
                father,
            )
            if count >= 10:
                break
