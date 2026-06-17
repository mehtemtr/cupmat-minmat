const { createClient } = require('@supabase/supabase-js');
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

const redisUrl = getEnv('KV_REST_API_URL');
const redisToken = getEnv('KV_REST_API_TOKEN');

if (!redisUrl || !redisToken) {
  console.error("Redis environment variables not set!");
  process.exit(1);
}

async function run() {
  try {
    const response = await fetch(`${redisUrl}/get/gamification_store`, {
      headers: {
        Authorization: `Bearer ${redisToken}`
      }
    });
    
    if (!response.ok) {
      console.error("Redis REST error:", response.statusText);
      return;
    }
    
    const result = await response.json();
    if (!result.result) {
      console.log("No gamification store data found in Redis.");
      return;
    }
    
    const store = JSON.parse(result.result);
    console.log(`Period End: ${store.periodEnd}`);
    console.log(`Total users in userActivities: ${store.userActivities ? store.userActivities.length : 0}`);
    
    console.log("\nUsers in gamification store:");
    console.log("--------------------------------------------------");
    if (store.userActivities) {
      store.userActivities.forEach((u, index) => {
        const isEligible = u.userId.startsWith("user_");
        console.log(`${index + 1}. Nick: ${u.displayName} | Email: ${u.email} | ID: ${u.userId} | Eligible: ${isEligible}`);
      });
    }
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
