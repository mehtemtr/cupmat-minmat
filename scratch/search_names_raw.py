import os
import glob
import sys

sys.stdout.reconfigure(encoding="utf-8")

search_names = [b"Besim", b"Birol", b"Hasan", b"Onur", b"Omer", b"Cuma", b"Cemil"]

pattern = os.path.join(r"d:\2026 dünya\farklı oku", "**", "*")
all_files = glob.glob(pattern, recursive=True)

for fpath in all_files:
    if os.path.isdir(fpath):
        continue
    # skip excel files to avoid noise
    if fpath.endswith(".xlsx"):
        continue

    try:
        with open(fpath, "rb") as f:
            content = f.read()

        for name in search_names:
            idx = content.find(name)
            if idx != -1:
                print(
                    f"Found '{name.decode()}' in {fpath} at byte offset {idx}"
                )
    except Exception as e:
        pass
