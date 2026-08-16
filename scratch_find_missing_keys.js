const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'dictionaries');
const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.json'));

const trData = JSON.parse(fs.readFileSync(path.join(dictDir, 'tr.json'), 'utf8'));

// Flatten JSON to handle nested keys
function flattenObj(obj, parent = '', res = {}) {
    for (let key in obj) {
        let propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const trFlat = flattenObj(trData);
const trKeys = Object.keys(trFlat);

let allMissing = {};

for (const file of files) {
    if (file === 'tr.json') continue;
    const lang = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(dictDir, file), 'utf8'));
    const flat = flattenObj(data);
    const flatKeys = Object.keys(flat);
    
    const missingKeys = trKeys.filter(k => !flatKeys.includes(k) || flat[k] === '' || flat[k] === null || flat[k] === undefined);
    
    if (missingKeys.length > 0) {
        allMissing[lang] = missingKeys;
    }
}

console.log(JSON.stringify(allMissing, null, 2));
