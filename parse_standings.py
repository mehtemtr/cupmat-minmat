# -*- coding: utf-8 -*-
import openpyxl, json, sys

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['P Durumu']
rows = list(ws.iter_rows(values_only=True))

def parse_cup_standings(start_col):
    teams = []
    for r in rows[2:38]:
        team_name = r[start_col]
        if team_name and str(team_name).strip():
            teams.append({
                'name': str(team_name).strip(),
                'played': int(r[start_col+1] or 0),
                'win': int(r[start_col+2] or 0),
                'draw': int(r[start_col+3] or 0),
                'lose': int(r[start_col+4] or 0),
                'gf': int(r[start_col+5] or 0),
                'ga': int(r[start_col+6] or 0),
                'pts': int(r[start_col+7] or 0),
                'gd': int(r[start_col+8] or 0)
            })
    return teams

ucl = parse_cup_standings(1)
uel = parse_cup_standings(11)
uecl = parse_cup_standings(21)

print('UCL Teams count:', len(ucl))
print('UEL Teams count:', len(uel))
print('UECL Teams count:', len(uecl))

unl_groups = []
current_league = None
current_group = None

for r_idx, r in enumerate(rows):
    cell_val = str(r[31] or '').strip()
    if 'Ligi' in cell_val:
        current_league = cell_val
    elif 'Grup' in cell_val:
        current_group = cell_val
    elif cell_val and cell_val not in ['Avrupa Uluslar Ligi', 'Puan Durumu']:
        unl_groups.append({
            'league': current_league,
            'group': current_group,
            'team': cell_val,
            'played': int(r[32] or 0),
            'win': int(r[33] or 0),
            'draw': int(r[34] or 0),
            'lose': int(r[35] or 0),
            'gf': int(r[36] or 0),
            'ga': int(r[37] or 0),
            'pts': int(r[38] or 0),
            'gd': int(r[39] or 0)
        })

print('Total UNL Standings records:', len(unl_groups))

standings_data = {
    'ucl': ucl,
    'uel': uel,
    'uecl': uecl,
    'unl': unl_groups
}

with open('all_standings_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(standings_data, f, ensure_ascii=False, indent=2)

print('Saved all_standings_extracted.json successfully!')
