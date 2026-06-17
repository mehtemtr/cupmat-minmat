import os
import glob
import struct
import sys

sys.stdout.reconfigure(encoding="utf-8")

# Let's search for OGR.DAT files in "d:\2026 dünya\farklı oku\1"
pattern = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

target_names = [
    "HAKAN YILMAZ",
    "SELAHATTİN BAYSAL",
    "AYŞE DEMİR",
    "MEHMET DURAK SÜLÜ",
    "ERSOY HAKAN",
    "SERDAR KEMAL PAKKUMSAL",
    "HARUN COŞKUN",
    "SÜLEYMAN KARA",
    "ABUZER YILDIRIM",
    "AHMET DÜZCE",
    "SEBAHATTİN İLHAN",
    "YALÇIN ORMAN",
    "GÖKHAN HOCAOĞLU",
    "HÜSAMETTİN ONARICILAR",
    "EMİN TAŞ",
    "MUSTAFA KEMAL ERÇİFTÇİ",
    "ERDİNÇ ALKAN",
    "ORHAN MUTLU",
    "TUFAN ÖNDER",
    "SERTAN BARIŞ",
    "HÜSEYİN İKİZ",
    "HASAN KILIÇ",
    "HÜSEYİN KÜÇÜK",
    "FUNDA ÖZDEN",
    "NİLGÜN KOCALAR",
    "HASAN POLAT",
    "ÜNAL DUMAN",
    "MUSTAFA SAYDAM",
    "YAHYA MURAT ORHAN",
    "HASAN ARSLAN",
    "HASAN SAKMAN",
    "OSMAN ULUDAĞ",
    "BAHATTİN TURAK",
    "ERKAN TAŞKIN",
    "ALİ SULANÇ",
    "HAKKI ŞEKER",
    "DURDU SIĞIRCI",
    "MİNE KOCAHAN",
    "HACER MARAŞ",
    "EYÜP KOZANOĞLU",
    "HÜRÜ OKUR",
    "DEMET SERKAN",
    "SONGÜL ŞEN",
    "VİLDAN ASLAN",
    "ERCAN ARSLAN",
    "İSMAİL IHMAZ",
    "MUSTAFA DEMİR",
    "DERYA YILMAZ",
    "FATMA ARSLAN",
    "MEHMET ALİ YILMAZ",
    "MİKAİL KARAYAĞIZ",
    "AHMET BALKAN",
    "MEHMET DİKAĞAÇ",
    "AHMET ÇEVİK",
    "AHMET AKBAŞ",
    "MURAT ÖZDEMİR",
    "KAMER NURİ ERENLER",
    "BURCU PİŞKİN",
    "DÜNYA GÜLEZ"
]

def clean_name_for_match(name):
    # Normalize Turkish characters for robust matching
    name = name.upper().strip()
    translation = str.maketrans("İIŞŞĞĞÇÇÖÖÜÜıışşğğççööüü", "IISSGGCCOOUUiissggccoouu")
    return name.translate(translation)

norm_targets = [clean_name_for_match(n) for n in target_names]

print("Scanning all OGR.DAT files for target names...")
found_records = []

for fpath in sorted(ogr_files):
    folder_dir = os.path.dirname(fpath)
    dept_code = os.path.basename(fpath)[:2].upper()
    baba_path = os.path.join(folder_dir, "BABA.DAT")
    ana_path = os.path.join(folder_dir, "ANA.DAT")
    
    try:
        with open(fpath, "rb") as f:
            f.read(10)
            content = f.read()
        record_size = 1496
        num_records = len(content) // record_size
        
        # Load father/mother mappings
        father_mapping = {}
        if os.path.exists(baba_path):
            with open(baba_path, "rb") as f:
                b_content = f.read()
            offset = 7
            b_rec_size = 16
            b_num_recs = (len(b_content) - offset) // b_rec_size
            for idx in range(b_num_recs):
                start = offset + idx * b_rec_size
                rec = b_content[start : start + b_rec_size]
                l = rec[0]
                if 1 <= l <= 13:
                    name = rec[1 : 1 + l].decode("cp857", errors="ignore").strip()
                    std_idx = struct.unpack("<H", rec[14:16])[0]
                    if 0 <= std_idx < num_records:
                        father_mapping[std_idx] = name
                        
        mother_mapping = {}
        if os.path.exists(ana_path):
            with open(ana_path, "rb") as f:
                a_content = f.read()
            offset = 15
            a_rec_size = 16
            a_num_recs = (len(a_content) - offset) // a_rec_size
            for idx in range(a_num_recs):
                start = offset + idx * a_rec_size
                rec = a_content[start : start + a_rec_size]
                l = rec[0]
                if 1 <= l <= 13:
                    name = rec[1 : 1 + l].decode("cp857", errors="ignore").strip()
                    std_idx = struct.unpack("<H", rec[14:16])[0]
                    if 0 <= std_idx < num_records:
                        mother_mapping[std_idx] = name
                        
        for i in range(num_records):
            start = i * record_size
            rec = content[start : start + record_size]
            std_no = rec[0:8].decode("ascii", errors="ignore").strip()
            if not std_no or not std_no.isdigit():
                continue
            name_len = rec[8]
            name = rec[9 : 9 + name_len].decode("cp857", errors="ignore").strip()
            
            norm_name = clean_name_for_match(name)
            match_found = False
            for t_idx, nt in enumerate(norm_targets):
                if nt in norm_name: # substring or exact match
                    match_found = True
                    target_name_ref = target_names[t_idx]
                    break
                    
            if match_found:
                bp_len = rec[35]
                birthplace = rec[36 : 36 + bp_len].decode("cp857", errors="ignore").strip()
                b_d, b_m, b_y = struct.unpack("<BBH", rec[51:55])
                birth_date = f"{b_d:02d}/{b_m:02d}/{b_y}" if b_d and b_m and b_y else "-"
                
                father = father_mapping.get(i, "-")
                mother = mother_mapping.get(i, "-")
                
                found_records.append({
                    "ref": target_name_ref,
                    "file": os.path.basename(fpath),
                    "dept": dept_code,
                    "number": std_no,
                    "name": name,
                    "birthplace": birthplace,
                    "birth_date": birth_date,
                    "father": father,
                    "mother": mother
                })
    except Exception as e:
        print(f"Error in {fpath}: {e}")

# Group and print results
from collections import defaultdict
grouped = defaultdict(list)
for r in found_records:
    grouped[r["ref"]].append(r)

for name_ref, recs in sorted(grouped.items()):
    print("="*80)
    print(f"Target Name: {name_ref} ({len(recs)} records found)")
    print("="*80)
    for r in recs:
        print(f"  No: {r['dept']} {r['number']} | Name: {r['name']} | Birth: {r['birthplace']} ({r['birth_date']}) | Father: {r['father']} | Mother: {r['mother']} | File: {r['file']}")
    print()
