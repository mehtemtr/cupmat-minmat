import * as fs from "fs";
import * as path from "path";

async function main() {
  const filePath = path.join(__dirname, "real-squads.json");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tur = data["tur"] || [];
  console.log(`Found ${tur.length} players for 'tur' in real-squads.json:`);
  tur.forEach((p: any) => console.log(JSON.stringify(p)));
}

main().catch(console.error);
