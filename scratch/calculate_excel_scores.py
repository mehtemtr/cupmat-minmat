import pandas as pd

for sheet in ["Son 32", "Son 16"]:
    df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name=sheet)
    first_col = str(df.columns[0]).strip().lower()
    offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0

    match_col = df.columns[0 + offset]
    team_col = df.columns[1 + offset]
    pos_col = df.columns[3 + offset]
    goals_col = df.columns[8 + offset]
    own_goals_col = df.columns[21] if len(df.columns) > 21 else None

    def to_int(val):
        if pd.isna(val): return 0
        try: return int(float(str(val).strip()))
        except: return 0

    # Unique matches in the sheet
    matches = df[match_col].dropna().unique()
    print(f"\n=== Scores in {sheet} ===")
    for m in matches:
        if m == "Maç": continue
        # Get all rows for this match
        match_df = df[df[match_col] == m]
        
        # Get unique teams in this match
        teams = match_df[team_col].dropna().unique()
        if len(teams) != 2:
            continue
            
        team1, team2 = teams[0], teams[1]
        
        # Sum goals (excluding goalkeepers)
        t1_goals = 0
        t2_goals = 0
        t1_own_goals = 0
        t2_own_goals = 0
        
        for idx, row in match_df.iterrows():
            team = row[team_col]
            pos = row[pos_col]
            
            # Only outfield players score goals
            if pos != "K":
                g = to_int(row[goals_col])
                og = to_int(row[own_goals_col]) if own_goals_col else 0
                
                if team == team1:
                    t1_goals += g
                    t1_own_goals += og
                elif team == team2:
                    t2_goals += g
                    t2_own_goals += og
                
        t1_total_score = t1_goals + t2_own_goals
        t2_total_score = t2_goals + t1_own_goals
        
        print(f"Match: '{m}' | {team1} {t1_total_score} - {t2_total_score} {team2}")
