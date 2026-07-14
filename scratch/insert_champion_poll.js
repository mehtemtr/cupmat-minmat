const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require("path");

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
  const poll = {
    id: 'c603b57d-12a8-4c31-9a7b-3b37a1f592cd',
    question_tr: 'Sizce 2026 Dünya Kupası şampiyonu hangi ülke olacak?',
    question_en: 'Which country do you think will win the 2026 World Cup?',
    options: [
      { tr: 'Fransa', en: 'France' },
      { tr: 'İspanya', en: 'Spain' },
      { tr: 'İngiltere', en: 'England' },
      { tr: 'Arjantin', en: 'Argentina' }
    ],
    correct_option_index: -1,
    points_reward: 10,
    active_until: null,
    category: 'current_wc'
  };

  const { data, error } = await supabase
    .from('polls')
    .upsert(poll);

  if (error) {
    console.error("Error inserting champion poll:", error);
  } else {
    console.log("Successfully inserted champion poll!");
  }
}

run();
