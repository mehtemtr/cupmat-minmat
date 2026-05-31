import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  for (const file of envFiles) {
    const envPath = path.join(dir, file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().startsWith("#")) continue;
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      }
    }
  }
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  console.log("=== CHECKING REDIS STORE ===");
  const store = await redis.get("gamification_store") as any;
  if (store && store.userActivities) {
    const u1 = store.userActivities.find((u: any) => u.userId.includes("3E8k") || u.displayName === "Eagle_1923");
    const u2 = store.userActivities.find((u: any) => u.userId.includes("3ESN") || u.displayName === "Ben_Harun");
    
    console.log("Eagle_1923 in Redis:", u1);
    console.log("Ben_Harun in Redis:", u2);
  }

  console.log("\n=== CHECKING SUPABASE PROFILES ===");
  const { data: profiles } = await supabase.from("profiles").select("*");
  const p1 = profiles?.find(p => p.user_id.includes("3E8k") || p.nickname === "Eagle_1923");
  const p2 = profiles?.find(p => p.user_id.includes("3ESN") || p.nickname === "Ben_Harun");
  console.log("Eagle_1923 Profile:", p1);
  console.log("Ben_Harun Profile:", p2);

  console.log("\n=== CHECKING SUPABASE TOURNAMENT SUBMISSIONS ===");
  const { data: submissions } = await supabase.from("predictions").select("*");
  console.log("Submissions found:", submissions?.length);
  const s1 = submissions?.find(s => s.userId?.includes("3E8k") || s.user_id?.includes("3E8k"));
  const s2 = submissions?.find(s => s.userId?.includes("3ESN") || s.user_id?.includes("3ESN"));
  console.log("Eagle_1923 Predictions:", s1);
  console.log("Ben_Harun Predictions:", s2);

  console.log("\n=== CHECKING SUPABASE MINMAT SCORES ===");
  const { data: scores } = await supabase.from("minmat_leaderboard").select("*");
  const sc1 = scores?.filter(s => s.email?.includes("3E8k") || s.name === "Eagle_1923");
  const sc2 = scores?.filter(s => s.email?.includes("hamemaht") || s.name === "Ben_Harun");
  console.log("Eagle_1923 Minmat Scores count:", sc1?.length || 0);
  console.log("Ben_Harun Minmat Scores count:", sc2?.length || 0);
}

main().catch(console.error);
