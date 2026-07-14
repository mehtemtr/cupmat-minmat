import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
df = pd.read_excel(file_path, sheet_name="Son 16")

first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
match_col = df.columns[0 + offset]

for m in df[match_col].dropna().unique():
    # Print the string and its hex representation of characters
    chars_hex = " ".join(f"{ord(c):04x}({c})" for c in m)
    print(f"Match Name: '{m}'")
    print(f"  Hex: {chars_hex}")
