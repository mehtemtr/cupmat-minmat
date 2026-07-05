import pandas as pd

df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name="Son 32")
first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0

match_col = df.columns[0 + offset]
team_col = df.columns[1 + offset]
name_col = df.columns[4 + offset]
pos_col = df.columns[3 + offset]
goals_col = df.columns[8 + offset]
pk_col = df.columns[20] if len(df.columns) > 20 else None

for m_name in ["Avustralya - Mısır", "Arjantin - Yeşil Burun Adaları"]:
    rows = df[df[match_col] == m_name]
    print(f"\n=== Player rows for '{m_name}' ===")
    for idx, r in rows.iterrows():
        print(f"Team: {r[team_col]} | Player: {r[name_col]} | Pos: {r[pos_col]} | Goals: {r[goals_col]} | PK/PKu: {r[pk_col] if pk_col else 0}")
