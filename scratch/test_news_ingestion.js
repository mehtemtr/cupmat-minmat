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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    console.log("Checking if 'news' and 'news_fetch_logs' tables exist in Supabase...");

    // 1. Query news table
    const { data: newsData, error: newsErr } = await supabase
      .from('news')
      .select('*', { count: 'exact' })
      .limit(5);

    if (newsErr) {
      console.error("❌ Table 'news' query error:", newsErr.message);
    } else {
      console.log(`✅ Table 'news' exists. Sample count:`, newsData.length);
    }

    // 2. Query news_fetch_logs table
    const { data: logsData, error: logsErr } = await supabase
      .from('news_fetch_logs')
      .select('*', { count: 'exact' })
      .limit(5);

    if (logsErr) {
      console.error("❌ Table 'news_fetch_logs' query error:", logsErr.message);
    } else {
      console.log(`✅ Table 'news_fetch_logs' exists. Sample count:`, logsData.length);
    }

  } catch (err) {
    console.error("Error in test_news_ingestion:", err);
  }
}

run();
