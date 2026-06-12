const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/BAHDRS98.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  const recordSize = 24;
  const headerSize = 10;
  const numRecords = (content.length - headerSize) / recordSize;
  
  console.log(`File: ${filePath}`);
  console.log(`Total size: ${content.length} bytes`);
  console.log(`Header: ${content.slice(0, headerSize).toString('hex')}`);
  console.log(`Number of records: ${numRecords}\n`);
  
  for (let i = 0; i < Math.min(20, numRecords); i++) {
    const start = headerSize + i * recordSize;
    const record = content.slice(start, start + recordSize);
    
    const hex = record.toString('hex');
    const text = record.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
    
    // Parse fields
    const prefix = record[0];
    const courseCode = record.slice(1, 6).toString('ascii').trim();
    const grade = record.slice(6, 8).toString('ascii').trim();
    const val1 = record.readUInt16LE(8);
    const val2 = record.readUInt16LE(10);
    const val3 = record.readUInt16LE(12);
    const rest = record.slice(14).toString('hex');
    
    console.log(`Rec ${i.toString().padStart(3, '0')}: Prefix=${prefix} Course=${courseCode.padEnd(6)} Grade=${grade.padEnd(3)} Val1=${val1.toString().padEnd(5)} Val2=${val2.toString().padEnd(5)} Val3=${val3.toString().padEnd(5)} Rest=${rest} | ${text}`);
  }
} else {
  console.log("File not found");
}
