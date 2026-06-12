import pandas as pd
import os

filePath = "d:/2026 dünya/90lar/scratch/master_transcripts.csv"

if os.path.exists(filePath):
    # Read in chunks to find department distribution
    print("Reading departments...")
    dept_counts = {}
    chunksize = 100000
    for chunk in pd.read_csv(filePath, usecols=['department'], chunksize=chunksize):
        for dept in chunk['department'].dropna():
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            
    print("Row count per department in master_transcripts.csv:")
    for dept, count in sorted(dept_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {dept}: {count} rows")
else:
    print("File not found")
