import os
import glob
import sys

sys.stdout.reconfigure(encoding="utf-8")

pattern = os.path.join(r"d:\2026 dünya\farklı oku", "**", "*.DAT")
all_dat_files = glob.glob(pattern, recursive=True)

target_no = b"94289023"

print(f"Scanning {len(all_dat_files)} .DAT files for student {target_no.decode()}...")

for fpath in all_dat_files:
    # Skip OGR files since we already know they contain the student
    if fpath.upper().endswith("OGR.DAT") or fpath.upper().endswith("OGRE.DAT"):
        continue

    try:
        with open(fpath, "rb") as f:
            content = f.read()

        idx = content.find(target_no)
        if idx != -1:
            print(f"Found {target_no.decode()} in {fpath} at offset {idx}")
            print(f"  File size: {len(content)} bytes")
            # Print 50 bytes from the match
            print(f"  Raw: {content[idx : idx + 50].hex()}")
    except Exception as e:
        pass
