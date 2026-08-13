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

const pgUrl = getEnv('POSTGRES_URL_NON_POOLING') || getEnv('POSTGRES_URL') || getEnv('DATABASE_URL') || getEnv('SUPABASE_DB_URL');

if (pgUrl) {
  const sql = postgres(pgUrl, { ssl: 'require' });
  
  async function run() {
    try {
      // 1. Remove TBD
      await sql`UPDATE cupmat_matches SET home_team_country_code = NULL, away_team_country_code = NULL WHERE home_team_country_code = 'TBD'`;
      console.log("Cleared TBD country codes.");

      // 2. Fix broken turkish characters in rounds (if they exist)
      // They look like "3. n Eleme Turu" which is likely "3. n Eleme Turu" or "3. Ön Eleme Turu" 
      await sql`UPDATE cupmat_matches SET round = '3. Ön Eleme' WHERE round LIKE '3.%n Eleme%'`;
      await sql`UPDATE cupmat_matches SET round = '2. Ön Eleme' WHERE round LIKE '2.%n Eleme%'`;
      await sql`UPDATE cupmat_matches SET round = '1. Ön Eleme' WHERE round LIKE '1.%n Eleme%'`;
      console.log("Fixed broken round characters.");
      
      // Also delete any old invalid matches that might have broken rounds if needed, but update should be enough.

    } catch (e) {
      console.error("SQL execution failed:", e);
    } finally {
      await sql.end();
    }
  }
  run();
} else {
  console.log("No DB URL found.");
}
