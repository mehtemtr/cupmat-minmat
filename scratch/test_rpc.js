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

async function run() {
  console.log("Testing RPC exec_sql...");
  const { data, error } = await supabase.rpc("exec_sql", { sql: "SELECT 1;" });
  if (error) {
    console.error("exec_sql failed:", error.message);
  } else {
    console.log("exec_sql success:", data);
  }

  console.log("Testing RPC run_sql...");
  const { data: data2, error: error2 } = await supabase.rpc("run_sql", { sql: "SELECT 1;" });
  if (error2) {
    console.error("run_sql failed:", error2.message);
  } else {
    console.log("run_sql success:", data2);
  }
}

run();
