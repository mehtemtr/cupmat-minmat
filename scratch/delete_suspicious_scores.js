const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    console.log("Starting deletion of suspicious records (level >= 8)...");
    
    // First, let's fetch to double check they exist
    const { data: beforeFetch, error: fetchErr } = await supabase
      .from('minmat_leaderboard')
      .select('id')
      .gte('level', 8);
      
    if (fetchErr) {
      console.error("Error fetching data:", fetchErr);
      return;
    }
    
    console.log(`Found ${beforeFetch.length} records that match the criteria (level >= 8).`);
    
    if (beforeFetch.length === 0) {
      console.log("No records to delete.");
      return;
    }
    
    // Perform deletion
    const { data, error, count } = await supabase
      .from('minmat_leaderboard')
      .delete({ count: 'exact' })
      .gte('level', 8);
      
    if (error) {
      console.error("Error deleting records:", error);
      return;
    }
    
    console.log(`Successfully deleted ${count} records from minmat_leaderboard table.`);
    
  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
