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
    console.log("Fetching all scores from minmat_leaderboard to analyze ratios...");
    const { data: scores, error } = await supabase
      .from('minmat_leaderboard')
      .select('id, name, score, level');

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    // Identify IDs with ratio > 1000
    const suspiciousIds = [];
    scores.forEach(item => {
      const lvl = item.level || 1;
      const ratio = item.score / lvl;
      if (ratio > 1000) {
        suspiciousIds.push(item.id);
      }
    });

    console.log(`Found ${suspiciousIds.length} records with Ratio > 1000 out of ${scores.length} total records.`);

    if (suspiciousIds.length === 0) {
      console.log("No inflated records found to delete.");
      return;
    }

    // Delete in batches of 100 to be safe
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < suspiciousIds.length; i += batchSize) {
      const batch = suspiciousIds.slice(i, i + batchSize);
      const { error: deleteErr } = await supabase
        .from('minmat_leaderboard')
        .delete()
        .in('id', batch);

      if (deleteErr) {
        console.error(`Error deleting batch starting at index ${i}:`, deleteErr);
      } else {
        deletedCount += batch.length;
        console.log(`Deleted batch of ${batch.length} records...`);
      }
    }

    console.log(`Successfully cleaned up ${deletedCount} exploit-inflated records from the leaderboard.`);

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
