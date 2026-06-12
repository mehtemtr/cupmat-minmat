const fs = require('fs');

const filePaths = [
  "d:/2026 dünya/farklı oku/1/CIKIS.BAS",
  "d:/2026 dünya/farklı oku/1/CIKISYED.BAS"
];

filePaths.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`${filePath} does not exist.`);
    return;
  }
  
  const content = fs.readFileSync(filePath);
  console.log(`=== Printing readable strings from ${filePath} ===`);
  
  // QuickBasic binary files (.BAS) have strings stored. We can extract lines that look like code.
  // Standard QB binary format has tokens, but strings and identifiers are in plain ASCII.
  // Let's filter out non-printable chars.
  let currentString = "";
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === 10 || char === 13) {
      if (currentString.trim().length > 3) {
        console.log(currentString.trim());
      }
      currentString = "";
    } else if (char >= 32 && char <= 126) {
      currentString += String.fromCharCode(char);
    } else {
      // replace with space or ignore
      if (currentString.length > 0 && currentString[currentString.length - 1] !== ' ') {
        currentString += ' ';
      }
    }
  }
  if (currentString.trim().length > 3) {
    console.log(currentString.trim());
  }
  console.log("\n-----------------------------------------------\n");
});
