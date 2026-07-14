import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
xl = pd.ExcelFile(file_path)
print("Sheets in excel:", xl.sheet_names)

for sheet in xl.sheet_names:
    if "çeyrek" in sheet.lower():
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(f"\nSheet name: {sheet}")
        # print first few rows of columns to inspect
        print("Columns:", list(df.columns))
        first_col = str(df.columns[0]).strip().lower()
        offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
        match_col = df.columns[0 + offset]
        print("Match Column Name:", match_col)
        print("Unique Matches in this sheet:")
        print(df[match_col].dropna().unique())
