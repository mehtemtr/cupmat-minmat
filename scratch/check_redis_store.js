const { Redis } = require("@upstash/redis");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

let redisUrl = "";
let redisToken = "";

function parseEnv(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^['"]|['"]$/g, "");
        if (key === "KV_REST_API_URL") redisUrl = val;
        if (key === "KV_REST_API_TOKEN") redisToken = val;
      }
    });
  }
}

parseEnv(envPath);
parseEnv(envLocalPath);

const redis = new Redis({ url: redisUrl, token: redisToken });
const REDIS_KEY = "gamification_store";

async function run() {
  console.log("=== CHECKING REDIS STORE ===");
  const store = await redis.get(REDIS_KEY);
  if (store && store.userActivities) {
    console.log(`Redis userActivities count: ${store.userActivities.length}`);
    store.userActivities.forEach((u, i) => {
      console.log(`${i+1}. UserID: ${u.userId} | Email: ${u.email} | DisplayName: ${u.displayName} | TaraftarPuani: ${u.taraftarPuani} | MevcutPeriyotPuani: ${u.mevcutPeriyotPuani}`);
    });
  } else {
    console.log("No store data found in Redis.");
  }
}

run().catch(console.error);
