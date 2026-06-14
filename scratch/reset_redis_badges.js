const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const redisUrl = getEnv('KV_REST_API_URL') || getEnv('UPSTASH_REDIS_REST_URL');
const redisToken = getEnv('KV_REST_API_TOKEN') || getEnv('UPSTASH_REDIS_REST_TOKEN');

if (!redisUrl || !redisToken) {
  console.error("Missing Redis / KV credentials in environment files.");
  process.exit(1);
}

// Set on process.env so Redis.fromEnv() can load them
process.env.UPSTASH_REDIS_REST_URL = redisUrl;
process.env.UPSTASH_REDIS_REST_TOKEN = redisToken;
process.env.KV_REST_API_URL = redisUrl;
process.env.KV_REST_API_TOKEN = redisToken;

const redis = Redis.fromEnv();
const REDIS_KEY = "gamification_store";

async function run() {
  try {
    console.log("Fetching gamification store from Upstash Redis...");
    const data = await redis.get(REDIS_KEY);

    if (!data) {
      console.error("No gamification store data found in Redis.");
      return;
    }

    const store = typeof data === 'string' ? JSON.parse(data) : data;
    let updatedUsersCount = 0;

    store.userActivities.forEach(u => {
      if (u.minmatMaxLevels) {
        let changed = false;
        const modes = ["add", "sub", "mul", "div", "mix"];
        modes.forEach(mode => {
          if (u.minmatMaxLevels[mode] > 7) {
            console.log(`User ${u.displayName} (${u.userId}) - Mode: ${mode} - Level reset from ${u.minmatMaxLevels[mode]} to 7`);
            u.minmatMaxLevels[mode] = 7;
            changed = true;
          }
        });
        if (changed) updatedUsersCount++;
      }
    });

    console.log(`\nFound ${updatedUsersCount} users with levels > 7.`);

    if (updatedUsersCount > 0) {
      console.log("Saving updated gamification store to Redis...");
      await redis.set(REDIS_KEY, store);
      console.log("Gamification store successfully updated and saved to Redis!");
    } else {
      console.log("No user levels needed resetting.");
    }

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
