import json

with open("scratch/parsed_excel_stats.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for stage, players in data.items():
    matches = set(p["match_name"] for p in players)
    print(f"Stage: {stage}, Count of players: {len(players)}")
    print("Unique matches:")
    for m in matches:
        print(f"  - {m}")
