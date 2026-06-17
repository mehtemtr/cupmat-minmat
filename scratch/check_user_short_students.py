import pandas as pd
import sys
import os

sys.stdout.reconfigure(encoding="utf-8")

xlsx_path = r"d:\2026 dünya\farklı oku\90lar\ogrenci_ve_transkript_veritabani.xlsx"
if not os.path.exists(xlsx_path):
    print(f"Error: {xlsx_path} not found.")
    sys.exit(1)

df = pd.read_excel(xlsx_path, sheet_name="Öğrenciler")

# Filter for the short student numbers in the user's request
# Like: '8001', '9003', '9009', '9010', '9041', '29012', '39013', '49014', '59015', '69016', '79017', '89018', '9046'
test_numbers = [
    "8001", "9003", "9009", "9010", "9041", "29012", "39013", 
    "49014", "59015", "69016", "79017", "89018", "9046"
]

print("Checking parent names in generated Excel:")
df_test = df[df["number"].astype(str).isin(test_numbers)]
for idx, row in df_test.iterrows():
    print(f"No: {row['department']} {row['number']} | Name: {row['name']} | Father: {row['father']} | Mother: {row['anne_adi']} | Folder: {row['folder']}")
