import pandas as pd
import os

filePath = "d:/2026 dünya/90lar/scratch/master_transcripts.csv"

if os.path.exists(filePath):
    print("Reading unique student numbers in transcripts...")
    students = set()
    chunksize = 100000
    for chunk in pd.read_csv(filePath, usecols=['number'], chunksize=chunksize, low_memory=False):
        for val in chunk['number'].dropna().unique():
            students.add(str(val).strip())
            
    print(f"Unique student numbers in transcripts: {len(students)}")
    
    # Also check master_student_database.csv
    dbPath = "d:/2026 dünya/90lar/scratch/master_student_database.csv"
    df_db = pd.read_csv(dbPath, usecols=['number'], low_memory=False)
    db_students = set(df_db['number'].dropna().astype(str).str.strip().unique())
    print(f"Unique student numbers in student database: {len(db_students)}")
    
    # Intersection
    intersect = students.intersection(db_students)
    print(f"Intersection (common students): {len(intersect)}")
else:
    print("File not found")
