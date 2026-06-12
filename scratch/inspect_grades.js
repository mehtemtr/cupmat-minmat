const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 446;
  const headerSize = 10;
  
  // Dump Std 0 (Haydar Subasi) and Std 7
  [0, 7].forEach((stdIdx) => {
    const start = headerSize + stdIdx * recordSize;
    const rec = content.slice(start, start + recordSize);
    
    console.log(`\n=== Student ${stdIdx} (${rec.slice(0, 8).toString('ascii').trim()}) ===`);
    console.log("Semester records (offset 200 to 280):");
    for (let offset = 200; offset < 280; offset += 4) {
      const year = rec.readUInt16LE(offset);
      const sem = rec[offset + 2];
      const count = rec[offset + 3];
      if (year !== 0 || sem !== 0 || count !== 0) {
        console.log(`  Offset ${offset}: Year=${year}, Sem=${sem}, CourseCount=${count}`);
      }
    }
    
    console.log("Course Grade records (offset 280 to 446):");
    // Let's print in chunks of 4 or 6 bytes depending on the structure
    // Let's guess 4 bytes or 6 bytes?
    // Let's look at offset 286: 2-byte=704, byte3=110, byte4=193.
    // If it is 4 bytes:
    // Entry 1: offset 286 (704, 110, 193?) Wait.
    // If it is 3 bytes or 4 bytes?
    // Let's dump the exact bytes of offset 280 to 446 as decimal and hex:
    let line = "";
    for (let offset = 280; offset < 446; offset++) {
      const val = rec[offset];
      line += `${val.toString().padStart(3, ' ')} (${val.toString(16).padStart(2, '0')}) `;
      if ((offset - 280 + 1) % 10 === 0) {
        console.log(`  Offset ${offset - 9}: ${line}`);
        line = "";
      }
    }
    if (line) {
      console.log(`  Offset ${446 - line.length/10}: ${line}`);
    }
  });
}
