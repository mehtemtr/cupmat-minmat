import csv
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"
drs_path = r"d:\2026 dünya\farklı oku\1\NORMAL\DRS.DAT"
csv_path = r"d:\2026 dünya\farklı oku\90lar\scratch\master_transcripts.csv"

# Load courses catalog
courses = {}
with open(drs_path, "rb") as f:
    f.seek(10)
    drs_content = f.read()
rec_size = 46
for i in range(len(drs_content) // rec_size):
    rec = drs_content[i*rec_size : i*rec_size+rec_size]
    code = rec[0:6].decode("cp857", errors="ignore").strip()
    name = rec[6:36].decode("cp857", errors="ignore").strip()
    courses[i] = {"code": code, "name": name}

with open(elogr_path, "rb") as f:
    f.seek(10)
    elogr_content = f.read()

# Let's map student numbers to their records
students_rec = {}
record_size = 1496
for i in range(len(elogr_content) // record_size):
    start = i * record_size
    rec = elogr_content[start : start + record_size]
    std_no = rec[0:8].decode("ascii", errors="ignore").strip()
    students_rec[std_no] = rec

def get_slot(rec, slot):
    block = slot // 34
    block_slot = slot % 34
    
    if block == 0:
        v_start = 416
        f_start = 518
    elif block == 1:
        v_start = 632
        f_start = 740
    elif block == 2:
        v_start = 848
        f_start = 956
    elif block == 3:
        v_start = 1064
        f_start = 1172
    elif block == 4:
        v_start = 1280
        f_start = 1388
    else:
        return 0, 0, 0, 0
        
    if block_slot < 18:
        v_off = v_start + block_slot * 3
        f_off = f_start + block_slot * 3
    else:
        v_off = (v_start + 54) + (block_slot - 18) * 3
        f_off = (f_start + 54) + (block_slot - 18) * 3
        
    v_id = struct.unpack("<H", rec[v_off : v_off + 2])[0]
    v_grade = rec[v_off + 2]
    f_id = struct.unpack("<H", rec[f_off : f_off + 2])[0]
    f_grade = rec[f_off + 2]
    return v_id, v_grade, f_id, f_grade

# Let's read the CSV and match for Haydar Subasi
csv_rows = []
with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get("number", "").strip() == "94289023":
            csv_rows.append(row)

rec = students_rec["94289023"]

# Let's map active slots
print("=== Comparing Binary Slot Bytes to CSV Final Grades ===")
# We will match based on course code
for row in csv_rows:
    ccode = row["course_code"].strip()
    cname = row["course_name"].strip()
    csv_final = row["final"].strip()
    
    # Look for this course in the student's active slots
    found = False
    for slot in range(170):
        v_id, v_grade, f_id, f_grade = get_slot(rec, slot)
        # Check if vize course or final course matches the ccode
        v_c = courses.get(v_id, {"code": ""})
        f_c = courses.get(f_id, {"code": ""})
        
        if v_c["code"] == ccode:
            print(f"Course {ccode:6s} | CSV: {csv_final:15s} | Binary Vize Slot {slot:3d} Grade Byte: {v_grade:3d}")
            found = True
        if f_c["code"] == ccode:
            print(f"Course {ccode:6s} | CSV: {csv_final:15s} | Binary Final Slot {slot:3d} Grade Byte: {f_grade:3d}")
            found = True
            
    if not found:
        print(f"Course {ccode:6s} | CSV: {csv_final:15s} | Not found in slots")
