import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  let envJwt: string | undefined;

  // First pass: find the valid JWT from .env
  const envPathDefault = path.join(dir, ".env");
  if (fs.existsSync(envPathDefault)) {
    const lines = fs.readFileSync(envPathDefault, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[1] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
        if (val.trim().includes(".")) {
          envJwt = val.trim();
        }
      }
    }
  }

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

  // If the loaded key does not contain a JWT dot format, restore the JWT one
  if (envJwt && (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("."))) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = envJwt;
  }
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  console.log("Supabase URL from lib/supabase will self-heal if missing, using env variables from process.env.");
  
  console.log("=== CHECKING REDIS ===");
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  const store = await redis.get("gamification_store") as any;
  if (store && store.userActivities) {
    console.log("Total users in Redis:", store.userActivities.length);
    const u1 = store.userActivities.find((u: any) => u.userId.includes("3E8k"));
    const u2 = store.userActivities.find((u: any) => u.userId.includes("3ESN"));
    console.log("User 1 (3E8k) in Redis:", u1);
    console.log("User 2 (3ESN) in Redis:", u2);
  }

  console.log("\n=== CHECKING SUPABASE PROFILES ===");
  const { data: profiles, error: pError } = await supabaseAdmin.from("profiles").select("*");
  if (pError) {
    console.error("Profiles error:", pError);
  } else {
    console.log("Total profiles:", profiles?.length);
    const p1 = profiles?.find(p => p.user_id?.includes("3E8k"));
    const p2 = profiles?.find(p => p.user_id?.includes("3ESN"));
    console.log("User 1 Profile:", p1);
    console.log("User 2 Profile:", p2);
  }

  console.log("\n=== CHECKING SUPABASE MINMAT SCORES ===");
  const { data: minmatScores, error: scError } = await supabaseAdmin.from("minmat_leaderboard").select("*");
  if (scError) {
    console.error("Minmat scores error:", scError);
  } else {
    console.log("Total minmat leaderboard rows:", minmatScores?.length);
    const sc1 = minmatScores?.filter(s => s.user_id?.includes("3E8k") || s.email?.includes("3E8k") || s.name === "hartem" || s.name === "Eagle_1923");
    const sc2 = minmatScores?.filter(s => s.user_id?.includes("3ESN") || s.email?.includes("hamemaht") || s.name === "harun_temizel" || s.name === "Ben_Harun");
    console.log("User 1 Minmat Scores:", sc1);
    console.log("User 2 Minmat Scores:", sc2);
  }

  console.log("\n=== CHECKING CUPMAT LEADERBOARD ===");
  const { data: cupmatScores, error: cupError } = await supabaseAdmin.from("cupmat_leaderboard").select("*");
  if (cupError) {
    console.error("Cupmat error:", cupError);
  } else {
    console.log("Total cupmat leaderboard rows:", cupmatScores?.length);
    const c1 = cupmatScores?.filter(s => s.userId?.includes("3E8k"));
    const c2 = cupmatScores?.filter(s => s.userId?.includes("3ESN"));
    console.log("User 1 Cupmat:", c1);
    console.log("User 2 Cupmat:", c2);
  }
}

main().catch(console.error);
