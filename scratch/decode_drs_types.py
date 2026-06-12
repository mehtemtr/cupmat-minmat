import struct
import os
import re

filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT"

if os.path.exists(filePath):
    with open(filePath, 'rb') as f:
        content = f.read()
    
    record_size = 46
    header_size = 10
    num_records = (len(content) - header_size) // record_size
    
    print("=== Decoding course metadata in DRS.DAT ===")
    for i in range(15):
        rec_start = header_size + i * record_size
        record = content[rec_start:rec_start + record_size]
        
        # Safe decoding
        code = record[0:6].decode('ascii', errors='ignore').strip()
        name_raw = record[6:36].decode('latin-1', errors='ignore').strip()
        # Clean non-printable/non-ascii
        name = re.sub(r'[^\x20-\x7E]', '.', name_raw)
        
        # Let's decode different possible types from offset 36
        int1 = struct.unpack('<h', record[36:38])[0]
        int2 = struct.unpack('<h', record[38:40])[0]
        int3 = struct.unpack('<h', record[40:42])[0]
        int4 = struct.unpack('<h', record[42:44])[0]
        int5 = struct.unpack('<h', record[44:46])[0]
        
        # 2. 4-byte Float (Single) at 36, 40
        try:
            float1 = struct.unpack('<f', record[36:40])[0]
        except:
            float1 = float('nan')
        try:
            float2 = struct.unpack('<f', record[40:44])[0]
        except:
            float2 = float('nan')
            
        # 3. Single bytes
        b36 = record[36]
        b38 = record[38]
        b40 = record[40]
        b41 = record[41]
        b42 = record[42]
        b43 = record[43]
        b44 = record[44]
        b45 = record[45]
        
        print(f"Rec {i}: Code={code.ljust(7)} Name={name[:15].ljust(15)}")
        print(f"  Ints: {int1}, {int2}, {int3}, {int4}, {int5}")
        print(f"  Floats: {float1:.3f}, {float2:.3f}")
        print(f"  Bytes: 36={b36}, 38={b38}, 40={b40}, 41={b41}, 42={b42}, 43={b43}, 44={b44}, 45={b45}")
else:
    print("File not found")
