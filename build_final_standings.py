# -*- coding: utf-8 -*-
import json, sys

with open('all_standings_extracted.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Load verified teams to map logos, codes and English names
with open('uel_teams_verified.json', 'r', encoding='utf-8') as f:
    uel_meta = json.load(f)

with open('uecl_teams_verified.json', 'r', encoding='utf-8') as f:
    uecl_meta = json.load(f)

with open('unl_teams_verified.json', 'r', encoding='utf-8') as f:
    unl_meta = json.load(f)

# UCL Teams mapping (Standard 36 UCL teams)
UCL_META = {
    'AEK Athens FC': {'name': 'AEK Athens', 'id': 575, 'code': 'YUN', 'logo': 'https://media.api-sports.io/football/teams/575.png'},
    'Arsenal FC': {'name': 'Arsenal', 'id': 42, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/42.png'},
    'AS Roma': {'name': 'AS Roma', 'id': 497, 'code': 'İTA', 'logo': 'https://media.api-sports.io/football/teams/497.png'},
    'Aston Villa FC': {'name': 'Aston Villa', 'id': 66, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/66.png'},
    'Borussia Dortmund': {'name': 'Borussia Dortmund', 'id': 165, 'code': 'ALM', 'logo': 'https://media.api-sports.io/football/teams/165.png'},
    'Club Atlético de Madrid': {'name': 'Atlético Madrid', 'id': 530, 'code': 'İSP', 'logo': 'https://media.api-sports.io/football/teams/530.png'},
    'Club Brugge KV': {'name': 'Club Brugge', 'id': 569, 'code': 'BEL', 'logo': 'https://media.api-sports.io/football/teams/569.png'},
    'Como 1907': {'name': 'Como', 'id': 891, 'code': 'İTA', 'logo': 'https://media.api-sports.io/football/teams/891.png'},
    'FC Barcelona': {'name': 'Barcelona', 'id': 529, 'code': 'İSP', 'logo': 'https://media.api-sports.io/football/teams/529.png'},
    'FC Bayern München': {'name': 'Bayern Munich', 'id': 157, 'code': 'ALM', 'logo': 'https://media.api-sports.io/football/teams/157.png'},
    'FC Internazionale Milano': {'name': 'Inter', 'id': 505, 'code': 'İTA', 'logo': 'https://media.api-sports.io/football/teams/505.png'},
    'FC Porto': {'name': 'Porto', 'id': 212, 'code': 'POR', 'logo': 'https://media.api-sports.io/football/teams/212.png'},
    'FC Shakhtar Donetsk': {'name': 'Shakhtar Donetsk', 'id': 550, 'code': 'UKR', 'logo': 'https://media.api-sports.io/football/teams/550.png'},
    'Fenerbahçe SK': {'name': 'Fenerbahçe', 'id': 611, 'code': 'TÜR', 'logo': 'https://media.api-sports.io/football/teams/611.png'},
    'Feyenoord Rotterdam': {'name': 'Feyenoord', 'id': 209, 'code': 'HOL', 'logo': 'https://media.api-sports.io/football/teams/209.png'},
    'FK Bodø/Glimt': {'name': 'Bodø/Glimt', 'id': 328, 'code': 'NOR', 'logo': 'https://media.api-sports.io/football/teams/328.png'},
    'Galatasaray SK': {'name': 'Galatasaray', 'id': 645, 'code': 'TÜR', 'logo': 'https://media.api-sports.io/football/teams/645.png'},
    'LASK': {'name': 'LASK', 'id': 1026, 'code': 'AVU', 'logo': 'https://media.api-sports.io/football/teams/1026.png'},
    'Lille OSC': {'name': 'Lille', 'id': 79, 'code': 'FRA', 'logo': 'https://media.api-sports.io/football/teams/79.png'},
    'Liverpool FC': {'name': 'Liverpool', 'id': 40, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/40.png'},
    'Manchester City FC': {'name': 'Man City', 'id': 50, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/50.png'},
    'Manchester United FC': {'name': 'Man United', 'id': 33, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/33.png'},
    'Paris Saint-Germain FC': {'name': 'PSG', 'id': 85, 'code': 'FRA', 'logo': 'https://media.api-sports.io/football/teams/85.png'},
    'PSV Eindhoven': {'name': 'PSV', 'id': 197, 'code': 'HOL', 'logo': 'https://media.api-sports.io/football/teams/197.png'},
    'RB Leipzig': {'name': 'RB Leipzig', 'id': 173, 'code': 'ALM', 'logo': 'https://media.api-sports.io/football/teams/173.png'},
    'RC Lens': {'name': 'Lens', 'id': 116, 'code': 'FRA', 'logo': 'https://media.api-sports.io/football/teams/116.png'},
    'Real Betis Balompié': {'name': 'Real Betis', 'id': 543, 'code': 'İSP', 'logo': 'https://media.api-sports.io/football/teams/543.png'},
    'Real Madrid CF': {'name': 'Real Madrid', 'id': 541, 'code': 'İSP', 'logo': 'https://media.api-sports.io/football/teams/541.png'},
    'Sporting CP': {'name': 'Sporting CP', 'id': 228, 'code': 'POR', 'logo': 'https://media.api-sports.io/football/teams/228.png'},
    'SSC Napoli': {'name': 'Napoli', 'id': 492, 'code': 'İTA', 'logo': 'https://media.api-sports.io/football/teams/492.png'},
    'SV Werder Bremen': {'name': 'Werder Bremen', 'id': 162, 'code': 'ALM', 'logo': 'https://media.api-sports.io/football/teams/162.png'},
    'ŠK Slovan Bratislava': {'name': 'Slovan Bratislava', 'id': 627, 'code': 'SVK', 'logo': 'https://media.api-sports.io/football/teams/627.png'},
    'Tottenham Hotspur FC': {'name': 'Tottenham', 'id': 47, 'code': 'İNG', 'logo': 'https://media.api-sports.io/football/teams/47.png'},
    'VfB Stuttgart': {'name': 'Stuttgart', 'id': 172, 'code': 'ALM', 'logo': 'https://media.api-sports.io/football/teams/172.png'},
    'Viking FK': {'name': 'Viking', 'id': 329, 'code': 'NOR', 'logo': 'https://media.api-sports.io/football/teams/329.png'},
    'Villarreal CF': {'name': 'Villarreal', 'id': 533, 'code': 'İSP', 'logo': 'https://media.api-sports.io/football/teams/533.png'}
}

# Transform UCL
final_ucl = []
for idx, t in enumerate(data['ucl']):
    meta = UCL_META.get(t['name'], {'name': t['name'], 'id': 1000+idx, 'code': '', 'logo': None})
    final_ucl.append({
        'rank': idx + 1,
        'team': meta['name'],
        'teamId': meta['id'],
        'logo': meta['logo'],
        'country': meta['code'],
        'played': t['played'],
        'win': t['win'],
        'draw': t['draw'],
        'lose': t['lose'],
        'gf': t['gf'],
        'ga': t['ga'],
        'gd': t['gd'],
        'pts': t['pts']
    })

# Transform UEL
final_uel = []
for idx, t in enumerate(data['uel']):
    meta = uel_meta.get(t['name'], {'name': t['name'], 'id': 2000+idx, 'country_code': '', 'logo': None})
    final_uel.append({
        'rank': idx + 1,
        'team': meta['name'],
        'teamId': meta['id'],
        'logo': meta['logo'],
        'country': meta.get('country_code', ''),
        'played': t['played'],
        'win': t['win'],
        'draw': t['draw'],
        'lose': t['lose'],
        'gf': t['gf'],
        'ga': t['ga'],
        'gd': t['gd'],
        'pts': t['pts']
    })

# Transform UECL
final_uecl = []
for idx, t in enumerate(data['uecl']):
    meta = uecl_meta.get(t['name'], {'name': t['name'], 'id': 3000+idx, 'country_code': '', 'logo': None})
    final_uecl.append({
        'rank': idx + 1,
        'team': meta['name'],
        'teamId': meta['id'],
        'logo': meta['logo'],
        'country': meta.get('country_code', ''),
        'played': t['played'],
        'win': t['win'],
        'draw': t['draw'],
        'lose': t['lose'],
        'gf': t['gf'],
        'ga': t['ga'],
        'gd': t['gd'],
        'pts': t['pts']
    })

# Transform UNL (Grouped by League & Group)
final_unl = []
for idx, t in enumerate(data['unl']):
    meta = unl_meta.get(t['team'], {'name': t['team'], 'id': 4000+idx, 'code': '', 'logo': None})
    final_unl.append({
        'league': t['league'],
        'group': t['group'],
        'team': meta['name'],
        'teamId': meta['id'],
        'logo': meta['logo'],
        'country': meta.get('code', ''),
        'played': t['played'],
        'win': t['win'],
        'draw': t['draw'],
        'lose': t['lose'],
        'gf': t['gf'],
        'ga': t['ga'],
        'gd': t['gd'],
        'pts': t['pts']
    })

all_final = {
    '2': final_ucl,
    '3': final_uel,
    '848': final_uecl,
    '5': final_unl
}

with open('final_standings_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_final, f, ensure_ascii=False, indent=2)

print('Successfully exported all 4 tournaments standings to final_standings_data.json!')
