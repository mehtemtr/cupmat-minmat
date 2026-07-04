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
        
        # Check if first row contains sub-headers (we drop index 0)
        # The headers are already columns of df, but row 0 contains subheadings
        rows_to_parse = df.iloc[1:]

        players_list = []

        for idx, row in rows_to_parse.iterrows():
            match_name = str(row.iloc[0]).strip()
            team_name = str(row.iloc[1]).strip()
            jersey_num = to_int(row.iloc[2])
            pos = str(row.iloc[3]).strip()
            player_name = str(row.iloc[4]).strip()
            player_short = str(row.iloc[5]).strip()
            
            # Skip empty rows
            if not player_name or player_name == "nan" or not match_name or match_name == "nan":
                continue

            minutes = to_int(row.iloc[7])
            
            player_stat = {
                "match_name": match_name,
                "team_name": team_name,
                "jersey_number": jersey_num,
                "position": pos,
                "player_name": player_name,
                "player_short": player_short,
                "minutes_played": minutes,
            }

            yellow_cards = 0
            red_cards = 0
            if len(row) > 18:
                yellow_cards = to_int(row.iloc[18])
            if len(row) > 19:
                red_cards = to_int(row.iloc[19])

            if pos == "K":
                # Goalkeeper stats
                player_stat.update({
                    "is_goalkeeper": True,
                    "goals_conceded": to_int(row.iloc[6]),
                    "saves": to_int(row.iloc[8]),
                    "shots_on_goal_against": to_int(row.iloc[9]),
                    "xg_conceded": to_float(row.iloc[10], is_gk_ratio=True),
                    "xgot_conceded": to_float(row.iloc[11], is_gk_ratio=True),
                    "goals_prevented": to_float(row.iloc[12], is_gk_ratio=True),
                    "claimed_crosses": to_int(row.iloc[13]),
                    "clearances": to_int(row.iloc[14]),
                    "punches": to_int(row.iloc[15]),
                    "penalties_saved": to_int(row.iloc[16]),
                    "goals": 0,
                    "assists": 0,
                    "yellow_cards": yellow_cards,
                    "red_cards": red_cards,
                    "own_goals": 0
                })
            else:
                # Outfield player stats
                player_stat.update({
                    "is_goalkeeper": False,
                    "touches": to_int(row.iloc[6]),
                    "goals": to_int(row.iloc[8]),
                    "assists": to_int(row.iloc[9]),
                    "xg": to_float(row.iloc[10]),
                    "xa": to_float(row.iloc[11]),
                    "shots_on_goal": to_int(row.iloc[12]),
                    "shots": to_int(row.iloc[13]),
                    "big_chances_created": to_int(row.iloc[14]),
                    "interceptions": to_int(row.iloc[15]),
                    "duels_won": to_int(row.iloc[16]),
                    "goals_conceded": 0,
                    "saves": 0,
                    "penalty_saved": 0,
                    "yellow_cards": yellow_cards,
                    "red_cards": red_cards,
                    "own_goals": 0
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
