import pandas as pd

df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name="Son 32")
first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0
match_col = df.columns[0 + offset]

for team in ["Portekiz", "İspanya", "İsviçre", "Avustralya", "Arjantin", "Kolombiya"]:
    rows = df[df[match_col].astype(str).str.contains(team, case=False, na=False)]
    if len(rows) > 0:
        unique_matches = rows[match_col].unique()
        print(f"\nMatches for {team}:")
        for um in unique_matches:
            print(f"  - Match string: '{um}'")
            # Print first 2 player rows
            sub_df = rows[rows[match_col] == um].head(2)
            for idx, r in sub_df.iterrows():
                print(f"    Player: {r.iloc[5 + offset]}, Position: {r.iloc[4 + offset]}, GA/TCH: {r.iloc[6 + offset]}, G: {r.iloc[8 + offset]}, A: {r.iloc[9 + offset]}")
