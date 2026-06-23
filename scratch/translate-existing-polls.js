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

const TARGET_LANGUAGES = ['es', 'fr', 'de', 'pt', 'it', 'ko', 'ar'];

async function translateText(text, targetLang, sourceLang = 'en') {
  if (!text) return '';
  const query = text.trim();
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`;
  
  let attempts = 3;
  while (attempts > 0) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('').trim();
      }
      throw new Error("Invalid response format");
    } catch (err) {
      attempts--;
      console.warn(`[WARN] Translation failed for "${query.substring(0, 20)}..." to ${targetLang} (attempts left: ${attempts}):`, err.message);
      if (attempts === 0) {
        return ''; // Return empty string on ultimate failure to fallback safely
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("Fetching all polls from database...");
  const { data: polls, error } = await supabaseAdmin
    .from('polls')
    .select('*');

  if (error) {
    console.error("Error fetching polls:", error);
    return;
  }

  console.log(`Successfully fetched ${polls.length} polls.`);

  let updatedCount = 0;

  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    console.log(`\n[${i + 1}/${polls.length}] Processing poll: ${poll.id}`);

    let needsUpdate = false;
    const updatedFields = {};

    // 1. Translate Questions
    for (const lang of TARGET_LANGUAGES) {
      const colName = `question_${lang}`;
      if (!poll[colName]) {
        console.log(` -> Question translation missing for [${lang}]. Translating...`);
        const sourceText = poll.question_en || poll.question_tr;
        const sourceLang = poll.question_en ? 'en' : 'tr';
        const translated = await translateText(sourceText, lang, sourceLang);
        if (translated) {
          updatedFields[colName] = translated;
          needsUpdate = true;
          await sleep(150); // slight delay to avoid rate limiting
        }
      }
    }

    // 2. Translate Options
    let newOptions = null;
    if (poll.options && Array.isArray(poll.options)) {
      newOptions = JSON.parse(JSON.stringify(poll.options)); // Deep copy
      let optionsChanged = false;

      for (let optIdx = 0; optIdx < newOptions.length; optIdx++) {
        const option = newOptions[optIdx];
        
        for (const lang of TARGET_LANGUAGES) {
          if (!option[lang]) {
            const sourceText = option.en || option.tr;
            const sourceLang = option.en ? 'en' : 'tr';
            if (sourceText) {
              console.log(` -> Option [${optIdx}] translation missing for [${lang}]. Translating...`);
              const translated = await translateText(sourceText, lang, sourceLang);
              if (translated) {
                option[lang] = translated;
                optionsChanged = true;
                await sleep(150);
              }
            }
          }
        }
      }

      if (optionsChanged) {
        updatedFields.options = newOptions;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Saving translations to database for poll ${poll.id}...`);
      const { error: updateError } = await supabaseAdmin
        .from('polls')
        .update(updatedFields)
        .eq('id', poll.id);

      if (updateError) {
        console.error(`Error updating poll ${poll.id}:`, updateError);
      } else {
        console.log(`Successfully updated poll ${poll.id}.`);
        updatedCount++;
      }
    } else {
      console.log(`Poll ${poll.id} is already fully translated.`);
    }

    // Delay between polls
    await sleep(200);
  }

  console.log(`\nFinished! Total polls updated: ${updatedCount}/${polls.length}`);
}

main();
