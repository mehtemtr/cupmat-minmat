const fs = require('fs');
const path = require('path');

function addEdge(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addEdge(fullPath);
    } else if (file === 'route.ts' || file === 'route.js' || file === 'layout.tsx' || file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip if it already has edge runtime
      if (content.includes("runtime = 'edge'") || content.includes('runtime = "edge"')) {
        continue;
      }
      
      // Skip if it's a client component
      if (content.includes('"use client"') || content.includes("'use client'")) {
        continue;
      }

      fs.writeFileSync(fullPath, "export const runtime = 'edge';\n" + content);
      console.log('Added edge runtime to', fullPath);
    }
  }
}

addEdge('app');
