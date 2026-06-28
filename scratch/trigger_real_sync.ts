import { syncSimulatedScores } from "../lib/api-football";
import fs from "fs";
import path from "path";

// Parse environment variables manually
const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
lines.forEach(l => {
  const t = l.trim();
  if (!t || t.startsWith('#')) return;
  const idx = t.indexOf('=');
  if (idx === -1) return;
  const key = t.substring(0, idx).trim();
  const val = t.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  process.env[key] = val;
});

async function run() {
  const stage = process.argv[2] || "matchday_1";
  console.log(`Starting local sync with real data for stage: ${stage}...`);
  try {
    const logs = await syncSimulatedScores(stage);
    console.log("Sync Logs:");
    logs.forEach(l => console.log(l));
    console.log(`Local sync for stage ${stage} complete!`);
  } catch (e: any) {
    console.error(`Sync for stage ${stage} failed:`, e);
  }
}

run();
