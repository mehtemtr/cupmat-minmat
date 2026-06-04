import * as fs from "fs";
import * as path from "path";

async function main() {
  const filePath = "d:\\fubolcu.csv";
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  console.log(`Loaded ${lines.length} lines from ${filePath}`);

  const teamCounts: Record<string, number> = {};
  lines.forEach(line => {
    const parts = line.split(",");
    if (parts.length >= 6) {
      const teamCode = parts[1];
      teamCounts[teamCode] = (teamCounts[teamCode] || 0) + 1;
    }
  });

  console.log("Team counts in CSV:", teamCounts);
}

main().catch(console.error);
