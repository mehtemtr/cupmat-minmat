const fs = require('fs');
const text = fs.readFileSync('scratch_parse_euro_matches.js', 'utf8');
const start = text.indexOf('`');
const end = text.lastIndexOf('`');
fs.writeFileSync('raw_matches.txt', text.substring(start + 1, end));
