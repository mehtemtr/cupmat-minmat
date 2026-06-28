import { Redis } from "@upstash/redis";
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

const redis = Redis.fromEnv();

async function run() {
  const activeStage = await redis.get("fantasy_active_stage");
  console.log("Active Stage in Redis:", activeStage);
}

run();
