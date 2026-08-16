const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const workspaceDir = __dirname;
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const pgUrl = getEnv('POSTGRES_URL_NON_POOLING') || getEnv('POSTGRES_URL') || getEnv('DATABASE_URL');
console.log("Found pg string?", !!pgUrl);

if (pgUrl) {
  const sql = postgres(pgUrl, { ssl: 'require' });
  
  async function run() {
    try {
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS minlan_mistakes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
          word_id TEXT NOT NULL,
          native_lang VARCHAR(10) NOT NULL,
          target_lang VARCHAR(10) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log("Created minlan_mistakes table (if not exists).");

      await sql.unsafe(`
        ALTER TABLE minlan_leaderboard 
        ADD COLUMN IF NOT EXISTS round_reached INT DEFAULT 1;
      `);
      console.log("Added round_reached column to minlan_leaderboard (if not exists).");
      
    } catch (e) {
      console.error("SQL execution failed:", e);
    } finally {
      await sql.end();
    }
  }
  run();
} else {
  console.log("No POSTGRES_URL found. Please run this SQL manually.");
}
