const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/BAHDRS98.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  console.log("File size:", content.length);
  
  // Dump the first 500 bytes as clean text/hex
  console.log("First 500 bytes:");
  let result = "";
  for (let i = 0; i < Math.min(500, content.length); i++) {
    const char = content[i];
    if (char >= 32 && char <= 126) {
      result += String.fromCharCode(char);
    } else {
      result += `[${char.toString(16).padStart(2, '0')}]`;
    }
  }
  console.log(result);
} else {
  console.log("File not found");
}
