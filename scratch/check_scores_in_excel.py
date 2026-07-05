import pandas as pd

df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name="Son 32")

# Check first row
print("Columns:", list(df.columns))

# Print unique values in "Maç" column along with first occurrence row to see scores
first_col = str(df.columns[0]).strip().lower()
offset = 1 if "kaleciler" in first_col or "diğerleri" in first_col else 0

match_col = df.columns[0 + offset]

unique_matches = df[match_col].dropna().unique()
print("\nMatches and scores in Excel:")
for m in unique_matches:
    if m == "Maç":
        continue
    # Get the first row where this match appears
    row = df[df[match_col] == m].iloc[0]
    print(f"Match: {m}")
