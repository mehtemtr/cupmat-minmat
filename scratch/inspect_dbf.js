const fs = require('fs');

const CKOGR_PATH = "d:/2026 dünya/farklı oku/1/NORMAL/CKOGR.DAT";
const DRS_PATH = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT";
const GRADE_PATH = "d:/2026 dünya/farklı oku/1/NORMAL/GRADE.DAT";

function inspectFileHeader(filePath, name) {
  if (!fs.existsSync(filePath)) {
    console.log(`${name} does not exist at ${filePath}`);
    return;
  }
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(1024);
  fs.readSync(fd, buffer, 0, 1024, 0);
  fs.closeSync(fd);

  console.log(`=== Inspecting ${name} (${filePath}) ===`);
  console.log("File Type Byte:", buffer[0].toString(16));
  
  // DBase III header starts with 0x03, 0x83, 0xf5, 0x8b, etc.
  if (buffer[0] !== 0x03 && buffer[0] !== 0x83 && buffer[0] !== 0xf5 && buffer[0] !== 0x8b) {
    console.log("Not a standard DBF file!");
    // Dump first 64 bytes as hex
    console.log("First 64 bytes hex:", buffer.slice(0, 64).toString('hex'));
    console.log("First 64 bytes ascii:", buffer.slice(0, 64).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
    return;
  }

  const numRecords = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  console.log("Number of Records:", numRecords);
  console.log("Header Length:", headerLength);
  console.log("Record Length:", recordLength);

  // Read fields
  const numFields = Math.floor((headerLength - 33) / 32);
  console.log(`Fields (${numFields}):`);
  for (let i = 0; i < numFields; i++) {
    const offset = 32 + i * 32;
    if (offset + 32 > buffer.length) break;
    // Check for field terminator
    if (buffer[offset] === 0x0D) {
      console.log(`  [End of fields marker at offset ${offset}]`);
      break;
    }
    const fieldName = buffer.toString('ascii', offset, offset + 11).replace(/\0/g, '').trim();
    if (!fieldName) continue;
    const fieldType = String.fromCharCode(buffer[offset + 11]);
    const fieldLen = buffer[offset + 16];
    const fieldDec = buffer[offset + 17];
    console.log(`  - ${fieldName} (${fieldType}) len=${fieldLen} dec=${fieldDec}`);
  }
  
  // Dump first record if we can
  console.log("\nFirst 100 bytes of data (after header):");
  const dataStart = headerLength;
  const dataFd = fs.openSync(filePath, 'r');
  const dataBuf = Buffer.alloc(200);
  fs.readSync(dataFd, dataBuf, 0, 200, dataStart);
  fs.closeSync(dataFd);
  console.log("Hex:", dataBuf.toString('hex'));
  console.log("Ascii (Turkish OEM857/CP857 or similar):", dataBuf.toString('binary').replace(/[^\x20-\x7E]/g, '.'));
  console.log();
}

inspectFileHeader(CKOGR_PATH, "CKOGR.DAT");
inspectFileHeader(DRS_PATH, "DRS.DAT");
inspectFileHeader(GRADE_PATH, "GRADE.DAT");
inspectFileHeader("d:/2026 dünya/farklı oku/1/NORMAL/BAHDRS98.DAT", "BAHDRS98.DAT");
