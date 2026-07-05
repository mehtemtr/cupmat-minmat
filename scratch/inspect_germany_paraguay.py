import pandas as pd

df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name="Son 32")
first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0

match_col = df.columns[0 + offset]
team_col = df.columns[1 + offset]
name_col = df.columns[4 + offset]
goals_col = df.columns[8 + offset]

rows = df[df[match_col] == "Almanya - Paraguay 1 - 1"]
for idx, r in rows.iterrows():
    print(f"Team: {r[team_col]} | Player: {r[name_col]} | Goals: {r[goals_col]}")
