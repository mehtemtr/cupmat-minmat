import { rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const targets = [".next", "node_modules/.cache"];

for (const dir of targets) {
  try {
    rmSync(join(root, dir), { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  } catch (err) {
    console.warn(`Could not remove ${dir}:`, err.message);
  }
}

console.log("Cache cleared. Run npm run dev to start fresh.");
