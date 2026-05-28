const { createClient } = require("@supabase/supabase-js");
const { Redis } = require("@upstash/redis");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
const envLocalPath = path.join(__dirname, "..", ".env.local");

let supabaseKey = "";
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
        if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
        if (key === "KV_REST_API_URL") redisUrl = val;
        if (key === "KV_REST_API_TOKEN") redisToken = val;
      }
    });
  }
}

parseEnv(envPath);
parseEnv(envLocalPath);

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);
const redis = new Redis({ url: redisUrl, token: redisToken });
const REDIS_KEY = "gamification_store";

async function run() {
  console.log("=== STARTING DATABASE CLEANUP ===");

  // 1. Check profiles before change
  const { data: beforeProfiles, error: fetchErr } = await supabase
    .from("profiles")
    .select("*");
  
  if (fetchErr) {
    console.error("Error fetching profiles:", fetchErr);
    return;
  }
  console.log("Profiles in DB currently:", beforeProfiles);

  const lowercaseId = "user_3EBPcQkjN7fmwETYT9d8kEkDXa1";
  const uppercaseId = "user_3EBPcQKjN7fmwETYT9d8kEkDXa1";

  // 2. Delete the lowercase profile (doesn't exist in Clerk)
  console.log(`Deleting invalid lowercase profile: ${lowercaseId}...`);
  const { error: deleteErr } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", lowercaseId);

  if (deleteErr) {
    console.error("Delete profile error:", deleteErr);
  } else {
    console.log("Successfully deleted invalid lowercase profile.");
  }

  // 3. Update the uppercase profile's nickname to Karakartal1923
  console.log(`Updating active uppercase profile (${uppercaseId}) nickname to Karakartal1923...`);
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ nickname: "Karakartal1923" })
    .eq("user_id", uppercaseId);

  if (updateErr) {
    console.error("Update profile error:", updateErr);
  } else {
    console.log("Successfully updated nickname of active profile.");
  }

  // 4. Update the Redis Gamification Store
  console.log("Updating Redis gamification store...");
  try {
    const store = await redis.get(REDIS_KEY);
    if (store && store.userActivities) {
      // Find the lowercase one and remove/rename it
      console.log(`Original Redis userActivities count: ${store.userActivities.length}`);
      
      // Remove the lowercase activity
      store.userActivities = store.userActivities.filter(u => u.userId !== lowercaseId);
      
      // Update the nickname of the uppercase activity
      const activeUser = store.userActivities.find(u => u.userId === uppercaseId);
      if (activeUser) {
        activeUser.displayName = "Karakartal1923";
        console.log(`Updated uppercase user display name to Karakartal1923 in Redis.`);
      }
      
      await redis.set(REDIS_KEY, store);
      console.log("Successfully updated and saved Redis gamification store.");
    } else {
      console.log("No store data found in Redis.");
    }
  } catch (err) {
    console.error("Redis update error:", err);
  }

  // 5. Check profiles after change
  const { data: afterProfiles } = await supabase.from("profiles").select("*");
  console.log("Profiles in DB after cleanup:", afterProfiles);
  console.log("=== CLEANUP FINISHED ===");
}

run().catch(console.error);
