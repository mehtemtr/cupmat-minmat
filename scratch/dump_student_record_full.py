import os
import sys
import struct

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"
drs_path = r"d:\2026 dünya\farklı oku\1\NORMAL\DRS.DAT"

# Load courses catalog
courses = {}
if os.path.exists(drs_path):
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

record_size = 1496

def get_chunk_slots(rec, year_idx, is_bahar):
    # Determine which block and start offsets
    # year_idx = 0 (Year 1): Block 1 Vize
    # year_idx = 1 (Year 2): Block 1 Final
    # year_idx = 2 (Year 3): Block 2 Vize
    # year_idx = 3 (Year 4): Block 2 Final
    # year_idx = 4 (Year 5): Block 3 Vize
    # year_idx = 5 (Year 6): Block 3 Final
    
    is_final_block = (year_idx % 2) == 1
    block_num = year_idx // 2
    
    if block_num == 0:
        v_start = 416
        f_start = 518
    elif block_num == 1:
        v_start = 632
        f_start = 740
    elif block_num == 2:
        v_start = 848
        f_start = 956
    elif block_num == 3:
        v_start = 1064
        f_start = 1172
    elif block_num == 4:
        v_start = 1280
        f_start = 1388
    else:
        return []
        
    start_off = f_start if is_final_block else v_start
    if is_bahar:
        # Second chunk (16 slots, starting 54 bytes after first chunk)
        offsets = [start_off + 54 + idx * 3 for idx in range(16)]
    else:
        # First chunk (18 slots)
        offsets = [start_off + idx * 3 for idx in range(18)]
        
    slots_data = []
    for off in offsets:
        if off + 3 <= len(rec):
            cid = struct.unpack("<H", rec[off : off + 2])[0]
            grade = rec[off + 2]
            if cid != 0:
                slots_data.append((off, cid, grade))
    return slots_data

def parse_student_transcripts(std_idx):
    start = std_idx * record_size
    rec = elogr_content[start : start + record_size]
    std_no = rec[0:8].decode("ascii", errors="ignore").strip()
    name_len = rec[8]
    name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
    
    print(f"\n==================== Student {std_idx+1}: {name} ({std_no}) ====================")
    num_sems = struct.unpack("<H", rec[334:336])[0]
    print(f"Number of semesters: {num_sems}")
    
    # Read semesters metadata
    semesters = []
    for s_idx in range(num_sems):
        off = 336 + s_idx * 4
        year = struct.unpack("<H", rec[off : off + 2])[0]
        sem = rec[off + 2]
        count = rec[off + 3]
        sem_name = "Güz" if sem == 1 else "Bahar"
        semesters.append({"year": year, "sem": sem_name, "count": count})
        
    # Extract courses for each semester
    for s_idx, sem in enumerate(semesters):
        print(f"\n  Semester {s_idx+1}: {sem['year']} - {sem['sem']} ({sem['count']} courses expected)")
        # Map semester index to block layout:
        # Semester 1: Year 1 Güz -> year_idx = 0, is_bahar = False
        # Semester 2: Year 1 Bahar -> year_idx = 0, is_bahar = True
        # Semester 3: Year 2 Güz -> year_idx = 1, is_bahar = False
        # Semester 4: Year 2 Bahar -> year_idx = 1, is_bahar = True
        # etc.
        year_idx = s_idx // 2
        is_bahar = (s_idx % 2) == 1
        
        chunk_courses = get_chunk_slots(rec, year_idx, is_bahar)
        print(f"    Found {len(chunk_courses)} active courses in chunk:")
        for off, cid, g in chunk_courses:
            c = courses.get(cid, {"code": "???", "name": f"Unknown {cid}"})
            print(f"      Offset {off} | ID {cid:3d} ({c['code']}): {c['name']} | Grade: {g}")

parse_student_transcripts(0)
parse_student_transcripts(1)
