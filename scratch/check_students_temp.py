import pandas as pd
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

xlsx_path = r"d:\2026 dünya\farklı oku\90lar\ogrenci_ve_transkript_veritabani.xlsx"
if not os.path.exists(xlsx_path):
    print(f"Error: {xlsx_path} not found.")
    sys.exit(1)

df = pd.read_excel(xlsx_path, sheet_name="Öğrenciler")
print("Total students in Excel:", len(df))

test_nos = ["1001", "1002", "1003", "2001", "5002", "5003", "95234027", "99234010", "99157013"]
df_test = df[df["number"].astype(str).isin(test_nos)]

print("\n--- Match Results ---")
print(df_test[["number", "name", "father", "anne_adi", "folder"]])
