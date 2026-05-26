const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
  if (keyMatch) supabaseKey = keyMatch[1].trim().replace(/['"]/g, "");
}

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";

console.log("Using Supabase URL:", supabaseUrl);
console.log("Supabase Key defined:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("\n--- Checking tables ---");
  
  // Try querying profiles
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);
    
  if (pError) {
    console.error("Error querying 'profiles':", pError.message, pError);
  } else {
    console.log("Profiles connection OK. Found profiles count (sample):", profiles.length);
  }

  // Try querying minmat_leaderboard
  const { data: ml, error: mlError } = await supabase
    .from("minmat_leaderboard")
    .select("*")
    .limit(1);
    
  if (mlError) {
    console.error("Error querying 'minmat_leaderboard':", mlError.message, mlError);
  } else {
    console.log("minmat_leaderboard connection OK. Found records count (sample):", ml.length);
  }

  // Try querying minmat_scores
  const { data: ms, error: msError } = await supabase
    .from("minmat_scores")
    .select("*")
    .limit(1);
    
  if (msError) {
    console.error("Error querying 'minmat_scores':", msError.message, msError);
  } else {
    console.log("minmat_scores connection OK. Found records count (sample):", ms.length);
  }
}

run();
