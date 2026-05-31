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
  console.log("Checking profiles table columns...");
  // Query table columns using a system catalog query or RPC or try inserting a dummy value
  // We can query table structure using a select on information_schema if allowed via REST
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles row sample:", data);
  }

  // Check columns of profiles by selecting from a view or via query metadata
  // Let's execute select with different column types
  const { data: cols, error: colsErr } = await supabaseAdmin
    .rpc("get_columns", { table_name: "profiles" }); // if get_columns exists

  if (colsErr) {
    console.log("No RPC 'get_columns', trying to check columns via SQL view if possible...");
  } else {
    console.log("Columns:", cols);
  }
}

check();
