const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const workspaceDir = __dirname;
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env.production.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.production.local'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const pgUrl = getEnv('POSTGRES_URL_NON_POOLING') || getEnv('POSTGRES_URL') || getEnv('DATABASE_URL') || getEnv('SUPABASE_DB_URL');
console.log("Found pg string?", !!pgUrl);

if (pgUrl) {
  const sql = postgres(pgUrl, { ssl: 'require' });
  
  async function run() {
    try {
      // Execute the migration
      const sqlString = fs.readFileSync('supabase_migration_cupmat.sql', 'utf8');
      const queries = sqlString.split(';');
      for (const q of queries) {
        if (q.trim()) {
           await sql.unsafe(q);
        }
      }
      console.log("Migration executed successfully!");

      // Refresh PostgREST schema cache
      await sql.unsafe("NOTIFY pgrst, 'reload schema';");
      console.log("Schema cache reloaded.");
    } catch (e) {
      console.error("SQL execution failed:", e);
    } finally {
      await sql.end();
    }
  }
  run();
} else {
  console.log("No DB URL found. Cannot apply migration.");
}
