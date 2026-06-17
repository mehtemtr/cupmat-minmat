import pandas as pd
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

xlsx_path = r"d:\2026 dünya\farklı oku\90lar\ogrenci_ve_transkript_veritabani.xlsx"
df = pd.read_excel(xlsx_path, sheet_name="Öğrenciler")

target_nos = ["95234009", "95234010", "95234029", "00258070", "92289003", "95234027", "99234010"]
df_test = df[df["number"].astype(str).isin(target_nos)]

print("Checking parent names of 8-digit students in Excel:")
for idx, row in df_test.iterrows():
    print(f"No: {row['department']} {row['number']} | Name: {row['name']} | Father: {row['father']} | Mother: {row['anne_adi']} | Folder: {row['folder']}")
