const { createClient } = require("@supabase/supabase-js");
const { Redis } = require("@upstash/redis");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let supabaseKey = "";
let redisUrl = "";
let redisToken = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
      if (key === "KV_REST_API_URL") redisUrl = val;
      if (key === "KV_REST_API_TOKEN") redisToken = val;
    }
  });
}

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);
const redis = new Redis({ url: redisUrl, token: redisToken });

async function run() {
  console.log("--- REDIS DATA ---");
  const store = await redis.get("gamification_store");
  console.log("Period End:", store?.periodEnd);
  console.log("User activities count:", store?.userActivities?.length);
  if (store?.userActivities) {
    console.log("User activities users (sample):", store.userActivities.map(u => ({ id: u.userId, name: u.displayName, points: u.mevcutPeriyotPuani })));
  }

  console.log("\n--- SUPABASE PROFILES ---");
  const { data: profiles } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles?.length);
  console.log("Profiles:", profiles);

  console.log("\n--- SUPABASE MINMAT_LEADERBOARD ---");
  const { data: minmat } = await supabase.from("minmat_leaderboard").select("*");
  console.log("Minmat leaderboard count:", minmat?.length);
  console.log("Minmat leaderboard records:", minmat);
}

run().catch(console.error);
