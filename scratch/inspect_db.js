const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
const files = fs.readdirSync(workspaceDir).filter(f => f.startsWith('.env'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(workspaceDir, file), 'utf8');
  console.log(`--- Keys in ${file} ---`);
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        console.log(trimmed.substring(0, idx));
      }
    }
  });
});
