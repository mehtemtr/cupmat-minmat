const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 1496;
  const headerSize = 10;
  
  const rec = content.slice(headerSize, headerSize + recordSize);
  console.log("=== Inspecting 1496-byte Record for HAYDAR SUBAŞI ===");
  
  // Print strings in different sections
  const printString = (offset, maxLen, label) => {
    let s = "";
    for (let i = 0; i < maxLen; i++) {
      const char = rec[offset + i];
      if (char === 0 || char === 0x0D || char === 0x0A) break;
      let c = String.fromCharCode(char);
      // CP857 Turkish translation
      if (char === 0x9e || char === 0x9f) c = 'ş';
      if (char === 0x98 || char === 0x8d) c = 'ı';
      if (char === 0x87) c = 'ç';
      if (char === 0x94 || char === 0x92) c = 'ö';
      s += c;
    }
    console.log(`  ${label} (Offset ${offset}): "${s.trim()}"`);
  };

  printString(0, 8, "Student No");
  printString(9, 30, "Name");
  printString(39, 15, "Father Name");
  printString(54, 15, "Mother Name");
  printString(69, 15, "Birth Place");
  printString(84, 10, "Birth Date");
  
  // Let's scan the rest of the 1496 bytes for any non-zero blocks
  console.log("\nNon-zero blocks in record:");
  let blockStart = -1;
  for (let i = 94; i < recordSize; i++) {
    const val = rec[i];
    if (val !== 0) {
      if (blockStart === -1) blockStart = i;
    } else {
      if (blockStart !== -1) {
        const blockLen = i - blockStart;
        if (blockLen >= 2) {
          const chunk = rec.slice(blockStart, i);
          console.log(`  - Block at offset ${blockStart} to ${i - 1} (len=${blockLen}):`);
          console.log(`    Hex: ${chunk.toString('hex')}`);
          console.log(`    Ascii: ${chunk.toString('binary').replace(/[^\x20-\x7E]/g, '.')}`);
        }
        blockStart = -1;
      }
    }
  }
  if (blockStart !== -1) {
    console.log(`  - Block at offset ${blockStart} to ${recordSize - 1} (len=${recordSize - blockStart})`);
  }
} else {
  console.log("File not found");
}
