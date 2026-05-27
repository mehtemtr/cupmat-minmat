const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
    }
  });
}

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Querying Postgres catalogs for tables...");
  const commonTables = ["profiles", "minmat_leaderboard", "minmat_scores", "predictions", "matches", "users"];
  for (const t of commonTables) {
    try {
      const { data, error: err } = await supabase.from(t).select("*").limit(1);
      if (err) {
        console.log(`Table '${t}' error:`, err.message);
      } else {
        console.log(`Table '${t}' exists. Sample record:`, data.length > 0 ? data[0] : "Empty table");
      }
    } catch (e) {
      console.log(`Table '${t}' catch error:`, e.message);
    }
  }
}

run().catch(console.error);
