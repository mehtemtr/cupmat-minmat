import * as fs from "fs";
import * as path from "path";

const wikiPages: Record<string, string> = {
  mex: "Mexico_national_football_team",
  kor: "South_Korea_national_football_team",
  cze: "Czech_Republic_national_football_team",
  rsa: "South_Africa_national_football_team",
  can: "Canada_men%27s_national_soccer_team",
  sui: "Switzerland_national_football_team",
  bih: "Bosnia_and_Herzegovina_national_football_team",
  qat: "Qatar_national_football_team",
  bra: "Brazil_national_football_team",
  sco: "Scotland_national_football_team",
  mar: "Morocco_national_football_team",
  hti: "Haiti_national_football_team",
  usa: "United_States_men%27s_national_soccer_team",
  par: "Paraguay_national_football_team",
  aus: "Australia_men%27s_national_soccer_team",
  tur: "Turkey_national_football_team",
  ger: "Germany_national_football_team",
  ecu: "Ecuador_national_football_team",
  civ: "Ivory_Coast_national_football_team",
  cuw: "Cura%C3%A7ao_national_football_team",
  ned: "Netherlands_national_football_team",
  jpn: "Japan_national_football_team",
  swe: "Sweden_national_football_team",
  tun: "Tunisia_national_football_team",
  bel: "Belgium_national_football_team",
  irn: "Iran_national_football_team",
  egy: "Egypt_national_football_team",
  nzl: "New_Zealand_national_football_team",
  esp: "Spain_national_football_team",
  uru: "Uruguay_national_football_team",
  ksa: "Saudi_Arabia_national_football_team",
  cpv: "Cape_Verde_national_football_team",
  fra: "France_national_football_team",
  nor: "Norway_national_football_team",
  irq: "Iraq_national_football_team",
  sen: "Senegal_national_football_team",
  arg: "Argentina_national_football_team",
  alg: "Algeria_national_football_team",
  aut: "Austria_national_football_team",
  jor: "Jordan_national_football_team",
  por: "Portugal_national_football_team",
  col: "Colombia_national_football_team",
  uzb: "Uzbekistan_national_football_team",
  cod: "DR_Congo_national_football_team",
  eng: "England_national_football_team",
  cro: "Croatia_national_football_team",
  pan: "Panama_national_football_team",
  gha: "Ghana_national_football_team"
};

function parseSquadTable(tableHtml: string): any[] {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g;
  
  let match;
  const players: any[] = [];
  let rowIndex = 0;
  
  while ((match = rowRegex.exec(tableHtml)) !== null) {
    const rowContent = match[1];
    rowIndex++;
    if (rowIndex === 1) continue; // Skip header row
    
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push(cellMatch[1]);
    }
    
    if (cells.length < 5) continue;
    
    const cleanText = (text: string) => {
      return text
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };
    
    // Position is cell 1
    const posRaw = cells[1] || "";
    let pos = cleanText(posRaw);
    if (pos.includes("GK") || pos.includes("Kaleci")) pos = "GK";
    else if (pos.includes("DF") || pos.includes("Defans") || pos.includes("Stoper") || pos.includes("Bek")) pos = "DF";
    else if (pos.includes("MF") || pos.includes("Orta Saha")) pos = "MF";
    else if (pos.includes("FW") || pos.includes("Forvet")) pos = "FW";
    else pos = "MF"; // fallback
    
    // Player is cell 2
    const playerCell = cells[2] || "";
    const playerLinkMatch = playerCell.match(/<a[^>]*>([^<]+)<\/a>/);
    let name = playerLinkMatch ? playerLinkMatch[1].trim() : cleanText(playerCell);
    name = name.replace(/ \(footballer\)/g, "").replace(/ \(born \d+\)/g, "");

    // DOB is cell 3
    const dobCell = cells[3] || "";
    const bdayMatch = dobCell.match(/class="bday">([^<]+)</);
    const dob = bdayMatch ? bdayMatch[1] : "";
    
    let age = 26;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      age = 2026 - birthYear;
    } else {
      const ageMatch = dobCell.match(/\(age\s*(\d+)\)/i);
      if (ageMatch) {
        age = parseInt(ageMatch[1], 10);
      }
    }
    
    // Club is the last cell (usually cell 6)
    const clubCell = cells[cells.length - 1] || "";
    const clubLinks = [...clubCell.matchAll(/<a[^>]*>([^<]+)<\/a>/g)];
    let club = clubLinks.length > 0 ? clubLinks[clubLinks.length - 1][1].trim() : cleanText(clubCell);
    if (club.toLowerCase().includes("national team") || club.toLowerCase().includes("association")) {
      club = "Serbest";
    }

    players.push({
      name,
      position: pos,
      club: club || "Serbest",
      age,
      dateOfBirth: dob || `${2026 - age}-06-01`
    });
  }
  
  return players;
}

async function scrapeAll() {
  const result: Record<string, any[]> = {};
  
  for (const [teamId, wikiPage] of Object.entries(wikiPages)) {
    const url = `https://en.wikipedia.org/wiki/${wikiPage}`;
    console.log(`Scraping ${teamId} from ${url}...`);
    
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      if (!res.ok) {
        console.error(`Failed to fetch: ${res.statusText}`);
        continue;
      }
      
      const html = await res.text();
      
      // Find current squad section
      let headingIndex = html.indexOf('id="Current_squad"');
      if (headingIndex === -1) {
        headingIndex = html.indexOf('id="Current_Squad"');
      }
      
      if (headingIndex === -1) {
        console.log(`Could not find squad section for ${teamId}, trying default table lookup...`);
        // Try fallback search for wikitable plainrowheaders or nat-fs-table
        const fallbackTableIndex = html.indexOf('class="nat-fs-table"');
        if (fallbackTableIndex === -1) {
          console.error(`Failed: No table found for ${teamId}`);
          continue;
        }
        const tableEndIndex = html.indexOf('</table>', fallbackTableIndex);
        const tableHtml = html.slice(fallbackTableIndex, tableEndIndex + 8);
        const players = parseSquadTable(tableHtml);
        result[teamId] = players;
        console.log(`Found fallback squad table with ${players.length} players.`);
        continue;
      }
      
      const tableIndex = html.indexOf('<table', headingIndex);
      if (tableIndex === -1) {
        console.error(`Failed: No table after squad heading for ${teamId}`);
        continue;
      }
      
      const tableEndIndex = html.indexOf('</table>', tableIndex);
      const tableHtml = html.slice(tableIndex, tableEndIndex + 8);
      
      const players = parseSquadTable(tableHtml);
      result[teamId] = players;
      console.log(`Successfully scraped ${players.length} players.`);
      
      // Wait a bit to avoid hitting Wikipedia rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err: any) {
      console.error(`Failed scraping ${teamId}: ${err.message}`);
    }
  }
  
  const outputPath = path.join(__dirname, "real-squads.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Scraping finished! Wrote to ${outputPath}`);
}

scrapeAll().catch(console.error);
