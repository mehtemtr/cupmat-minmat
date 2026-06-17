import pandas as pd
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

xlsx_path = r"d:\2026 dünya\farklı oku\90lar\ogrenci_ve_transkript_veritabani.xlsx"
if not os.path.exists(xlsx_path):
    print(f"Error: {xlsx_path} not found.")
    sys.exit(1)

df = pd.read_excel(xlsx_path, sheet_name="Öğrenciler")
df_hakan = df[df["name"].astype(str).str.contains("HAKAN YILMAZ", case=False, na=False)]

print("HAKAN YILMAZ records in the generated Excel:")
for idx, row in df_hakan.iterrows():
    print(f"No: {row['department']} {row['number']} | Name: {row['name']} | Father: {row['father']} | Mother: {row['anne_adi']} | Folder: {row['folder']} | Place: {row['birthplace']} | Date: {row['birth_date']}")
