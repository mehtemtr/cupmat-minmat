const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

function parseEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = val;
        // Map KV envs to UPSTASH equivalents if needed
        if (key === "KV_REST_API_URL") {
          process.env.UPSTASH_REDIS_REST_URL = val;
        }
        if (key === "KV_REST_API_TOKEN") {
          process.env.UPSTASH_REDIS_REST_TOKEN = val;
        }
        if (key === "SUPABASE_SERVICE_ROLE_KEY") {
          process.env.SUPABASE_SERVICE_ROLE_KEY = val;
        }
      }
    });
  }
}

parseEnv(envPath);
parseEnv(envLocalPath);

// Make sure Supabase URL is set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://supabase.com") {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ewdfexbuhgtsnsxveobc.supabase.co";
}

const { getGamificationLeaderboard, getRewardLeaderboards } = require("../lib/store/gamification-store");

async function run() {
  console.log("=== Testing Gamification Store Leaderboard Mapping ===");
  
  const lb = await getGamificationLeaderboard();
  console.log("\n--- Active Leaderboard (Top 10) ---");
  lb.slice(0, 10).forEach((u, i) => {
    console.log(`${i+1}. UserID: ${u.userId} | DisplayName (Mapped): ${u.displayName} | Points: ${u.mevcutPeriyotPuani}`);
  });

  const { cupMatRewards, minMatRewards } = await getRewardLeaderboards();
  console.log("\n--- CupMat Rewards (Top 5) ---");
  cupMatRewards.forEach((r) => {
    console.log(`${r.rank}. Name: ${r.displayName} | Score: ${r.score} | Reward: ${r.reward}`);
  });

  console.log("\n--- MinMat Rewards (Top 5) ---");
  minMatRewards.forEach((r) => {
    console.log(`${r.rank}. Name: ${r.displayName} | Score: ${r.score} | Level: ${r.level} | Mode: ${r.mode} | Reward: ${r.reward}`);
  });
}

run().catch(console.error);
