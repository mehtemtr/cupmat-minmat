const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 446;
  const headerSize = 10;
  const numRecords = (content.length - headerSize) / recordSize;
  
  console.log(`=== Decoding first 10 students from ${filePath} ===`);
  for (let i = 0; i < Math.min(10, numRecords); i++) {
    const start = headerSize + i * recordSize;
    const rec = content.slice(start, start + recordSize);
    
    // Parse header fields (strings)
    const stdNo = rec.slice(0, 8).toString('ascii').trim();
    
    // Let's print all strings of length > 2 in the first 150 bytes
    let fields = [];
    let cur = "";
    for (let j = 8; j < 150; j++) {
      const char = rec[j];
      if (char >= 32 && char <= 126 || char === 0x9e || char === 0x98 || char === 0x87 || char === 0x9f || char === 0x8d || char === 0x94 || char === 0x92) {
        // CP857 Turkish characters
        let c = String.fromCharCode(char);
        if (char === 0x9e) c = 'ş';
        if (char === 0x98) c = 'ı';
        if (char === 0x87) c = 'ç';
        if (char === 0x9f) c = 'ş'; // capital Ş or similar
        if (char === 0x8d) c = 'ı';
        if (char === 0x94) c = 'ö';
        if (char === 0x92) c = 'ö';
        cur += c;
      } else {
        if (cur.trim().length > 1) {
          fields.push(cur.trim());
        }
        cur = "";
      }
    }
    if (cur.trim().length > 1) fields.push(cur.trim());
    
    // Scan from offset 150 to end for non-zero data
    let nonZeroData = [];
    for (let j = 150; j < recordSize; j += 4) {
      if (j + 4 > recordSize) break;
      const val1 = rec.readUInt16LE(j);
      const b3 = rec[j+2];
      const b4 = rec[j+3];
      if (val1 !== 0 || b3 !== 0 || b4 !== 0) {
        nonZeroData.push({ offset: j, val1, b3, b4 });
      }
    }
    
    console.log(`Std ${i}: No=${stdNo} Fields=${JSON.stringify(fields)}`);
    console.log(`  Non-Zero Data:`);
    nonZeroData.forEach((d) => {
      console.log(`    - Offset ${d.offset}: 2-byte=${d.val1} (hex: ${d.val1.toString(16)}), byte3=${d.b3} (${d.b3.toString(16)} / '${String.fromCharCode(d.b3)}'), byte4=${d.b4} (${d.b4.toString(16)} / '${String.fromCharCode(d.b4)}')`);
    });
  }
} else {
  console.log("File not found");
}
