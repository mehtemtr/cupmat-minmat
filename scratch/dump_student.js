const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 446;
  const headerSize = 10;
  
  const record = content.slice(headerSize, headerSize + recordSize);
  console.log("=== First Student Record in ELOGR.DAT ===");
  console.log("Hex dump:");
  for (let i = 0; i < recordSize; i += 16) {
    const chunk = record.slice(i, Math.min(i + 16, recordSize));
    const hex = chunk.toString('hex').padEnd(32, ' ');
    const text = chunk.toString('binary').replace(/[^\x20-\x7E]/g, '.');
    console.log(`${i.toString(16).padStart(3, '0')}: ${hex} | ${text}`);
  }
} else {
  console.log("File not found");
}
