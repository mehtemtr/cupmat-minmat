import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
xl = pd.ExcelFile(file_path)

for sheet in xl.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet)
    print(f"\nSheet: {sheet}, Shape: {df.shape}")
    
    first_col = str(df.columns[0]).strip().lower()
    offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
    
    if len(df.columns) > offset:
        match_col = df.columns[0 + offset]
        print(f"  Match column: {match_col}")
        # print unique non-null match values
        matches = df[match_col].dropna().unique()
        print(f"  Unique matches ({len(matches)}):")
        for m in matches[:10]:
            print(f"    - {m}")
        if len(matches) > 10:
            print("    ...")
