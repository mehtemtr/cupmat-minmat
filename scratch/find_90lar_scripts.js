const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(searchFiles(filePath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.py' || ext === '.js' || ext === '.txt') {
          results.push(filePath);
        }
      }
    });
  } catch(e) {}
  return results;
}

console.log("Searching in d:/2026 dünya/90lar for script/text files...");
const found = searchFiles("d:/2026 dünya/90lar");
console.log("Found files:", found);
