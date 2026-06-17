import os
import glob
import sys

sys.stdout.reconfigure(encoding="utf-8")

pattern_baba = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "BABA.DAT")
baba_files = glob.glob(pattern_baba, recursive=True)

pattern_ana = os.path.join(r"d:\2026 dünya\farklı oku\1", "**", "ANA.DAT")
ana_files = glob.glob(pattern_ana, recursive=True)

def check_alignment(fpath):
    with open(fpath, "rb") as f:
        content = f.read()
    
    r_size = 16
    best_off = -1
    best_valid = -1
    
    for off in range(16):
        valid = 0
        limit = min((len(content) - off) // r_size, 30)
        if limit <= 0:
            continue
        for i in range(limit):
            start = off + i * r_size
            rec = content[start : start + r_size]
            l = rec[0]
            if 2 <= l <= 13:
                string_bytes = rec[1 : 1 + l]
                is_printable = True
                for b in string_bytes:
                    if not (32 <= b <= 126 or b in [0x9E, 0x9F, 0x98, 0x8D, 0x87, 0x94, 0x92, 0x80]):
                        is_printable = False
                        break
                if is_printable:
                    valid += 1
        if valid > best_valid:
            best_valid = valid
            best_off = off
            
    return best_off, best_valid, len(content)

print("=== Checking BABA.DAT Files ===")
for f in sorted(baba_files):
    off, valid, size = check_alignment(f)
    print(f"File: {f.replace('d:\\2026 dünya\\farklı oku\\1\\', '')} | Best Offset: {off} (Valid count: {valid}/30) | Size: {size}")

print("\n=== Checking ANA.DAT Files ===")
for f in sorted(ana_files):
    off, valid, size = check_alignment(f)
    print(f"File: {f.replace('d:\\2026 dünya\\farklı oku\\1\\', '')} | Best Offset: {off} (Valid count: {valid}/30) | Size: {size}")
