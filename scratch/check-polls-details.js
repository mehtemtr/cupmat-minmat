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

  console.log(`Total polls: ${polls.length}`);
  
  const langs = ['tr', 'en', 'es', 'fr', 'de', 'pt', 'it', 'ko', 'ar'];
  
  polls.forEach((p, idx) => {
    console.log(`\n--- Poll #${idx + 1} (${p.id}) ---`);
    console.log(`TR: ${p.question_tr}`);
    console.log(`EN: ${p.question_en}`);
    
    // Check which question translations exist
    const questionLangs = langs.filter(lang => p[`question_${lang}`] !== null && p[`question_${lang}`] !== undefined && p[`question_${lang}`] !== '');
    console.log(`Question translations present: ${questionLangs.join(', ')}`);
    
    // Check option translations
    if (p.options && p.options.length > 0) {
      console.log(`Options (Count: ${p.options.length}):`);
      const opt = p.options[0];
      const optionLangs = langs.filter(lang => opt[lang] !== null && opt[lang] !== undefined && opt[lang] !== '');
      console.log(`  First Option translation keys present: ${optionLangs.join(', ')}`);
    }
  });
}

main();
