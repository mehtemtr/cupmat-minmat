const fs = require('fs');
const path = require('path');

function searchFolder(dir, targetName) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (file.toLowerCase().includes(targetName.toLowerCase())) {
          results.push(filePath);
        }
        results = results.concat(searchFolder(filePath, targetName));
      }
    });
  } catch(e) {}
  return results;
}

console.log("Searching in d:/2026 dünya for 90lar...");
const found = searchFolder("d:/2026 dünya", "90");
console.log("Found folders:", found);
