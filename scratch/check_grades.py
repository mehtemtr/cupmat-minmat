import pandas as pd
import os

filePath = "d:/2026 dünya/90lar/scratch/master_transcripts.csv"

if os.path.exists(filePath):
    print("Reading unique grades...")
    grades = set()
    chunksize = 100000
    for chunk in pd.read_csv(filePath, usecols=['final'], chunksize=chunksize):
        for val in chunk['final'].dropna().unique():
            grades.add(str(val).strip())
            
    print("Unique values in 'final' column:")
    print(sorted(list(grades)))
else:
    print("File not found")
