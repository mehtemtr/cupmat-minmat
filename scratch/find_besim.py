import csv
import sys

sys.stdout.reconfigure(encoding="utf-8")

transcript_path = r"d:\2026 dünya\farklı oku\90lar\scratch\master_transcripts.csv"

# Search for "Besim" in transcripts
print("=== Searching for 'Besim' in master_transcripts.csv ===")
count = 0
with open(transcript_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        for col, val in row.items():
            if "besim" in str(val).lower():
                count += 1
                print(f"Row {idx+1} | Col {col}: {val}")
                if count >= 10:
                    break
        if count >= 10:
            break
if count == 0:
    print("No matches for 'Besim' in transcripts.")
