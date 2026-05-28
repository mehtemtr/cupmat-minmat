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

const backfills = [
  { userId: "user_3EBPcQKjN7fmwETYT9d8kEkDXa1", email: "mehtem2016@gmail.com" },
  { userId: "user_3EJiZoD4WQb2lFsxWeOTFNbCGN0", email: "yuksel436@gmail.com" }
];

async function run() {
  console.log("=== Checking profiles table schema for email column ===");
  const { data, error } = await supabase
    .from("profiles")
    .select("email, user_id, nickname")
    .limit(1);

  if (error) {
    if (error.message.includes("column profiles.email does not exist") || error.code === "42703") {
      console.log("\n[WARNING] 'email' column does not exist in the 'profiles' table yet.");
      console.log("Please go to the Supabase Dashboard SQL Editor and execute the following SQL code first:\n");
      console.log("-----------------------------------------------------------------");
      console.log("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;");
      console.log("-----------------------------------------------------------------\n");
      console.log("After running that SQL, please run this script again to backfill existing users.");
    } else {
      console.error("Error querying profiles:", error);
    }
    return;
  }

  console.log("email column exists! Starting backfill of emails...");
  for (const bf of backfills) {
    console.log(`Setting email '${bf.email}' for user '${bf.userId}'...`);
    const { data: updated, error: updateErr } = await supabase
      .from("profiles")
      .update({ email: bf.email })
      .eq("user_id", bf.userId)
      .select();

    if (updateErr) {
      console.error(`Error updating user ${bf.userId}:`, updateErr);
    } else {
      console.log(`Success! Updated record:`, updated);
    }
  }
  console.log("=== BACKFILL COMPLETED ===");
}

run().catch(console.error);
