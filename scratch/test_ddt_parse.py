import os
import struct
import re

filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DDT"

if os.path.exists(filePath):
    with open(filePath, 'rb') as f:
        content = f.read()
    
    record_size = 46
    header_size = 10
    num_records = (len(content) - header_size) // record_size
    
    print(f"Total courses in DRS.DDT: {num_records}")
    
    course_credits = {}
    for i in range(num_records):
        start = header_size + i * record_size
        record = content[start:start+record_size]
        
        # Parse course ID
        course_id_str = record[1:3].decode('ascii', errors='ignore').strip()
            
        # Parse name length
        name_len = record[3]
        if name_len > 30 or name_len == 0:
            name_len = 25
            
        # Parse course name (CP857 Turkish)
        try:
            name_raw = record[4:4+name_len].decode('cp857', errors='ignore').strip()
            name = name_raw.upper()
        except Exception as e:
            name = ""
            
        credits = record[32]
        
        if name:
            course_credits[name] = credits
            # Replace non-ascii for terminal printing safety
            print_name = re.sub(r'[^\x20-\x7E]', '.', name)
            if i < 30:
                print(f"Course: {print_name.ljust(25)} ID={course_id_str.ljust(3)} Credits={credits}")
                
    print(f"\nSuccessfully read {len(course_credits)} unique course credit mappings.")
else:
    print("File not found")
