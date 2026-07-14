import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
df = pd.read_excel(file_path, sheet_name="Son 16")
print("Shape:", df.shape)

first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
match_col = df.columns[0 + offset]
print("Match column name:", match_col)

# Print all unique values in the match column
print("Unique match names:")
for m in df[match_col].dropna().unique():
    print(f"  - {m}")
