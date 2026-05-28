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
  console.log("=== Fetching profiles and minmat_leaderboard together ===");
  const { data: profiles } = await supabase.from("profiles").select("email, nickname");
  console.log("Profiles in DB:", profiles);

  const { data: scores } = await supabase.from("minmat_leaderboard").select("*").order("score", { ascending: false }).limit(20);
  console.log("\nLeaderboard scores with mapped nicknames:");

  const emailToNicknameMap = new Map();
  profiles.forEach(p => {
    if (p.email) emailToNicknameMap.set(p.email.toLowerCase().trim(), p.nickname);
  });

  scores.forEach((s) => {
    const emailKey = s.email?.toLowerCase().trim();
    const finalNick = (emailKey && emailToNicknameMap.get(emailKey)) || s.name || "Kullanıcı";
    console.log(`ScoreID: ${s.id} | Email in Score: ${s.email} | Original Name: ${s.name} | Mapped Nickname: ${finalNick} | Score: ${s.score}`);
  });
}

run().catch(console.error);
