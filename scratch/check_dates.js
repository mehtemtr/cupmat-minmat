const fs = require("fs");
const path = require("path");

// Read and parse .env file
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

// Set up ts-node/register or alias path if needed, but since we compile, let's build the project and call it from the compiled next API, or we can write a quick TypeScript execution using ts-node or dynamic import
// Let's use ts-node to run the file directly
const { getRewardLeaderboards } = require("../lib/store/gamification-store");

async function check() {
  const { cupMatRewards, minMatRewards } = await getRewardLeaderboards();
  console.log("CupMat Reward Entries:", cupMatRewards);
  console.log("MinMat Reward Entries:", minMatRewards);
}

check().catch(console.error);
