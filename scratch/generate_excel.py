import pandas as pd
import os
import sys
import re
import json

student_csv = "d:/2026 dünya/90lar/scratch/master_student_database.csv"
transcript_csv = "d:/2026 dünya/90lar/scratch/master_transcripts.csv"
gpa_json = "d:/2026 dünya/scratch/student_gpa.json"
output_xlsx = "d:/2026 dünya/90lar/ogrenci_ve_transkript_veritabani.xlsx"

print("Starting Excel generation script (with GPAs and cleaning)...")

if not os.path.exists(student_csv) or not os.path.exists(transcript_csv):
    print("Error: Input CSV files not found!")
    sys.exit(1)

# XML illegal characters regex
ILLEGAL_CHARACTERS_RE = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]"
)

def clean_illegal_chars(val):
    if isinstance(val, str):
        return ILLEGAL_CHARACTERS_RE.sub("", val)
    return val

def clean_dataframe(df):
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).apply(clean_illegal_chars)
    return df

# Load GPA mapping
gpa_map = {}
if os.path.exists(gpa_json):
    with open(gpa_json, 'r') as f:
        gpa_map = json.load(f)
    print(f"Loaded {len(gpa_map)} GPA records.")
else:
    print("Warning: student_gpa.json not found!")

# Initialize Excel Writer
print("Initializing Excel Writer...")
with pd.ExcelWriter(output_xlsx, engine='openpyxl') as writer:
    # 1. Write Students sheet (with GPA column)
    print("Reading and cleaning 'Öğrenciler' sheet...")
    df_students = pd.read_csv(student_csv)
    
    # Map GPA column using the student number
    # Convert student number to string for matching keys in JSON
    print("Mapping GPAs to student records...")
    df_students['not_ortalamasi'] = df_students['number'].astype(str).str.strip().map(gpa_map)
    # Fill NaN GPAs with "-" (e.g. if student took no credit courses or has no transcripts)
    df_students['not_ortalamasi'] = df_students['not_ortalamasi'].fillna("-")
    
    df_students = clean_dataframe(df_students)
    
    df_students.to_excel(writer, sheet_name='Öğrenciler', index=False)
    print(f"Written {len(df_students)} student records with GPA column.")
    
    # Free memory
    del df_students
    
    # 2. Write Transcript sheets by department
    print("Reading transcripts CSV...")
    df_transcripts = pd.read_csv(transcript_csv, low_memory=False)
    print(f"Loaded {len(df_transcripts)} transcript rows.")
    
    # Clean the entire transcripts dataframe first
    print("Cleaning transcripts dataframe...")
    df_transcripts = clean_dataframe(df_transcripts)
    
    departments = df_transcripts['department'].dropna().unique()
    print("Unique departments found:", list(departments))
    
    for dept in sorted(departments):
        sheet_name = f"Transkript_{dept}"
        print(f"Filtering and writing sheet: {sheet_name}...")
        df_dept = df_transcripts[df_transcripts['department'] == dept]
        df_dept.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f"  - Written {len(df_dept)} rows.")
        del df_dept

print("\nAll sheets written successfully!")
print(f"Combined database saved to: {output_xlsx}")
