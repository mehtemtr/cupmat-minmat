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

// Old duplicate User IDs to remove from gamification_store
const duplicateUserIds = [
  "user_3Du8SFimtX4VdOddDl88WRdcAjt", // Old duplicate of mehtem2016@gmail.com
  "user_3Dx9NZqNCYu9u718Xi7YQVke6Tk"  // Old duplicate of yuksel436@gmail.com
];

async function run() {
  console.log("=== REMOVING OLD REDIS DUPLICATES ===");
  const store = await redis.get(REDIS_KEY);
  if (store && store.userActivities) {
    console.log(`Original Redis userActivities count: ${store.userActivities.length}`);
    
    // Filter out the duplicates
    const beforeCount = store.userActivities.length;
    store.userActivities = store.userActivities.filter(u => !duplicateUserIds.includes(u.userId));
    const afterCount = store.userActivities.length;
    
    console.log(`Removed ${beforeCount - afterCount} duplicate user activities.`);
    
    // Save back to Redis
    await redis.set(REDIS_KEY, store);
    console.log("Successfully saved updated store to Redis!");
  } else {
    console.log("No store data found in Redis.");
  }
}

run().catch(console.error);
