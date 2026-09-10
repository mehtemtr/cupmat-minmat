# -*- coding: utf-8 -*-
import openpyxl, json, sys
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['U Uluslar L']
rows = list(ws.iter_rows(values_only=True))

weeks = {}
teams = set()
for r in rows[3:]:
    if r[1] is not None:
        hafta = r[1]
        lig = r[2]
        grup = r[3]
        tarih = r[4]
        saat = r[5]
        ev = r[6]
        dep = r[7]
        teams.add(ev)
        teams.add(dep)
        key = f'Hafta {hafta} - Lig {lig}'
        weeks[key] = weeks.get(key, 0) + 1

print('Total teams:', len(teams))
print('Teams list:', sorted(list(teams)))
print('Weeks distribution:', weeks)
