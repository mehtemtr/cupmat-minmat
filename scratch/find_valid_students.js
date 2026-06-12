const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 446;
  const headerSize = 10;
  const numRecords = (content.length - headerSize) / recordSize;
  
  console.log(`Total records: ${numRecords}`);
  let count = 0;
  for (let i = 0; i < numRecords; i++) {
    const start = headerSize + i * recordSize;
    const rec = content.slice(start, start + recordSize);
    const stdNo = rec.slice(0, 8).toString('ascii').trim();
    
    // Check if stdNo is a valid number (e.g. starts with 9 or 8 or 0)
    if (/^\d+$/.test(stdNo)) {
      count++;
      if (count <= 10) {
        // Find name
        let name = "";
        for (let j = 9; j < 50; j++) {
          const char = rec[j];
          if (char === 0x0D || char === 0x0A || char === 0) break;
          let c = String.fromCharCode(char);
          if (char === 0x9e) c = 'ş';
          if (char === 0x98) c = 'ı';
          if (char === 0x87) c = 'ç';
          if (char === 0x9f) c = 'ş'; 
          if (char === 0x8d) c = 'ı';
          if (char === 0x94) c = 'ö';
          if (char === 0x92) c = 'ö';
          name += c;
        }
        console.log(`Valid Student #${count} (Record ${i}): No=${stdNo} Name=${name.trim()}`);
      }
    }
  }
  console.log(`Total valid students: ${count}`);
}
