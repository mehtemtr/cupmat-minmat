import struct
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

elogr_path = r"d:\2026 dünya\farklı oku\1\NORMAL\ELOGR.DAT"

with open(elogr_path, "rb") as f:
    header = f.read(10)
    elogr_content = f.read()

record_size = 1496
num_records = len(elogr_content) // record_size

offset_57_values = []
offset_136_values = []

for i in range(num_records):
    start = i * record_size
    rec = elogr_content[start : start + record_size]

    val_57 = struct.unpack("<H", rec[57:59])[0]
    val_136 = struct.unpack("<H", rec[136:138])[0]

    offset_57_values.append(val_57)
    offset_136_values.append(val_136)

print("=== Offsets Distribution for NORMAL/ELOGR.DAT ===")
print("Offset 57-58 value counts:")
for val, count in Counter(offset_57_values).most_common():
    print(f"  - Value {val:3d} (hex: {val:04x}): {count} times")

print("\nOffset 136-137 value counts:")
for val, count in Counter(offset_136_values).most_common():
    print(f"  - Value {val:3d} (hex: {val:04x}): {count} times")
