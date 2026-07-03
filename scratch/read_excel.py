import pandas as pd

file_path = "futbolcuistatistikleri.xlsx"
df = pd.read_excel(file_path, sheet_name="grup 1")

# Find goalkeepers (Mevki is 'K')
gk_df = df[df['Mevki'] == 'K']
print("Goalkeeper rows:")
print(gk_df.to_string())
