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

async function test() {
  loadEnv();
  const { GET } = await import("../app/api/stats/player-stats/route");
  
  console.log("Calling GET /api/stats/player-stats...");
  try {
    const response = await GET();
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data success:", data.success);
    if (!data.success) {
      console.log("Response error:", data.error);
    } else {
      console.log("Data keys:", Object.keys(data));
      console.log("Youngest count:", data.youngest?.length);
      console.log("Oldest count:", data.oldest?.length);
      console.log("Top clubs count:", data.topClubs?.length);
      console.log("Top Clubs list:", data.topClubs);
      console.log("Top cities count:", data.topCities?.length);
      console.log("Top Cities list:", data.topCities);
      console.log("Averages count:", data.countryAverages?.length);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
