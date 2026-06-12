const fs = require('fs');

const files = [
  { path: "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT", name: "ELOGR.DAT" },
  { path: "d:/2026 dünya/farklı oku/1/NORMAL/ELOGRE.DAT", name: "ELOGRE.DAT" },
  { path: "d:/2026 dünya/farklı oku/1/NORMAL/ELGUZ01L.DAT", name: "ELGUZ01L.DAT" }
];

files.forEach((f) => {
  if (!fs.existsSync(f.path)) {
    console.log(`${f.name} not found`);
    return;
  }
  const content = fs.readFileSync(f.path);
  console.log(`=== ${f.name} ===`);
  console.log("Size:", content.length, "bytes");
  console.log("Hex (first 64 bytes):", content.slice(0, 64).toString('hex'));
  console.log("Ascii (first 120 bytes):", content.slice(0, 120).toString('binary').replace(/[^\x20-\x7E]/g, '.'));
  console.log();
});
