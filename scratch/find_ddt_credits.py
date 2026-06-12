import os
import struct

filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DDT"

if os.path.exists(filePath):
    with open(filePath, 'rb') as f:
        content = f.read()
    
    print("DRS.DDT file size:", len(content))
    
    # Let's search for "GENEL EKONOM" or other names and print the 40 bytes around it
    idx = content.find(b"GENEL EKONOM")
    if idx != -1:
        print(f"Found 'GENEL EKONOM' at offset {idx}")
        chunk = content[idx - 4: idx + 36]
        print("Hex:", chunk.toString('hex') if hasattr(chunk, 'toString') else chunk.hex())
        print("Bytes:", list(chunk))
        
    idx2 = content.find(b"VERG")
    if idx2 != -1:
        print(f"Found 'VERG' at offset {idx2}")
        chunk = content[idx2 - 4: idx2 + 36]
        print("Hex:", chunk.hex())
        print("Bytes:", list(chunk))
else:
    print("File not found")
