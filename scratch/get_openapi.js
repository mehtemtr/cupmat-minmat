const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
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

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

async function run() {
  try {
    const url = `${supabaseUrl}/rest/v1/`;
    console.log("Fetching OpenAPI spec from:", url);
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    const spec = await res.json();
    console.log("Paths found in OpenAPI spec:");
    const paths = Object.keys(spec.paths || {});
    paths.forEach(p => {
      if (p.startsWith('/rpc/')) {
        console.log("RPC:", p);
      } else {
        console.log("Table/View:", p);
      }
    });
  } catch (err) {
    console.error("Error fetching OpenAPI spec:", err);
  }
}

run();
