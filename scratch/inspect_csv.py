import pandas as pd
import os

files = [
    "d:/2026 dünya/90lar/scratch/master_student_database.csv",
    "d:/2026 dünya/90lar/scratch/master_transcripts.csv"
]

for f in files:
    if os.path.exists(f):
        print(f"=== File: {f} ===")
        size_mb = os.path.getsize(f) / (1024 * 1024)
        print(f"Size: {size_mb:.2f} MB")
        
        # Read first few lines to find number of rows or parse head
        try:
            df = pd.read_csv(f, nrows=5)
            print("Columns:", list(df.columns))
            print("First 2 rows:\n", df.head(2))
            
            # Count rows
            num_rows = sum(1 for _ in open(f, 'r', encoding='utf-8', errors='ignore')) - 1
            print(f"Total Rows: {num_rows}")
        except Exception as e:
            print("Error reading:", e)
        print()
    else:
        print(f"File not found: {f}")
