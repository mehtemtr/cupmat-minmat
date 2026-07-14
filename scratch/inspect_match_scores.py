import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
df = pd.read_excel(file_path, sheet_name="Son 16")

first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
match_col = df.columns[0 + offset]

matches = ["Fransa - Fas", "İspanya - Belçika", "Norveç - İngiltere", "Arjantin - İsviçre"]

for m in matches:
    sub = df[df[match_col].astype(str).str.contains(m, case=False, na=False)]
    if len(sub) == 0:
        print(f"Match '{m}' not found in the sheet.")
        continue
    
    print(f"\nMatch: {m}")
    # Let's inspect goalkeeper rows to see how many goals they conceded
    gk_rows = sub[sub.iloc[:, 3 + offset].astype(str).str.upper().isin(["K", "KL"])]
    for idx, r in gk_rows.iterrows():
        team = r.iloc[1 + offset]
        gk_name = r.iloc[5 + offset]
        conceded = r.iloc[6 + offset]
        print(f"  Goalkeeper: {gk_name} ({team}), Goals Conceded: {conceded}")
        
    # Also let's print who scored goals in this match
    scorers = sub[sub.iloc[:, 8 + offset] > 0]
    for idx, r in scorers.iterrows():
        team = r.iloc[1 + offset]
        p_name = r.iloc[5 + offset]
        goals = r.iloc[8 + offset]
        print(f"  Scorer: {p_name} ({team}) - {goals} goal(s)")
