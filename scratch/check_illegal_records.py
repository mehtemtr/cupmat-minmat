import sys
import os
import glob
import re
import struct
from collections import defaultdict
from openpyxl.cell.cell import Cell

# Set encoding to utf-8 for safe console printing
sys.stdout.reconfigure(encoding="utf-8")

# Let's import reconstruct_database functions
sys.path.append(r"d:\2026 dünya\scratch")
import reconstruct_database

def check_field(label, std_no, key, val):
    if isinstance(val, str):
        try:
            Cell.check_string(None, val)
        except Exception as e:
            print(f"{label} Error: Student={std_no}, key={key}, val={repr(val)}, unicode_ords={[ord(c) for c in val]}, err={e}")

def main():
    print("Loading database and scanning for illegal characters...")
    pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
    ogr_files = glob.glob(pattern, recursive=True)
    all_students_records = defaultdict(list)

    for fpath in sorted(ogr_files):
        folder_dir = os.path.dirname(fpath)
        dept_code = os.path.basename(fpath)[:2].upper()
        
        drs_path = os.path.join(folder_dir, "DRS.DAT")
        ddt_path = os.path.join(folder_dir, "DRS.DDT")
        courses_catalog = reconstruct_database.load_courses_catalog(drs_path, ddt_path)
        
        baba_path = os.path.join(folder_dir, "BABA.DAT")
        ana_path = os.path.join(folder_dir, "ANA.DAT")
        
        diploma_path = os.path.join(folder_dir, f"{dept_code}DIPLOM.TXT")
        if not os.path.exists(diploma_path):
            for f in os.listdir(folder_dir):
                if f.upper() == f"{dept_code}DIPLOM.TXT":
                    diploma_path = os.path.join(folder_dir, f)
                    break
        diploma_mapping = reconstruct_database.load_diploma_mapping(diploma_path)
        
        try:
            with open(fpath, "rb") as f:
                f.read(10)
                content = f.read()
            rec_size = 1496
            num_records = len(content) // rec_size
            father_mapping = reconstruct_database.load_parent_mapping(baba_path, num_records)
            mother_mapping = reconstruct_database.load_parent_mapping(ana_path, num_records)
            
            for i in range(num_records):
                start = i * rec_size
                rec = content[start : start + rec_size]
                std_no = rec[0:8].decode("ascii", errors="ignore").strip()
                if not std_no or not std_no.isdigit():
                    continue
                    
                name_len = rec[8]
                name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
                gender = chr(rec[34]).strip()
                
                bp_len = rec[35]
                birthplace = rec[36 : 36 + bp_len].decode("cp857", errors="ignore").strip()
                
                b_d, b_m, b_y = struct.unpack("<BBH", rec[51:55])
                birth_date = f"{b_d:02d}/{b_m:02d}/{b_y}" if b_d and b_m and b_y else "-"
                
                father = father_mapping.get(i, "-")
                mother = mother_mapping.get(i, "-")
                
                num_sems = struct.unpack("<H", rec[334:336])[0]
                semesters = []
                for s_idx in range(num_sems):
                    off = 336 + s_idx * 4
                    year = struct.unpack("<H", rec[off : off + 2])[0]
                    sem = rec[off + 2]
                    count = rec[off + 3]
                    semesters.append({"year": year, "sem": "Güz" if sem == 1 else "Bahar", "count": count})
                
                transcript_rows = []
                for s_idx, sem in enumerate(semesters):
                    year_idx = s_idx // 2
                    is_bahar = (s_idx % 2) == 1
                    term_label = f"{sem['year']} - {sem['sem']}"
                    
                    chunk_slots = reconstruct_database.get_chunk_slots(rec, year_idx, is_bahar)
                    active_slots = chunk_slots[:sem['count']]
                    
                    for off, cid, g_byte in active_slots:
                        c = courses_catalog.get(cid, {"code": f"UNK{cid}", "name": f"Bilinmeyen Ders {cid}", "credits": 3})
                        score_str, letter, g_pts = reconstruct_database.get_grade_info(g_byte)
                        transcript_rows.append({
                            "term": term_label,
                            "course_code": c["code"],
                            "course_name": c["name"],
                            "midterm": "-",
                            "final": score_str,
                            "letter_grade": letter,
                            "credits": c["credits"],
                            "points": g_pts
                        })
                        
                dip_info = diploma_mapping.get(std_no, {'diploma_no': '-', 'unvan': '-', 'kayit_tarihi': f"01/09/19{std_no[:2]}" if std_no[:2].isdigit() else '-', 'mezuniyet_tarihi': '-'})
                
                student_data = {
                    "path": fpath,
                    "path_score": reconstruct_database.get_path_score(fpath),
                    "rel_folder": os.sep.join(fpath.split(os.sep)[-3:-1]),
                    "department": dept_code,
                    "number": std_no,
                    "name": name,
                    "gender": gender,
                    "birthplace": birthplace,
                    "birth_date": birth_date,
                    "father": father,
                    "anne_adi": mother,
                    "kayit_tarihi": dip_info.get("kayit_tarihi", "-"),
                    "mezuniyet_tarihi": dip_info.get("mezuniyet_tarihi", "-"),
                    "diploma_no": dip_info.get("diploma_no", "-"),
                    "unvan": dip_info.get("unvan", "-"),
                    "transcripts": transcript_rows
                }
                all_students_records[std_no].append(student_data)
        except Exception as e:
            print(f"Error reading {fpath}: {e}")

    print("Checking final records...")
    # Deduplicate and check
    for std_no, records in all_students_records.items():
        best_rec = max(records, key=lambda x: x["path_score"])
        
        for key, val in best_rec.items():
            if key == "transcripts":
                for row in val:
                    for rkey, rval in row.items():
                        check_field("Transcript", std_no, f"{row.get('course_code')}.{rkey}", rval)
            else:
                check_field("Student", std_no, key, val)

    print("Scan complete.")

if __name__ == "__main__":
    main()
