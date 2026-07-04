import pandas as pd
import json
import os

def to_int(val):
    if pd.isna(val): return 0
    try:
        return int(float(str(val).strip()))
    except:
        return 0

def to_float(val, is_gk_ratio=False):
    if pd.isna(val): return 0.0
    val_str = str(val).replace(",", ".").strip()
    if not val_str: return 0.0
    try:
        f_val = float(val_str)
        # For Goalkeeper expected stats that are scaled by 100 (e.g. 105 instead of 1.05)
        if is_gk_ratio and "." not in val_str and abs(f_val) > 2.0:
            return f_val / 100.0
        return f_val
    except:
        return 0.0

def main():
    file_path = "futbolcuistatistikleri.xlsx"
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    xl = pd.ExcelFile(file_path)
    print("Reading sheets:", xl.sheet_names)
    
    parsed_data = {}

    for sheet in xl.sheet_names:
        # Map sheet name to matchday stage name
        stage_map = {
            "grup 1": "matchday_1",
            "grup 2": "matchday_2",
            "grup 3": "matchday_3",
            "son 32": "round_of_32",
            "son 16": "round_of_16",
            "çeyrek final": "quarter_finals",
            "yarı final": "semi_finals",
            "final": "finals"
        }
        
        sheet_lower = sheet.lower().strip()
        stage = stage_map.get(sheet_lower, sheet_lower)
        print(f"Parsing sheet '{sheet}' as stage '{stage}'...")

        df = pd.read_excel(file_path, sheet_name=sheet)
        
        # Check layout shift:
        # If the first column (index 0) is "Kaleciler için" or "Diğerleri için", then offset is 1, else 0.
        first_col = str(df.columns[0]).strip().lower()
        first_row_val = ""
        if len(df) > 0:
            first_row_val = str(df.iloc[0, 0]).strip().lower()
            
        offset = 0
        if "kaleciler" in first_col or "diğerleri" in first_col or "kaleciler" in first_row_val or "diğerleri" in first_row_val:
            offset = 1
            print(f"  Detected offset column (offset = {offset})")

        # Check if first row contains sub-headers (we drop index 0)
        # The headers are already columns of df, but row 0 contains subheadings
        rows_to_parse = df.iloc[1:]

        players_list = []

        for idx, row in rows_to_parse.iterrows():
            row_len = len(row)
            
            match_name = str(row.iloc[0 + offset]).strip()
            team_name = str(row.iloc[1 + offset]).strip()
            jersey_num = to_int(row.iloc[2 + offset])
            pos = str(row.iloc[3 + offset]).strip()
            player_name = str(row.iloc[4 + offset]).strip()
            player_short = str(row.iloc[5 + offset]).strip()
            
            # Skip empty rows
            if not player_name or player_name == "nan" or not match_name or match_name == "nan":
                continue

            minutes = to_int(row.iloc[7 + offset])
            
            player_stat = {
                "match_name": match_name,
                "team_name": team_name,
                "jersey_number": jersey_num,
                "position": pos,
                "player_name": player_name,
                "player_short": player_short,
                "minutes_played": minutes,
            }

            # New card and penalty stats:
            # KK (Kırmızı Kart) - Index 18
            # SK (Sarı Kart) - Index 19
            # PKu/PK (Penaltı Kurtarışı / Penaltı Kaçırdı) - Index 20
            # KKG (Kendi Kalesine Gol) - Index 21
            red_cards = 0
            yellow_cards = 0
            penalties_saved = 0
            penalties_missed = 0
            own_goals = 0
            
            if row_len > 18:
                red_cards = to_int(row.iloc[18])
            if row_len > 19:
                yellow_cards = to_int(row.iloc[19])
            if row_len > 20:
                val_20 = to_int(row.iloc[20])
                if pos == "K":
                    penalties_saved = val_20
                else:
                    penalties_missed = val_20
            if row_len > 21:
                own_goals = to_int(row.iloc[21])

            if pos == "K":
                # Goalkeeper stats
                player_stat.update({
                    "is_goalkeeper": True,
                    "goals_conceded": to_int(row.iloc[6 + offset]),
                    "saves": to_int(row.iloc[8 + offset]),
                    "shots_on_goal_against": to_int(row.iloc[9 + offset]),
                    "xg_conceded": to_float(row.iloc[10 + offset], is_gk_ratio=True),
                    "xgot_conceded": to_float(row.iloc[11 + offset], is_gk_ratio=True),
                    "goals_prevented": to_float(row.iloc[12 + offset], is_gk_ratio=True),
                    "claimed_crosses": to_int(row.iloc[13 + offset]),
                    "clearances": to_int(row.iloc[14 + offset]),
                    "punches": to_int(row.iloc[15 + offset]),
                    "penalties_saved": penalties_saved if penalties_saved > 0 else to_int(row.iloc[16 + offset]),
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": yellow_cards,
                    "red_cards": red_cards,
                    "penalty_saved": penalties_saved,
                    "penalty_missed": 0,
                    "own_goals": own_goals
                })
            else:
                # Outfield player stats
                player_stat.update({
                    "is_goalkeeper": False,
                    "touches": to_int(row.iloc[6 + offset]),
                    "goals": to_int(row.iloc[8 + offset]),
                    "assists": to_int(row.iloc[9 + offset]),
                    "xg": to_float(row.iloc[10 + offset]),
                    "xa": to_float(row.iloc[11 + offset]),
                    "shots_on_goal": to_int(row.iloc[12 + offset]),
                    "shots": to_int(row.iloc[13 + offset]),
                    "big_chances_created": to_int(row.iloc[14 + offset]),
                    "interceptions": to_int(row.iloc[15 + offset]),
                    "duels_won": to_int(row.iloc[16 + offset]),
                    "goals_conceded": 0,
                    "saves": 0,
                    "penalty_saved": 0,
                    "penalty_missed": penalties_missed,
                    "yellow_cards": yellow_cards,
                    "red_cards": red_cards,
                    "own_goals": own_goals
                })

            players_list.append(player_stat)
        
        parsed_data[stage] = players_list

    os.makedirs("scratch", exist_ok=True)
    out_path = "scratch/parsed_excel_stats.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(parsed_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully wrote parsed stats for {len(parsed_data)} stages to '{out_path}'.")

if __name__ == "__main__":
    main()
