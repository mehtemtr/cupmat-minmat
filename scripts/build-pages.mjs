import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  run('npx opennextjs-cloudflare build');

  const assetsWorkerDir = path.join('.open-next', 'assets', '_worker.js');
  if (fs.existsSync(assetsWorkerDir)) {
    fs.rmSync(assetsWorkerDir, { recursive: true, force: true });
  }
  
  // Also remove the old single file if it exists
  const assetsWorkerFile = path.join('.open-next', 'assets', '_worker.js');
  if (fs.existsSync(assetsWorkerFile) && fs.statSync(assetsWorkerFile).isFile()) {
    fs.rmSync(assetsWorkerFile, { force: true });
  }

  fs.mkdirSync(assetsWorkerDir, { recursive: true });

  fs.copyFileSync(
    path.join('.open-next', 'worker.js'),
    path.join(assetsWorkerDir, 'index.js')
  );

  const dirsToCopy = ['cloudflare', '.build', 'server-functions', 'middleware'];
  for (const dir of dirsToCopy) {
    const srcDir = path.join('.open-next', dir);
    if (fs.existsSync(srcDir)) {
      copyDir(srcDir, path.join(assetsWorkerDir, dir));
    }
  }

  console.log('Successfully structured _worker.js directory for Cloudflare Pages!');
} catch (error) {
  console.error('Build script failed:', error);
  process.exit(1);
}
