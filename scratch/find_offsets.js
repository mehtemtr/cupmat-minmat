const fs = require('fs');

const filePath = "d:/2026 dünya/farklı oku/1/NORMAL/ELOGR.DAT";

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath);
  console.log("File size:", content.length);
  
  // Find all occurrences of 8-digit strings that look like student numbers
  // e.g. "94289023" (starts with 9, 8 digits)
  // Let's search every byte offset
  let lastOffset = -1;
  let diffs = {};
  
  for (let i = 0; i < content.length - 8; i++) {
    const slice = content.slice(i, i + 8).toString('ascii');
    if (/^\d{8}$/.test(slice)) {
      // Check if it's a student number (e.g. 9XXXXXXX or 8XXXXXXX or 0XXXXXXX)
      // Turkish student numbers in the late 90s started with 9 or 8 (year of entry: 94, 95, 96, 97, 98, 99, 00, 01, etc.)
      const year = parseInt(slice.substring(0, 2), 10);
      if ((year >= 80 && year <= 99) || (year >= 0 && year <= 10)) {
        console.log(`Found student no ${slice} at offset ${i}`);
        if (lastOffset !== -1) {
          const diff = i - lastOffset;
          diffs[diff] = (diffs[diff] || 0) + 1;
        }
        lastOffset = i;
      }
    }
  }
  
  console.log("Differences between consecutive student numbers:", diffs);
}
