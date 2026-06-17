import os
import glob
import struct
import sys
import re
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

# Output path
OUTPUT_XLSX = r"d:\2026 dünya\farklı oku\90lar\ogrenci_ve_transkript_veritabani.xlsx"

# Grade map for codes > 100
GRADE_MAP = {
    101: "BT", # Bütünleme
    102: "DT", # Devamsız
    103: "MU", # Muaf
    104: "MZ", # Mazeretli
    105: "NY", # Not Yok
    106: "TT", # Tekrar
    107: "HZ", # Hazırlık
    108: "TK",
    109: "AA",
    110: "BA",
    111: "BB",
    112: "CB",
    113: "CC",
    114: "DC",
    115: "DD",
    116: "FF",
    117: "S",
    118: "U",
    119: "NA",
    120: "S",
    121: "U",
    122: "E",
    123: "UB",
    124: "E",
    127: "FD"
}

# Grade points for GPA calculations
GRADE_POINTS = {
    'AA': 4.0, 'BA': 3.5, 'BB': 3.0, 'CB': 2.5, 'CC': 2.0,
    'DC': 1.5, 'DD': 1.0, 'FD': 0.5, 'FF': 0.0
}

def map_score_to_letter(score):
    if score >= 90: return 'AA'
    elif score >= 85: return 'BA'
    elif score >= 80: return 'BB'
    elif score >= 75: return 'CB'
    elif score >= 70: return 'CC'
    elif score >= 65: return 'DC'
    elif score >= 60: return 'DD'
    elif score >= 50: return 'FD'
    else: return 'FF'

def get_grade_info(val):
    # val is the raw byte from the database
    if val <= 100:
        letter = map_score_to_letter(val)
        return str(val), letter, GRADE_POINTS[letter]
    elif val in GRADE_MAP:
        letter = GRADE_MAP[val]
        pts = GRADE_POINTS.get(letter, None)
        return letter, letter, pts
    else:
        return str(val), "-", None

def clean_string(val):
    if not isinstance(val, str):
        return val
    # Remove null bytes
    val = val.replace('\x00', '')
    # Remove XML illegal characters
    illegal_re = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]")
    val = illegal_re.sub("", val)
    return val.strip()

def load_courses_catalog(drs_path, ddt_path):
    catalog = {}
    if not os.path.exists(drs_path):
        return catalog
        
    with open(drs_path, "rb") as f:
        f.seek(10) # skip header
        dat_content = f.read()
        
    ddt_content = b""
    if os.path.exists(ddt_path):
        with open(ddt_path, "rb") as f:
            f.seek(10)
            ddt_content = f.read()
            
    rec_size = 46
    num_courses = len(dat_content) // rec_size
    for i in range(num_courses):
        dat_rec = dat_content[i*rec_size : i*rec_size+rec_size]
        
        # Course code is first 6 bytes
        code = clean_string(dat_rec[0:6].decode("cp857", errors="ignore"))
        
        # Course name length byte is at offset 6
        name_len = dat_rec[6]
        if 0 < name_len <= 30:
            name_raw = dat_rec[7 : 7 + name_len]
        else:
            name_raw = dat_rec[7:37]
            
        name = clean_string(name_raw.decode("cp857", errors="ignore"))
        
        # default credits is 3
        credits = 3
        if len(ddt_content) >= (i+1)*rec_size:
            ddt_rec = ddt_content[i*rec_size : i*rec_size+rec_size]
            credits = ddt_rec[32]
            
        catalog[i] = {"code": code, "name": name, "credits": credits}
    return catalog

def detect_header_offset(content, is_ana):
    best_offset = 15 if is_ana else 7
    max_valid = 0
    rec_size = 16
    for off in range(rec_size):
        valid_count = 0
        num_recs = (len(content) - off) // rec_size
        for i in range(num_recs):
            start = off + i * rec_size
            rec = content[start : start + rec_size]
            l = rec[0]
            if 2 <= l <= 13:
                name_bytes = rec[1 : 1 + l]
                is_ok = True
                for b in name_bytes:
                    if not (32 <= b <= 126 or b in [0x9E, 0x9F, 0x98, 0x8D, 0x87, 0x94, 0x92, 0x80]):
                        is_ok = False
                        break
                if is_ok:
                    try:
                        name = name_bytes.decode('cp857', errors='ignore').strip()
                        if re.match(r"^[a-zA-ZğĞüÜşŞıİöÖçÇ.\s-]+$", name) and len(name) >= 2:
                            valid_count += 1
                    except:
                        pass
        if valid_count > max_valid:
            max_valid = valid_count
            best_offset = off
    return best_offset

def load_parent_mapping(parent_path, num_students):
    mapping = {}
    if not os.path.exists(parent_path):
        return mapping
    with open(parent_path, 'rb') as f:
        content = f.read()
    is_ana = 'ANA.DAT' in parent_path.upper()
    offset = detect_header_offset(content, is_ana)
    rec_size = 16
    num_recs = (len(content) - offset) // rec_size
    for i in range(num_recs):
        start = offset + i * rec_size
        rec = content[start : start + rec_size]
        l = rec[0]
        if 2 <= l <= 13:
            name = clean_string(rec[1 : 1 + l].decode('cp857', errors='ignore'))
            # Filter garbage parent names (allow letters, space, dot, hyphen only)
            if re.match(r"^[a-zA-ZğĞüÜşŞıİöÖçÇ.\s-]+$", name):
                std_idx = struct.unpack('<H', rec[14:16])[0]
                if 0 <= std_idx < num_students:
                    mapping[std_idx] = name
    return mapping

def load_diploma_mapping(diploma_path):
    mapping = {}
    if not os.path.exists(diploma_path):
        return mapping
    with open(diploma_path, 'r', encoding='cp857', errors='ignore') as f:
        lines = f.readlines()
    if len(lines) < 2:
        return mapping
    for line in lines[1:]:
        parts = line.split('\t')
        if len(parts) >= 17:
            std_no = clean_string(parts[15])
            diploma_no = clean_string(parts[0])
            unvan = clean_string(parts[8])
            reg_date = clean_string(parts[16])
            # Graduation date from parts 5, 6, 7
            g_day = clean_string(parts[5])
            g_month = clean_string(parts[6])
            g_year = clean_string(parts[7])
            grad_date = f"{g_day}/{g_month}/{g_year}" if g_day and g_month and g_year else "-"
            father = clean_string(parts[11]) if len(parts) > 11 else "-"
            mother = clean_string(parts[12]) if len(parts) > 12 else "-"
            mapping[std_no] = {
                'diploma_no': diploma_no,
                'unvan': unvan,
                'kayit_tarihi': reg_date,
                'mezuniyet_tarihi': clean_string(grad_date),
                'father': father,
                'mother': mother
            }
    return mapping

def get_chunk_slots(rec, year_idx, is_bahar):
    is_final_block = (year_idx % 2) == 1
    block_num = year_idx // 2
    
    if block_num == 0:
        v_start, f_start = 416, 518
    elif block_num == 1:
        v_start, f_start = 632, 740
    elif block_num == 2:
        v_start, f_start = 848, 956
    elif block_num == 3:
        v_start, f_start = 1064, 1172
    elif block_num == 4:
        v_start, f_start = 1280, 1388
    else:
        return []
        
    start_off = f_start if is_final_block else v_start
    if is_bahar:
        offsets = [start_off + 54 + idx * 3 for idx in range(16)]
    else:
        offsets = [start_off + idx * 3 for idx in range(18)]
        
    slots_data = []
    for off in offsets:
        if off + 3 <= len(rec):
            cid = struct.unpack("<H", rec[off : off + 2])[0]
            grade = rec[off + 2]
            if cid != 0:
                slots_data.append((off, cid, grade))
    return slots_data

def get_path_score(fpath):
    parts = fpath.upper().split(os.sep)
    score = 0
    # Prioritize active directories
    if any(p in parts for p in ["NORMAL", "GECE", "GUNDUZ", "IKI"]):
        score += 100
    elif "MEZUN" in parts:
        score += 50
        
    # Penalize backup files/folders
    if any(p in fpath.upper() for p in ["YEDEK", "YIKI", "YNORMAL", "NORYEDEK", "NORMALYED", "IKIYEDEK", "NOYEDEK1", "NO2", "NORDAT", "NORMALY", "ESIKI"]):
        score -= 50
    return score

def main():
    print("Locating all student DAT files...")
    pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
    ogr_files = glob.glob(pattern, recursive=True)
    print(f"Found {len(ogr_files)} OGR.DAT files.")

    # We will gather all student records from all files
    # Key: Student Number, Value: List of student record dictionaries
    all_students_records = defaultdict(list)
    
    for fpath in sorted(ogr_files):
        folder_dir = os.path.dirname(fpath)
        parts = fpath.split(os.sep)
        rel_folder = os.sep.join(parts[-3:-1])
        
        # Determine department code
        fname = os.path.basename(fpath)
        dept_code = fname[:2].upper() # e.g. EL, IN, IS, MH, MK, SR, CK, TB, BP, HK, EN
        
        # Load local catalogs
        drs_path = os.path.join(folder_dir, "DRS.DAT")
        ddt_path = os.path.join(folder_dir, "DRS.DDT")
        courses_catalog = load_courses_catalog(drs_path, ddt_path)
        
        baba_path = os.path.join(folder_dir, "BABA.DAT")
        ana_path = os.path.join(folder_dir, "ANA.DAT")
        
        diploma_path = os.path.join(folder_dir, f"{dept_code}DIPLOM.TXT")
        # Handle case-insensitive file matching for DIPLOM.TXT
        if not os.path.exists(diploma_path):
            for f in os.listdir(folder_dir):
                if f.upper() == f"{dept_code}DIPLOM.TXT":
                    diploma_path = os.path.join(folder_dir, f)
                    break
        diploma_mapping = load_diploma_mapping(diploma_path)
        
        try:
            with open(fpath, "rb") as f:
                header = f.read(10)
                content = f.read()
                
            record_size = 1496
            num_records = len(content) // record_size
            
            # Load parents mappings
            father_mapping = load_parent_mapping(baba_path, num_records)
            mother_mapping = load_parent_mapping(ana_path, num_records)
            
            for i in range(num_records):
                start = i * record_size
                rec = content[start : start + record_size]
                
                std_no = clean_string(rec[0:8].decode("ascii", errors="ignore"))
                if not std_no or not std_no.isdigit():
                    continue
                    
                name_len = rec[8]
                name = clean_string(rec[9 : 9 + name_len].decode("cp857", errors="ignore"))
                gender = clean_string(chr(rec[34]))
                
                bp_len = rec[35]
                birthplace = clean_string(rec[36 : 36 + bp_len].decode("cp857", errors="ignore"))
                
                # Birthdate
                b_d, b_m, b_y = struct.unpack("<BBH", rec[51:55])
                birth_date = f"{b_d:02d}/{b_m:02d}/{b_y}" if b_d and b_m and b_y else "-"
                
                father = clean_string(father_mapping.get(i, "-"))
                mother = clean_string(mother_mapping.get(i, "-"))
                
                # Semester count
                num_sems = struct.unpack("<H", rec[334:336])[0]
                
                # Extract semesters metadata
                semesters = []
                for s_idx in range(num_sems):
                    off = 336 + s_idx * 4
                    year = struct.unpack("<H", rec[off : off + 2])[0]
                    sem = rec[off + 2]
                    count = rec[off + 3]
                    sem_name = "Güz" if sem == 1 else "Bahar"
                    semesters.append({"year": year, "sem": sem_name, "count": count})
                    
                # Extract transcripts for this student record
                transcript_rows = []
                for s_idx, sem in enumerate(semesters):
                    year_idx = s_idx // 2
                    is_bahar = (s_idx % 2) == 1
                    term_label = f"{sem['year']} - {sem['sem']}"
                    
                    chunk_slots = get_chunk_slots(rec, year_idx, is_bahar)
                    # Keep first 'count' slots
                    active_slots = chunk_slots[:sem['count']]
                    
                    for off, cid, g_byte in active_slots:
                        c = courses_catalog.get(cid, {"code": f"UNK{cid}", "name": f"Bilinmeyen Ders {cid}", "credits": 3})
                        score_str, letter, g_pts = get_grade_info(g_byte)
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
                
                # Check diploma mapping
                dip_info = diploma_mapping.get(std_no, {'diploma_no': '-', 'unvan': '-', 'kayit_tarihi': f"01/09/19{std_no[:2]}" if std_no[:2].isdigit() else '-', 'mezuniyet_tarihi': '-'})
                
                # Save student details
                student_data = {
                    "path": fpath,
                    "path_score": get_path_score(fpath),
                    "rel_folder": rel_folder,
                    "department": dept_code,
                    "number": std_no,
                    "name": name,
                    "gender": gender,
                    "birthplace": birthplace,
                    "birth_date": birth_date,
                    "father": dip_info.get("father", "-") if dip_info.get("father", "-") != "-" else (father if father != "-" else "-"),
                    "anne_adi": dip_info.get("mother", "-") if dip_info.get("mother", "-") != "-" else (mother if mother != "-" else "-"),
                    "kayit_tarihi": dip_info.get("kayit_tarihi", "-"),
                    "mezuniyet_tarihi": dip_info.get("mezuniyet_tarihi", "-"),
                    "diploma_no": dip_info.get("diploma_no", "-"),
                    "unvan": dip_info.get("unvan", "-"),
                    "transcripts": transcript_rows
                }
                
                all_students_records[std_no].append(student_data)
        except Exception as e:
            print(f"Error reading {fpath}: {e}")

    print(f"Loaded student records. Total unique student numbers: {len(all_students_records)}")

    # Deduplicate and pick the best record for each student
    final_students = []
    final_transcripts = []
    
    for std_no, records in all_students_records.items():
        # Pick the record with the highest path score
        best_rec = max(records, key=lambda x: x["path_score"])
        
        # Calculate YNO (semester GPAs) and GNO (Cumulative GPA)
        transcripts = best_rec["transcripts"]
        
        # Group transcripts by term to calculate YNO
        term_groups = defaultdict(list)
        for row in transcripts:
            term_groups[row["term"]].append(row)
            
        total_gpa_points = 0.0
        total_gpa_credits = 0.0
        
        final_trans_rows = []
        
        for term, term_rows in sorted(term_groups.items()):
            term_points = 0.0
            term_credits = 0.0
            
            for row in term_rows:
                if row["points"] is not None:
                    term_points += row["points"] * row["credits"]
                    term_credits += row["credits"]
                    
                    total_gpa_points += row["points"] * row["credits"]
                    total_gpa_credits += row["credits"]
            
            yno = round(term_points / term_credits, 2) if term_credits > 0 else 0.0
            
            # Add YNO and other fields to each transcript row
            for row in term_rows:
                final_trans_rows.append({
                    "number": std_no,
                    "name": best_rec["name"],
                    "department": best_rec["department"],
                    "term": row["term"],
                    "course_code": row["course_code"],
                    "course_name": row["course_name"],
                    "midterm": row["midterm"],
                    "final": row["final"],
                    "harf_notu": row["letter_grade"],
                    "kredi": row["credits"],
                    "d_n_o": yno # Semester Average (YNO)
                })
                
        gno = round(total_gpa_points / total_gpa_credits, 2) if total_gpa_credits > 0 else "-"
        best_rec["not_ortalamasi"] = gno # Cumulative GPA (GNO)
        
        # Add to lists
        final_students.append({
            "folder": best_rec["rel_folder"],
            "department": best_rec["department"],
            "number": best_rec["number"],
            "name": best_rec["name"],
            "gender": best_rec["gender"],
            "birthplace": best_rec["birthplace"],
            "birth_date": best_rec["birth_date"],
            "father": best_rec["father"],
            "anne_adi": best_rec["anne_adi"],
            "kayit_tarihi": best_rec["kayit_tarihi"],
            "mezuniyet_tarihi": best_rec["mezuniyet_tarihi"],
            "diploma_no": best_rec["diploma_no"],
            "unvan": best_rec["unvan"],
            "not_ortalamasi": best_rec["not_ortalamasi"]
        })
        
        final_transcripts.extend(final_trans_rows)

    print(f"Deduplicated students: {len(final_students)} students.")
    print(f"Total transcript rows: {len(final_transcripts)} rows.")

    # Write to Excel using pandas
    import pandas as pd
    
    print("Writing to Excel...")
    df_students = pd.DataFrame(final_students)
    df_trans = pd.DataFrame(final_transcripts)
    
    # XML illegal characters regex
    ILLEGAL_CHARACTERS_RE = re.compile(
        r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]"
    )
    
    def clean_illegal_chars(val):
        if isinstance(val, str):
            return ILLEGAL_CHARACTERS_RE.sub("", val)
        return val
        
    for col in df_students.columns:
        if df_students[col].dtype == object:
            df_students[col] = df_students[col].astype(str).apply(clean_illegal_chars)
    for col in df_trans.columns:
        if df_trans[col].dtype == object:
            df_trans[col] = df_trans[col].astype(str).apply(clean_illegal_chars)
            
    os.makedirs(os.path.dirname(OUTPUT_XLSX), exist_ok=True)
    
    with pd.ExcelWriter(OUTPUT_XLSX, engine='openpyxl') as writer:
        df_students.to_excel(writer, sheet_name='Öğrenciler', index=False)
        print("Written 'Öğrenciler' sheet.")
        
        departments = df_trans['department'].dropna().unique()
        for dept in sorted(departments):
            sheet_name = f"Transkript_{dept}"
            df_dept = df_trans[df_trans['department'] == dept]
            # remove department column for cleaner look in individual sheets
            df_dept = df_dept.drop(columns=['department'])
            df_dept.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"Written sheet: {sheet_name} ({len(df_dept)} rows)")
            
    print("\nAll sheets written successfully!")
    print(f"Database saved to: {OUTPUT_XLSX}")

if __name__ == "__main__":
    main()
