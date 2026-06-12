const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 1496;
  const headerSize = 10;
  
  // Dump the first student (Haydar Subasi)
  const rec = content.slice(headerSize, headerSize + recordSize);
  const stdNo = rec.slice(0, 8).toString('ascii').trim();
  
  console.log(`Student: ${stdNo}`);
  
  // Let's list all courses in Block 1 (Vize) at offset 416
  // Up to 15 entries (each 3 bytes: 2 bytes courseId, 1 byte grade)
  console.log("\n--- Block 1 (Offset 416) ---");
  for (let i = 0; i < 15; i++) {
    const offset = 416 + i * 3;
    const courseId = rec.readUInt16LE(offset);
    const grade = rec[offset + 2];
    if (courseId !== 0) {
      console.log(`  Course ID ${courseId}: Grade Code = ${grade} (${String.fromCharCode(grade)})`);
    }
  }

  // Let's list all courses in Block 2 (Final) at offset 518
  console.log("\n--- Block 2 (Offset 518) ---");
  for (let i = 0; i < 15; i++) {
    const offset = 518 + i * 3;
    const courseId = rec.readUInt16LE(offset);
    const grade = rec[offset + 2];
    if (courseId !== 0) {
      console.log(`  Course ID ${courseId}: Grade Code = ${grade} (${String.fromCharCode(grade)})`);
    }
  }
}
