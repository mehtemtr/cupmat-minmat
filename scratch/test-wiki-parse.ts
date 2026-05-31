import * as fs from "fs";

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
    if (pos.includes("GK")) pos = "GK";
    else if (pos.includes("DF")) pos = "DF";
    else if (pos.includes("MF")) pos = "MF";
    else if (pos.includes("FW")) pos = "FW";
    
    // Player is cell 2
    const playerCell = cells[2] || "";
    // Extract text from the first link, if present
    const playerLinkMatch = playerCell.match(/<a[^>]*>([^<]+)<\/a>/);
    let name = playerLinkMatch ? playerLinkMatch[1].trim() : cleanText(playerCell);
    name = name.replace(/ \(footballer\)/g, "").replace(/ \(born \d+\)/g, "");

    // DOB is cell 3
    const dobCell = cells[3] || "";
    const bdayMatch = dobCell.match(/class="bday">([^<]+)</);
    const dob = bdayMatch ? bdayMatch[1] : "";
    
    // Age calculation
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
    // Find the last link in club cell or clean text
    const clubLinks = [...clubCell.matchAll(/<a[^>]*>([^<]+)<\/a>/g)];
    const club = clubLinks.length > 0 ? clubLinks[clubLinks.length - 1][1].trim() : cleanText(clubCell);

    players.push({
      name,
      position: pos,
      club: club || "Serbest",
      age,
      date_of_birth: dob || `${2026 - age}-06-01`
    });
  }
  
  return players;
}

async function test() {
  const url = "https://en.wikipedia.org/wiki/Turkey_national_football_team";
  console.log("Fetching turkey squad...");
  const res = await fetch(url);
  const html = await res.text();
  
  const headingIndex = html.indexOf('id="Current_squad"');
  if (headingIndex === -1) {
    console.log("No current squad.");
    return;
  }
  
  const tableIndex = html.indexOf('<table', headingIndex);
  const tableEndIndex = html.indexOf('</table>', tableIndex);
  const tableHtml = html.slice(tableIndex, tableEndIndex + 8);
  
  const players = parseSquadTable(tableHtml);
  console.log(`Successfully parsed ${players.length} players!`);
  console.log(players.slice(0, 5));
}

test();
