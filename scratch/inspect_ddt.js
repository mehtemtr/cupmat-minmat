const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DDT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  console.log("DRS.DDT Size:", content.length, "bytes");
  console.log("Hex (first 64 bytes):", content.slice(0, 64).toString('hex'));
  console.log("Ascii (first 100 bytes):", content.slice(0, 100).toString('binary').replace(/[^\x20-\x7E]/g, '.'));
} else {
  console.log("File not found");
}
