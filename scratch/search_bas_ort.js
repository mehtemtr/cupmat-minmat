const fs = require('fs');

const basFiles = [
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\CIKDENE2.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\CIKIS.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\CIKISREN.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\CIKISY.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\CIKIS .BAS',
  'd:\\2026 dünya\\farklı oku\\1\\ABDULLAH\\MEZUN .BAS',
  'd:\\2026 dünya\\farklı oku\\1\\AUTOEXE.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\CIKIS.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\CIKISYED.BAS',
  'd:\\2026 dünya\\farklı oku\\1\\CIKIS .BAS'
];

basFiles.forEach((filePath) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath);
  
  let currentString = "";
  let lines = [];
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === 10 || char === 13) {
      if (currentString.trim().length > 0) {
        lines.push(currentString.trim());
      }
      currentString = "";
    } else if (char >= 32 && char <= 126) {
      currentString += String.fromCharCode(char);
    } else {
      if (currentString.length > 0 && currentString[currentString.length - 1] !== ' ') {
        currentString += ' ';
      }
    }
  }
  
  const matches = lines.filter(line => {
    const l = line.toUpperCase();
    return l.includes("ORT") || l.includes("DIP") || l.includes("ORTALAMA") || l.includes("GNO") || l.includes("NOT");
  });
  
  if (matches.length > 0) {
    console.log(`=== Matches in ${filePath} ===`);
    matches.forEach(m => console.log(`  ${m}`));
    console.log();
  }
});
