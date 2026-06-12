const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 46;
  const headerSize = 10;
  
  console.log("=== Course Records in DRS.DAT ===");
  for (let i = 0; i < 10; i++) {
    const start = headerSize + i * recordSize;
    const record = content.slice(start, start + recordSize);
    const hex = record.toString('hex');
    const code = record.slice(0, 6).toString('ascii').trim();
    const name = record.slice(6, 36).toString('binary').replace(/[^\x20-\x7E]/g, '.').trim();
    
    // Remaining bytes at the end of the record (from offset 36 to 46)
    const rest = record.slice(36);
    console.log(`Rec ${i}: Code=${code.padEnd(7)} Name=${name.padEnd(30)} Rest Hex=${rest.toString('hex')} Rest Dec=${Array.from(rest).join(' ')}`);
  }
} else {
  console.log("File not found");
}
