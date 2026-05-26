const { kv } = require("@vercel/kv");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/['"]/g, "");
      if (key.startsWith("KV_")) {
        process.env[key] = val;
      }
      if (key === "SUPABASE_SERVICE_ROLE_KEY") {
        supabaseKey = val;
      }
    }
  }
}

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";

console.log("KV URL defined:", !!process.env.KV_URL);
console.log("KV REST URL defined:", !!process.env.KV_REST_API_URL);
console.log("KV REST TOKEN defined:", !!process.env.KV_REST_API_TOKEN);
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key defined:", !!supabaseKey);

if (!process.env.KV_REST_API_URL || !supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const REDIS_KEY = "minmat_leaderboard";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log("\n--- Checking KV Leaderboard ---");
    const kvData = await kv.get(REDIS_KEY);
    if (!kvData) {
      console.log("No data found in Vercel KV under key:", REDIS_KEY);
      return;
    }
    console.log(`Found ${kvData.length} records in KV.`);
    console.log("Sample records:", kvData.slice(0, 3));

    console.log("\n--- Starting migration ---");
    const migratedScores = [];
    let skipped = 0;

    for (const item of kvData) {
      if (!item.name || !item.score) {
        skipped++;
        continue;
      }

      const scoreEntry = {
        name: item.name,
        email: item.email || item.name || "unknown@example.com",
        score: Number(item.score) || 0,
        level: Number(item.level) || 1,
        mode: item.mode || "mix",
        date: item.date || "",
        timestamp: item.timestamp || Date.now(),
      };

      migratedScores.push(scoreEntry);
    }

    console.log(`${migratedScores.length} records ready to insert into Supabase, ${skipped} skipped.`);

    if (migratedScores.length > 0) {
      const { data, error } = await supabase
        .from("minmat_leaderboard")
        .insert(migratedScores)
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log(`Successfully migrated ${data.length} records to Supabase minmat_leaderboard table!`);
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

run();
