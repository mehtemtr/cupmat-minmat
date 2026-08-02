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
    console.log("=== CHECKING NEWS FETCH LOGS ===");
    const { data: logs, error: logsErr } = await supabase
      .from('news_fetch_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    console.log("Logs error:", logsErr);
    console.log("Latest logs:", JSON.stringify(logs, null, 2));

    console.log("\n=== CHECKING LATEST NEWS IN DB ===");
    const { data: news, error: newsErr, count } = await supabase
      .from('news')
      .select('id, title, country_id, published_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);
    console.log("News error:", newsErr);
    console.log("Total news count in DB:", count);
    console.log("Latest news:", JSON.stringify(news, null, 2));

    console.log("\n=== CHECKING ACTIVE COUNTRIES FOR NEWS ===");
    const { data: countries, error: cErr } = await supabase
      .from('countries')
      .select('id, name_tr, news_enabled')
      .eq('news_enabled', true);
    console.log("Countries error:", cErr);
    console.log("Active news countries count:", countries ? countries.length : 0);
    console.log("Active news countries sample:", countries ? countries.slice(0, 5) : []);

  } catch (err) {
    console.error("Failed checking news status:", err);
  }
}

run();
