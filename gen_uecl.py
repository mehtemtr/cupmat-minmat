# -*- coding: utf-8 -*-
import openpyxl, json, os, sys, datetime

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['U Konferans L.']
rows = list(ws.iter_rows(values_only=True))

with open('uecl_teams_verified.json', 'r', encoding='utf-8') as f:
    teams_meta = json.load(f)

COUNTRY_TR_MAP = {
    'dk': 'DAN', 'ch': 'İSV', 'hr': 'HIR', 'fi': 'FİN', 'bg': 'BUL',
    'ro': 'ROM', 'gr': 'YUN', 'se': 'İSVE', 'lv': 'LET', 'al': 'ARN',
    'de': 'ALM', 'sct': 'İSK', 'be': 'BEL', 'no': 'NOR', 'eng': 'İNG',
    'it': 'İTA', 'nl': 'HOL', 'kz': 'KAZ', 'es': 'İSP', 'ad': 'AND',
    'tr': 'TÜR', 'ge': 'GÜR', 'cz': 'ÇEK', 'lt': 'LİT', 'rs': 'SIR',
    'cy': 'KIB', 'ba': 'BOS', 'pt': 'POR', 'gi': 'CEB', 'fr': 'FRA'
}

matches_to_insert = []
base_api_id = 9603001
last_valid_date = None

for i, r in enumerate(rows[3:]):
    if r[1] is None:
        continue
    hafta, tarih, saat, stat, ev_ulke, ev, dep_ulke, dep = r[1:9]
    
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
    
    home_meta = teams_meta.get(ev, {'id': 80000 + i, 'name': ev, 'logo': None, 'country_code': COUNTRY_TR_MAP.get(ev_ulke, ev_ulke.upper())})
    away_meta = teams_meta.get(dep, {'id': 85000 + i, 'name': dep, 'logo': None, 'country_code': COUNTRY_TR_MAP.get(dep_ulke, dep_ulke.upper())})
    
    match_record = {
        'api_id': base_api_id + i,
        'tournament_id': '92b92658-f9fe-4df1-ab7d-599ee5cd87d1',
        'season': 2026,
        'round': f'Lig Aşaması - {hafta}. Hafta',
        'date': iso_date,
        'status': 'NS',
        'venue_name': stat,
        'home_team_id': home_meta['id'],
        'home_team_name': home_meta['name'],
        'home_team_country_code': home_meta['country_code'],
        'home_team_logo': home_meta['logo'],
        'home_score': None,
        'home_score_90': None,
        'home_penalty_score': None,
        'home_is_winner': None,
        'away_team_id': away_meta['id'],
        'away_team_name': away_meta['name'],
        'away_team_country_code': away_meta['country_code'],
        'away_team_logo': away_meta['logo'],
        'away_score': None,
        'away_score_90': None,
        'away_penalty_score': None,
        'away_is_winner': None
    }
    matches_to_insert.append(match_record)

with open('uecl_matches_prepared.json', 'w', encoding='utf-8') as f:
    json.dump(matches_to_insert, f, ensure_ascii=False, indent=2)

print(f'Successfully generated uecl_matches_prepared.json with {len(matches_to_insert)} matches.')
