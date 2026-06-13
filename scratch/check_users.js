const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let envText = '';
if (fs.existsSync('.env.local')) envText += fs.readFileSync('.env.local', 'utf8') + '\n';
if (fs.existsSync('.env')) envText += fs.readFileSync('.env', 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const userIds = ['user_3EBPcQKjN7fmwETYT9d8kEkDXa1', 'user_3Ed4r9eLLfHPm3GEiLlKzgBMy7z'];
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);

  if (error) {
    console.error(error);
  } else {
    console.log("Profiles:", profiles);
  }
}

run();
