import os
import glob
import sys

sys.stdout.reconfigure(encoding="utf-8")

pattern = os.path.join(
    r"d:\2026 dünya\farklı oku\1\NORMAL", "EL*.DAT"
)  # e.g. ELGUZ97T.DAT, ELBAH97T.DAT etc
term_files = glob.glob(pattern)

target_no = b"94289023"

for fpath in term_files:
    fname = os.path.basename(fpath)
    if fname.upper() in ["ELOGR.DAT", "ELOGRE.DAT"]:
        continue
    try:
        with open(fpath, "rb") as f:
            content = f.read()
        idx = content.find(target_no)
        if idx != -1:
            print(f"Found {target_no.decode()} in {fname} at offset {idx}")
            print(f"  Raw: {content[idx:idx+100].hex()}")
            print(
                f"  Text: {content[idx:idx+100].decode('cp857', errors='ignore')}"
            )
    except Exception as e:
        pass
