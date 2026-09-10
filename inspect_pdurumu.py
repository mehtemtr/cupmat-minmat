# -*- coding: utf-8 -*-
import openpyxl, json, sys
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('cupmat maç programı.xlsx', data_only=True)
ws = wb['P Durumu']
rows = list(ws.iter_rows(values_only=True))

print('Total rows in P Durumu:', len(rows))
for r_idx in range(len(rows)):
    row = [str(c) if c is not None else '' for c in rows[r_idx]]
    # Check non-empty
    if any(row):
        print(f'Row {r_idx:02d}: {row[:10]} | {row[11:20]} | {row[21:30]} | {row[31:41]}')
