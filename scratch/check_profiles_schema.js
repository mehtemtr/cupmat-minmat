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
  // Let's get one profile with all columns
  const { data: profiles, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles count:", profiles.length);
    console.log("Profiles records:", JSON.stringify(profiles, null, 2));
  }

  // Let's get one minmat_leaderboard with all columns
  const { data: ml, error: mlError } = await supabase.from("minmat_leaderboard").select("*").limit(5);
  if (mlError) {
    console.error("Error fetching minmat_leaderboard:", mlError);
  } else {
    console.log("minmat_leaderboard records:", JSON.stringify(ml, null, 2));
  }
}

run().catch(console.error);
