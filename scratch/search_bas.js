const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.toLowerCase().endsWith('.bas')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const basFiles = walk("d:/2026 dünya/farklı oku");
console.log("Found .BAS files:", basFiles);
