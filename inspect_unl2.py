# -*- coding: utf-8 -*-
import openpyxl, json, sys
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['U Uluslar L']
rows = list(ws.iter_rows(values_only=True))

print('Total rows in U Uluslar L:', len(rows))
for r_idx in range(min(10, len(rows))):
    print(f'Row {r_idx}: {[c for c in rows[r_idx] if c is not None]}')

matches = []
for i, r in enumerate(rows[3:]):
    if r[1] is not None:
        matches.append(r)

print('Total valid matches in U Uluslar L:', len(matches))
print('Sample match 0:', matches[0])
