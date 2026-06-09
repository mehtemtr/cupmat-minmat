const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    envVars[key] = value.trim();
  }
});

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: polls, error } = await supabaseAdmin
    .from('polls')
    .select('*');

  if (error) {
    console.error("Error fetching polls:", error);
    return;
  }

  const opinionPolls = polls.filter(p => p.correct_option_index === -1);
  console.log(`Opinion polls count (correct_option_index === -1): ${opinionPolls.length}`);
  
  if (opinionPolls.length > 0) {
    console.log("Opinion Polls:");
    opinionPolls.forEach((p, i) => {
      console.log(`${i+1}. Q(TR): ${p.question_tr} | Category: ${p.category}`);
    });
  }
}

main();
