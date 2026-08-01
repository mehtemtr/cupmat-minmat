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
    console.log("Starting verification of countries table in Supabase...");
    
    // 1. Check if table exists and get count
    const { data, count, error } = await supabase
      .from('countries')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error("❌ Verification failed: Error querying 'countries' table:", error.message);
      process.exit(1);
    }
    
    console.log(`✅ Table 'countries' exists and contains ${count} rows.`);
    
    if (count !== 177) {
      console.warn(`⚠️ Warning: Expected 177 countries, but found ${count} countries in table.`);
    }
    
    // 2. Check a couple of specific countries
    // Germany
    const de = data.find(c => c.iso2 === 'DE');
    if (de) {
      console.log("✅ Germany verified:", {
        iso2: de.iso2,
        iso3: de.iso3,
        name_tr: de.name_tr,
        population: de.population,
        flag_url: de.flag_url,
        play_store_enabled: de.play_store_enabled
      });
    } else {
      console.error("❌ Germany (DE) not found in table.");
    }
    
    // KKTC
    const kkt = data.find(c => c.name_tr === 'Kuzey Kıbrıs Türk Cumhuriyeti');
    if (kkt) {
      console.log("✅ KKTC verified:", {
        iso2: kkt.iso2, // Should be null
        iso3: kkt.iso3, // Should be null
        name_tr: kkt.name_tr,
        short_name_tr: kkt.short_name_tr, // KKTC
        name_en: kkt.name_en, // Turkish Republic of Northern Cyprus
        short_name_en: kkt.short_name_en, // TRNC
        population: kkt.population,
        flag_url: kkt.flag_url // Should be /flags/kktc.svg
      });
      if (kkt.iso2 !== null || kkt.iso3 !== null) {
        console.error("❌ KKTC has non-null ISO codes: ISO2 =", kkt.iso2, ", ISO3 =", kkt.iso3);
      }
      if (kkt.short_name_tr !== 'KKTC' || kkt.short_name_en !== 'TRNC') {
        console.error("❌ KKTC short names verification failed.");
      }
    } else {
      console.error("❌ KKTC not found in table.");
    }

    // GKRY
    const gkry = data.find(c => c.name_tr === 'Güney Kıbrıs Rum Yönetimi');
    if (gkry) {
      console.log("✅ GKRY verified:", {
        iso2: gkry.iso2, // Should be null
        iso3: gkry.iso3, // Should be null
        name_tr: gkry.name_tr,
        short_name_tr: gkry.short_name_tr, // GKRY
        name_en: gkry.name_en, // Greek Cypriot Administration
        short_name_en: gkry.short_name_en, // GCA
        population: gkry.population,
        flag_url: gkry.flag_url
      });
      if (gkry.iso2 !== null || gkry.iso3 !== null) {
        console.error("❌ GKRY has non-null ISO codes: ISO2 =", gkry.iso2, ", ISO3 =", gkry.iso3);
      }
      if (gkry.short_name_tr !== 'GKRY' || gkry.short_name_en !== 'GCA' || gkry.name_en !== 'Greek Cypriot Administration') {
        console.error("❌ GKRY names verification failed.");
      }
    } else {
      console.error("❌ GKRY not found in table.");
    }
    
    // 3. Verify defaults
    const invalidDefault = data.find(c => 
      c.play_store_enabled !== true ||
      c.news_enabled !== false ||
      c.simulation_enabled !== false ||
      c.priority !== 0
    );
    
    if (invalidDefault) {
      console.error("❌ Default values validation failed for country:", invalidDefault);
    } else {
      console.log("✅ Default values verified successfully (play_store_enabled = true, news_enabled = false, simulation_enabled = false, priority = 0).");
    }
    
    console.log("\n🎉 Countries table verification completed successfully!");
  } catch (err) {
    console.error("❌ Verification script crashed:", err);
  }
}

run();
