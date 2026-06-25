const fs = require('fs');
const path = require('path');

const dir = 'd:/2026 dünya/dictionaries';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'tr.json');

files.forEach(file => {
  const filePath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.fantasy && data.fantasy.stages) {
    // Insert matchday_4 right after matchday_3
    const newStages = {};
    Object.keys(data.fantasy.stages).forEach(key => {
      newStages[key] = data.fantasy.stages[key];
      if (key === 'matchday_3') {
        newStages['matchday_4'] = '4th Matchday (Group)';
      }
    });
    data.fantasy.stages = newStages;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
});
