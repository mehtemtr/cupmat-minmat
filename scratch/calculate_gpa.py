import pandas as pd
import os
import re
import sys

student_csv = "d:/2026 dünya/90lar/scratch/master_student_database.csv"
transcript_csv = "d:/2026 dünya/90lar/scratch/master_transcripts.csv"
drs_ddt = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DDT"

print("Starting GPA calculation script...")

# 1. Parse DRS.DDT for credits mapping
course_credits = {}
if os.path.exists(drs_ddt):
    with open(drs_ddt, 'rb') as f:
        content = f.read()
    record_size = 46
    header_size = 10
    num_records = (len(content) - header_size) // record_size
    for i in range(num_records):
        start = header_size + i * record_size
        record = content[start:start+record_size]
        name_len = record[3]
        if name_len > 30 or name_len == 0:
            name_len = 25
        try:
            name_raw = record[4:4+name_len].decode('cp857', errors='ignore').strip()
            name = name_raw.upper()
        except:
            name = ""
        credits = record[32]
        if name:
            course_credits[name] = credits
    print(f"Loaded {len(course_credits)} course credit mappings from DRS.DDT.")
else:
    print("Warning: DRS.DDT not found, using default 3 credits for all courses.")

# Helper to normalize strings for matching
def normalize_text(text):
    if not isinstance(text, str):
        return ""
    text = text.upper()
    # Replace Turkish chars
    translation = str.maketrans("İIŞŞĞĞÇÇÖÖÜÜıışşğğççööüü", "IISSGGCCOOUUiissggccoouu")
    text = text.translate(translation)
    # Remove non-alphanumeric
    text = re.sub(r'[^A-Z0-9]', '', text)
    return text

# Create normalized credits dict
norm_credits = {normalize_text(k): v for k, v in course_credits.items() if normalize_text(k)}

# 2. Grade mapping function
GRADE_POINTS = {
    'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5, 'CC': 2.0,
    'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0
}

def get_grade_point(grade_str):
    if not isinstance(grade_str, str):
        return None
    g = grade_str.strip().upper()
    
    # Check letter grades
    if g in GRADE_POINTS:
        return GRADE_POINTS[g]
        
    # Check if there is a number at the beginning (e.g. "65 (A)" or "60 (<)" or just "75")
    match = re.match(r'^(\d+)', g)
    if match:
        score = int(match.group(1))
        # Standard university score to grade point mapping
        if score >= 90: return 4.0
        elif score >= 85: return 3.5
        elif score >= 80: return 3.0
        elif score >= 75: return 2.5
        elif score >= 70: return 2.0
        elif score >= 65: return 1.5
        elif score >= 60: return 1.0
        elif score >= 50: return 0.5
        else: return 0.0
        
    return None # Exclude other non-credit grades (MU, S, BS, etc.)

# 3. Process transcripts chunk by chunk to calculate GPA for each student
print("Processing transcripts to calculate GPAs...")
student_stats = {} # number -> {total_grade_points, total_credits}

chunksize = 100000
for chunk in pd.read_csv(transcript_csv, usecols=['number', 'course_name', 'final'], chunksize=chunksize, low_memory=False):
    for idx, row in chunk.iterrows():
        std_num = row['number']
        course = row['course_name']
        final_grade = row['final']
        
        gp = get_grade_point(final_grade)
        if gp is None:
            continue # Skip non-graded or invalid entries
            
        # Get credits
        norm_name = normalize_text(course)
        credits = norm_credits.get(norm_name, 3) # default 3 credits
        
        if std_num not in student_stats:
            student_stats[std_num] = {'points': 0.0, 'credits': 0.0}
            
        student_stats[std_num]['points'] += gp * credits
        student_stats[std_num]['credits'] += credits

# Calculate final GPAs
print("Calculating final GPAs...")
student_gpa = {}
for std_num, stats in student_stats.items():
    if stats['credits'] > 0:
        student_gpa[std_num] = round(stats['points'] / stats['credits'], 2)

print(f"Calculated GPAs for {len(student_gpa)} students.")

# Print some statistics
gpa_values = list(student_gpa.values())
if gpa_values:
    avg_gpa = sum(gpa_values) / len(gpa_values)
    print(f"Average GPA: {avg_gpa:.2f}")
    print(f"Max GPA: {max(gpa_values):.2f}")
    print(f"Min GPA: {min(gpa_values):.2f}")
    
# Let's save a temporary GPA map to be used by the Excel generator script
import json
with open("d:/2026 dünya/scratch/student_gpa.json", "w") as f:
    # Convert keys to strings for JSON safety
    json.dump({str(k): v for k, v in student_gpa.items()}, f)
print("Saved GPA mapping to scratch/student_gpa.json")
