const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/DRS.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  console.log("File size:", content.length);
  
  // Find course codes like "MUH270", "CEK174", "EL106"
  let lastOffset = -1;
  let diffs = {};
  
  for (let i = 0; i < content.length - 6; i++) {
    const slice = content.slice(i, i + 6).toString('ascii');
    // Match 3 uppercase letters followed by 3 digits (standard Turkish course codes)
    if (/^[A-Z]{3}\d{3}$/.test(slice)) {
      console.log(`Found course code ${slice} at offset ${i}`);
      if (lastOffset !== -1) {
        const diff = i - lastOffset;
        diffs[diff] = (diffs[diff] || 0) + 1;
      }
      lastOffset = i;
    }
  }
  
  console.log("Differences between consecutive course codes:", diffs);
}
