# -*- coding: utf-8 -*-
import openpyxl, json, sys

UNL_TEAMS = {
    'Almanya': {'id': 25, 'name': 'Germany', 'code': 'ALM'},
    'Andorra': {'id': 1569, 'name': 'Andorra', 'code': 'AND'},
    'Arnavutluk': {'id': 770, 'name': 'Albania', 'code': 'ARN'},
    'Avusturya': {'id': 772, 'name': 'Austria', 'code': 'AVU'},
    'Azerbaycan': {'id': 1565, 'name': 'Azerbaijan', 'code': 'AZE'},
    'Belçika': {'id': 1, 'name': 'Belgium', 'code': 'BEL'},
    'Beyaz Rusya': {'id': 1111, 'name': 'Belarus', 'code': 'BLR'},
    'Bosna-Hersek': {'id': 1566, 'name': 'Bosnia & Herzegovina', 'code': 'BOS'},
    'Bulgaristan': {'id': 773, 'name': 'Bulgaria', 'code': 'BUL'},
    'Cebelitarık': {'id': 1573, 'name': 'Gibraltar', 'code': 'CEB'},
    'Danimarka': {'id': 21, 'name': 'Denmark', 'code': 'DAN'},
    'Ermenistan': {'id': 1564, 'name': 'Armenia', 'code': 'ERM'},
    'Estonya': {'id': 1571, 'name': 'Estonia', 'code': 'EST'},
    'Faroe Adaları': {'id': 1572, 'name': 'Faroe Islands', 'code': 'FAR'},
    'Finlandiya': {'id': 774, 'name': 'Finland', 'code': 'FİN'},
    'Fransa': {'id': 2, 'name': 'France', 'code': 'FRA'},
    'Galler': {'id': 767, 'name': 'Wales', 'code': 'GAL'},
    'Güney Kıbrıs': {'id': 1570, 'name': 'Cyprus', 'code': 'KIB'},
    'Gürcistan': {'id': 1567, 'name': 'Georgia', 'code': 'GÜR'},
    'Hollanda': {'id': 1118, 'name': 'Netherlands', 'code': 'HOL'},
    'Hırvatistan': {'id': 3, 'name': 'Croatia', 'code': 'HIR'},
    'Karadağ': {'id': 1576, 'name': 'Montenegro', 'code': 'KRD'},
    'Kazakistan': {'id': 1568, 'name': 'Kazakhstan', 'code': 'KAZ'},
    'Kosova': {'id': 1578, 'name': 'Kosovo', 'code': 'KOS'},
    'Kuzey Makedonya': {'id': 1575, 'name': 'North Macedonia', 'code': 'K.MK'},
    'Kuzey İrlanda': {'id': 768, 'name': 'Northern Ireland', 'code': 'K.İR'},
    'Letonya': {'id': 1574, 'name': 'Latvia', 'code': 'LET'},
    'Lihtenştayn': {'id': 1577, 'name': 'Liechtenstein', 'code': 'LİH'},
    'Litvanya': {'id': 1112, 'name': 'Lithuania', 'code': 'LİT'},
    'Lüksemburg': {'id': 775, 'name': 'Luxembourg', 'code': 'LÜK'},
    'Macaristan': {'id': 771, 'name': 'Hungary', 'code': 'MAC'},
    'Malta': {'id': 1579, 'name': 'Malta', 'code': 'MLT'},
    'Moldova': {'id': 1580, 'name': 'Moldova', 'code': 'MOL'},
    'Norveç': {'id': 1115, 'name': 'Norway', 'code': 'NOR'},
    'Polonya': {'id': 24, 'name': 'Poland', 'code': 'POL'},
    'Portekiz': {'id': 27, 'name': 'Portugal', 'code': 'POR'},
    'Romanya': {'id': 776, 'name': 'Romania', 'code': 'ROM'},
    'San Marino': {'id': 1581, 'name': 'San Marino', 'code': 'SMR'},
    'Slovakya': {'id': 777, 'name': 'Slovakia', 'code': 'SLV'},
    'Slovenya': {'id': 778, 'name': 'Slovenia', 'code': 'SLO'},
    'Sırbistan': {'id': 14, 'name': 'Serbia', 'code': 'SIR'},
    'Türkiye': {'id': 769, 'name': 'Turkey', 'code': 'TÜR'},
    'Ukrayna': {'id': 1114, 'name': 'Ukraine', 'code': 'UKR'},
    'Yunanistan': {'id': 779, 'name': 'Greece', 'code': 'YUN'},
    'Çekya': {'id': 766, 'name': 'Czech Republic', 'code': 'ÇEK'},
    'İngiltere': {'id': 10, 'name': 'England', 'code': 'İNG'},
    'İrlanda': {'id': 1116, 'name': 'Republic of Ireland', 'code': 'İRL'},
    'İskoçya': {'id': 1113, 'name': 'Scotland', 'code': 'İSK'},
    'İspanya': {'id': 9, 'name': 'Spain', 'code': 'İSP'},
    'İsrail': {'id': 1117, 'name': 'Israel', 'code': 'İSR'},
    'İsveç': {'id': 1119, 'name': 'Sweden', 'code': 'İSVE'},
    'İsviçre': {'id': 15, 'name': 'Switzerland', 'code': 'İSV'},
    'İtalya': {'id': 768, 'name': 'Italy', 'code': 'İTA'},
    'İzlanda': {'id': 1120, 'name': 'Iceland', 'code': 'İZL'}
}

for k, v in UNL_TEAMS.items():
    tid = v['id']
    v['logo'] = 'https://media.api-sports.io/football/teams/' + str(tid) + '.png'

with open('unl_teams_verified.json', 'w', encoding='utf-8') as f:
    json.dump(UNL_TEAMS, f, ensure_ascii=False, indent=2)

print('Saved UNL teams successfully:', len(UNL_TEAMS))
