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

  const langs = ['tr', 'en', 'es', 'fr', 'de', 'pt', 'it', 'ko', 'ar'];
  let fullyTranslatedCount = 0;

  polls.forEach((p, idx) => {
    const questionLangs = langs.filter(lang => p[`question_${lang}`] !== null && p[`question_${lang}`] !== undefined && p[`question_${lang}`] !== '');
    
    let optionsOk = true;
    if (p.options && p.options.length > 0) {
      p.options.forEach(opt => {
        const optionLangs = langs.filter(lang => opt[lang] !== null && opt[lang] !== undefined && opt[lang] !== '');
        if (optionLangs.length < langs.length) {
          optionsOk = false;
        }
      });
    } else {
      optionsOk = false;
    }

    if (questionLangs.length === langs.length && optionsOk) {
      fullyTranslatedCount++;
    } else {
      console.log(`Poll #${idx + 1} (${p.id}) is missing translations!`);
      console.log(`  Question languages present: ${questionLangs.join(', ')}`);
      if (p.options && p.options.length > 0) {
        console.log(`  Options (First Option keys): ${Object.keys(p.options[0]).join(', ')}`);
      }
    }
  });

  console.log(`\nVerification Result:`);
  console.log(`Fully translated polls: ${fullyTranslatedCount}/${polls.length}`);
}

main();
