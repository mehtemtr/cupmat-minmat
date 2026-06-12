import pandas as pd
import os

dbPath = "d:/2026 dünya/90lar/scratch/master_student_database.csv"

if os.path.exists(dbPath):
    df = pd.read_csv(dbPath, low_memory=False)
    print(f"Total rows: {len(df)}")
    print(f"Unique student numbers: {df['number'].nunique()}")
    
    # Check duplicate rows based on all columns
    duplicates_all = df.duplicated().sum()
    print(f"Duplicate rows (all columns identical): {duplicates_all}")
    
    # Check duplicate rows based on number
    duplicates_number = df.duplicated(subset=['number']).sum()
    print(f"Duplicate rows based on student number: {duplicates_number}")
    
    # Print first 10 duplicates
    print("\nExample duplicates based on student number:")
    print(df[df.duplicated(subset=['number'], keep=False)].sort_values(by='number').head(10))
else:
    print("File not found")
