import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  let envJwt: string | undefined;

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

  if (envJwt && (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("."))) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = envJwt;
  }
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const results: any = {
    redis: [],
    profiles: [],
    minmatScores: []
  };

  console.log("=== SEARCHING REDIS STORE ===");
  const store = await redis.get("gamification_store") as any;
  if (store && store.userActivities) {
    results.redis = store.userActivities.filter((u: any) => 
      (u.displayName && (u.displayName.toLowerCase().includes("ismail") || u.displayName.toLowerCase().includes("toptaş") || u.displayName.toLowerCase().includes("top") || u.displayName.toLowerCase().includes("trabzon") || u.displayName.toLowerCase().includes("61"))) ||
      (u.email && (u.email.toLowerCase().includes("ismail") || u.email.toLowerCase().includes("toptaş") || u.email.toLowerCase().includes("top") || u.email.toLowerCase().includes("trabzon")))
    );
  }

  console.log("\n=== SEARCHING SUPABASE PROFILES ===");
  const { data: profiles, error: pError } = await supabaseAdmin.from("profiles").select("*");
  if (pError) {
    console.error("Profiles fetch error:", pError);
  } else {
    console.log(`Total profiles read: ${profiles?.length}`);
    results.profiles = profiles?.filter(p => 
      (p.nickname && (p.nickname.toLowerCase().includes("ismail") || p.nickname.toLowerCase().includes("toptaş") || p.nickname.toLowerCase().includes("top") || p.nickname.toLowerCase().includes("trabzon") || p.nickname.toLowerCase().includes("61"))) ||
      (p.email && (p.email.toLowerCase().includes("ismail") || p.email.toLowerCase().includes("toptaş") || p.email.toLowerCase().includes("top") || p.email.toLowerCase().includes("trabzon")))
    ) || [];
  }

  console.log("\n=== SEARCHING SUPABASE MINMAT SCORES ===");
  const { data: scores, error: sError } = await supabaseAdmin.from("minmat_leaderboard").select("*");
  if (sError) {
    console.error("Minmat scores error:", sError);
  } else {
    console.log(`Total MinMat scores read: ${scores?.length}`);
    results.minmatScores = scores?.filter(s => 
      (s.name && (s.name.toLowerCase().includes("ismail") || s.name.toLowerCase().includes("toptaş") || s.name.toLowerCase().includes("top") || s.name.toLowerCase().includes("trabzon") || s.name.toLowerCase().includes("61"))) ||
      (s.email && (s.email.toLowerCase().includes("ismail") || s.email.toLowerCase().includes("toptaş") || s.email.toLowerCase().includes("top") || s.email.toLowerCase().includes("trabzon")))
    ) || [];
  }

  const outPath = path.join(__dirname, "search-results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Saved results to ${outPath}`);
}

main().catch(console.error);
