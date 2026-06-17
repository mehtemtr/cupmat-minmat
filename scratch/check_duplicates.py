import os
import glob
import struct
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

print(f"Found {len(ogr_files)} OGR.DAT files.")

# A dictionary to count students in each file
file_summary = []
for fpath in sorted(ogr_files):
    fname = os.path.basename(fpath)
    # Get the parent folder and grandparent folder
    parts = fpath.split(os.sep)
    rel_path = os.sep.join(parts[-3:])
    
    try:
        with open(fpath, "rb") as f:
            header = f.read(10)
            content = f.read()
        
        record_size = 1496
        num_records = len(content) // record_size
        
        # Collect student numbers
        students = []
        for i in range(num_records):
            start = i * record_size
            rec = content[start : start + record_size]
            std_no = rec[0:8].decode("ascii", errors="ignore").strip()
            name_len = rec[8]
            name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
            if std_no:
                students.append((std_no, name))
                
        file_summary.append({
            "path": fpath,
            "rel_path": rel_path,
            "count": len(students),
            "students": students
        })
        print(f"File: {rel_path:40s} | Record Count: {len(students):4d}")
    except Exception as e:
        print(f"Error reading {fpath}: {e}")

# Let's see how many unique student numbers exist globally and where they are located
global_students = defaultdict(list)
for item in file_summary:
    for std_no, name in item["students"]:
        global_students[std_no].append(item["rel_path"])

print(f"\nTotal unique student numbers globally: {len(global_students)}")

# Let's count how many students are unique to a specific directory or group of directories
# We can check which directories represent the "master" set
# For example, if we take only NORMAL, GECE, GUNDUZ, IKI, MEZUN, do we cover everything?
target_dirs = ["NORMAL", "GECE", "GUNDUZ", "IKI", "MEZUN"]
master_students = set()
for item in file_summary:
    # Check if the path contains any of the target dirs
    parts = item["path"].upper().split(os.sep)
    if any(td in parts for td in target_dirs):
        for std_no, name in item["students"]:
            master_students.add(std_no)

print(f"Unique students in {target_dirs}: {len(master_students)}")

# Let's see if there are students in backup folders that are NOT in the target folders
missing = set(global_students.keys()) - master_students
print(f"Students in backups but missing from {target_dirs}: {len(missing)}")
if len(missing) > 0:
    print("Example missing students:")
    for m in list(missing)[:10]:
        print(f"  - {m}: found in {global_students[m]}")
