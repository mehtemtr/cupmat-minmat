# -*- coding: utf-8 -*-
import openpyxl, json, sys, datetime

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['U Uluslar L']
rows = list(ws.iter_rows(values_only=True))

with open('unl_teams_verified.json', 'r', encoding='utf-8') as f:
    teams_meta = json.load(f)

matches_to_insert = []
base_api_id = 9604001
last_valid_date = None

for i, r in enumerate(rows[3:]):
    if r[1] is None:
        continue
    hafta = r[1]
    lig = r[2]
    grup = r[3]
    tarih = r[4]
    saat = r[5]
    ev = r[6]
    dep = r[7]
    
    if isinstance(tarih, datetime.datetime):
        last_valid_date = tarih
        match_time = saat if isinstance(saat, datetime.time) else datetime.time(20, 0)
    elif isinstance(tarih, datetime.time):
        match_time = tarih
    else:
        match_time = datetime.time(20, 0)
        
    year = last_valid_date.year
    month = f'{last_valid_date.month:02d}'
    day = f'{last_valid_date.day:02d}'
    hour = f'{match_time.hour:02d}'
    minute = f'{match_time.minute:02d}'
    
    iso_date = f'{year}-{month}-{day}T{hour}:{minute}:00+03:00'
    
    home_meta = teams_meta.get(ev, {'id': 70000 + i, 'name': ev, 'logo': None, 'code': 'UNK'})
    away_meta = teams_meta.get(dep, {'id': 75000 + i, 'name': dep, 'logo': None, 'code': 'UNK'})
    
    round_name = f'Lig {lig} - {grup}. Grup - {hafta}. Hafta'
    
    match_record = {
        'api_id': base_api_id + i,
        'tournament_id': '7cfceb70-83a6-4f09-a15a-68129b40ec0a',
        'season': 2026,
        'round': round_name,
        'date': iso_date,
        'status': 'NS',
        'venue_name': None,
        'home_team_id': home_meta['id'],
        'home_team_name': home_meta['name'],
        'home_team_country_code': home_meta['code'],
        'home_team_logo': home_meta['logo'],
        'home_score': None,
        'home_score_90': None,
        'home_penalty_score': None,
        'home_is_winner': None,
        'away_team_id': away_meta['id'],
        'away_team_name': away_meta['name'],
        'away_team_country_code': away_meta['code'],
        'away_team_logo': away_meta['logo'],
        'away_score': None,
        'away_score_90': None,
        'away_penalty_score': None,
        'away_is_winner': None
    }
    matches_to_insert.append(match_record)

with open('unl_matches_prepared.json', 'w', encoding='utf-8') as f:
    json.dump(matches_to_insert, f, ensure_ascii=False, indent=2)

print('Generated unl_matches_prepared.json with matches:', len(matches_to_insert))
