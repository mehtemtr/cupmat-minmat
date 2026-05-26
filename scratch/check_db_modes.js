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
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from("minmat_leaderboard")
    .select("id, name, email, score, level, mode, date, timestamp")
    .order("score", { ascending: false });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Total records in Supabase:", data.length);
  console.log("Unique modes present in DB:", [...new Set(data.map(d => d.mode))]);
  console.log("All records details:");
  data.forEach((d, i) => {
    console.log(`${i+1}. ID=${d.id} Name=${d.name} Score=${d.score} Mode=${d.mode} Level=${d.level} Email=${d.email} Date=${d.date}`);
  });
}

run();
