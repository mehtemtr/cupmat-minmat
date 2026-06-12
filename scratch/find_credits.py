import struct
import os

filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT"

if os.path.exists(filePath):
    with open(filePath, 'rb') as f:
        content = f.read()
    
    record_size = 46
    header_size = 10
    num_records = (len(content) - header_size) // record_size
    
    print(f"Total courses: {num_records}")
    
    # We want to check the bytes at offsets 36, 37, 38, 39, 40, 41, 42, 43, 44, 45
    # Let's print unique values at each offset to see if one of them represents credits (e.g. values like 2, 3, 4, 5)
    for offset in range(36, 46):
        values = set()
        for i in range(num_records):
            rec_start = header_size + i * record_size
            val = content[rec_start + offset]
            values.add(val)
        print(f"Offset {offset} unique values: {sorted(list(values))[:20]} ... (total {len(values)})")
else:
    print("File not found")
