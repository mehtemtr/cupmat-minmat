import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Load env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      let key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      process.env[key] = val;
    }
  });
}

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (serviceKey && serviceKey.includes(".")) {
  try {
    const parts = serviceKey.split(".");
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], "base64").toString("utf8");
      const claims = JSON.parse(payload);
      if (claims && claims.ref) {
        supabaseUrl = `https://${claims.ref}.supabase.co`;
      }
    }
  } catch (e) {}
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function check() {
  const tables = ["polls", "poll_submissions", "private_leagues", "private_league_members"];
  console.log("Checking if polls and leagues tables exist...");
  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select("*").limit(1);
    if (error) {
      console.log(`❌ Table '${table}' does NOT exist or has error:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists. Rows:`, data.length);
    }
  }
}

check();
