import hashlib
import os
import glob
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

pattern = os.path.join(r"d:\2026 dünya\farklı oku", "**", "*OGR.DAT")
ogr_files = glob.glob(pattern, recursive=True)

print(f"Found {len(ogr_files)} OGR.DAT files.")

checksum_map = defaultdict(list)

for fpath in ogr_files:
    try:
        with open(fpath, "rb") as f:
            content = f.read()
        md5 = hashlib.md5(content).hexdigest()
        # Get relative path from 'farklı oku'
        rel_path = os.path.relpath(fpath, r"d:\2026 dünya\farklı oku")
        checksum_map[md5].append((rel_path, len(content)))
    except Exception as e:
        print(f"Error hashing {fpath}: {e}")

print("\n=== Grouping identical student databases by MD5 Checksum ===")
group_idx = 1
for md5, occurrences in sorted(
    checksum_map.items(), key=lambda x: len(x[1]), reverse=True
):
    print(f"\nGroup #{group_idx} | MD5: {md5} | Size: {occurrences[0][1]} bytes")
    print(f"Count: {len(occurrences)} occurrences")
    for rel_path, size in occurrences:
        print(f"  - {rel_path}")
    group_idx += 1
