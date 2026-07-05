import pandas as pd

xl = pd.ExcelFile("futbolcuistatistikleri.xlsx")
for sheet in ["Son 32", "Son 16"]:
    df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name=sheet)
    # Check layout shift offset
    first_col = str(df.columns[0]).strip().lower()
    first_row_val = ""
    if len(df) > 0:
        first_row_val = str(df.iloc[0, 0]).strip().lower()
    offset = 0
    if "kaleciler" in first_col or "diğerleri" in first_col or "kaleciler" in first_row_val or "diğerleri" in first_row_val:
        offset = 1
        
    matches = df.iloc[1:, 0 + offset].dropna().unique()
    print(f"=== Matches in {sheet} ===")
    for m in matches:
        print(m)
