const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

let supabaseKey = "";
let supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";

function parseEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
    if (keyMatch) supabaseKey = keyMatch[1].trim().replace(/['"]/g, "");
    
    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
    if (urlMatch) {
      const val = urlMatch[1].trim().replace(/['"]/g, "");
      if (val && val !== "https://supabase.com") {
        supabaseUrl = val;
      }
    }
  }
}

parseEnv(envPath);
parseEnv(envLocalPath);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== Checking minmat_leaderboard Modes ===");
  const { data, error } = await supabase
    .from("minmat_leaderboard")
    .select("mode, score");
    
  if (error) {
    console.error("Error fetching leaderboard modes:", error);
    return;
  }
  
  const counts = {};
  data.forEach(row => {
    counts[row.mode] = (counts[row.mode] || 0) + 1;
  });
  
  console.log("Modes in DB counts:", counts);
  
  // Show sample div / bol records
  const divRows = data.filter(row => row.mode === "div" || row.mode === "bol");
  console.log(`Found ${divRows.length} division records.`);
  divRows.slice(0, 10).forEach(row => {
    console.log(`Mode: ${row.mode} | Score: ${row.score}`);
  });
}

run();
