const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
const filesToCheck = ['.env.production.local', '.env.local', '.env'];

filesToCheck.forEach(file => {
  const filePath = path.join(workspaceDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n=== Lines in ${file} ===`);
    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      if (line.includes('SUPABASE') || line.includes('URL') || line.includes('PASSWORD')) {
        console.log(line);
      }
    });
  }
});
