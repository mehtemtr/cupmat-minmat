import pandas as pd

df = pd.read_excel("futbolcuistatistikleri.xlsx", sheet_name="Son 16")
print("Rows in Son 16 sheet:")
print(df.head(20))
