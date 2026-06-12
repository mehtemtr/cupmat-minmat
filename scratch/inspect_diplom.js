const fs = require('fs');

const files = [
  "d:/2026 dünya/farklı oku/1/NORMAL/ELDIPLOM.TXT",
  "d:/2026 dünya/farklı oku/1/MEZUN/NORDIP/ELDIPLOM.TXT"
];

files.forEach((f) => {
  if (!fs.existsSync(f)) {
    console.log(`${f} not found`);
    return;
  }
  const content = fs.readFileSync(f);
  console.log(`=== ${f} ===`);
  console.log("Size:", content.length, "bytes");
  // Print first 500 characters
  console.log(content.slice(0, 500).toString('binary').replace(/[^\x20-\x7E]/g, '.'));
  console.log("\n------------------------------------\n");
});
