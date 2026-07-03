import fs from "fs";
import path from "path";
import { supabaseAdmin } from "../lib/supabase";
import { TEAMS } from "../data/teams";

const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "");
};

async function test() {
  const jsonPath = path.join(process.cwd(), "scratch/parsed_excel_stats.json");
  const parsedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const teamMap = new Map<string, string>();
  TEAMS.forEach((team) => {
    teamMap.set(normalizeName(team.nameTr), team.id.toLowerCase());
  });

  const teamOverrides: Record<string, string> = {
    "abd": "usa",
    "kongodc": "cod",
    "kongodemokratikcumhuriyeti": "cod",
    "yesilburun": "cpv",
    "yesilburunadalari": "cpv",
  };

  const dbPlayers: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabaseAdmin.from("team_rosters").select("*").range(from, to);
    if (data && data.length > 0) {
      dbPlayers.push(...data);
      if (data.length < 1000) hasMore = false;
      else { from += 1000; to += 1000; }
    } else { hasMore = false; }
  }

  const playerMapByNumber = new Map<string, any>();
  const playerMapByName = new Map<string, any>();

  dbPlayers.forEach((p) => {
    const tId = p.team_id.toLowerCase();
    if (p.player_number !== null && p.player_number !== undefined) {
      playerMapByNumber.set(`${tId}_${p.player_number}`, p);
    }
    playerMapByName.set(`${tId}_${normalizeName(p.player_name)}`, p);
  });

  console.log("--- TEST MATCHING PRIORITY ---");
  
  // Test for Ferdi Kadioglu
  const testFerdiExcelRow = {
    team_name: "Türkiye",
    jersey_number: 20,
    player_name: "Ferdi Kadioglu",
    player_short: "F. Kadioglu"
  };

  const teamIdTur = teamOverrides[normalizeName(testFerdiExcelRow.team_name)] || teamMap.get(normalizeName(testFerdiExcelRow.team_name));
  
  // Method 1: Number first
  let fNum = playerMapByNumber.get(`${teamIdTur}_${testFerdiExcelRow.jersey_number}`);
  if (!fNum) fNum = playerMapByName.get(`${teamIdTur}_${normalizeName(testFerdiExcelRow.player_name)}`);
  console.log("Number First Match for Ferdi:", fNum ? fNum.player_name : "None");

  // Method 2: Name first
  let fName = playerMapByName.get(`${teamIdTur}_${normalizeName(testFerdiExcelRow.player_name)}`);
  if (!fName) fName = playerMapByName.get(`${teamIdTur}_${normalizeName(testFerdiExcelRow.player_short)}`);
  if (!fName) fName = playerMapByNumber.get(`${teamIdTur}_${testFerdiExcelRow.jersey_number}`);
  console.log("Name First Match for Ferdi:", fName ? fName.player_name : "None");

  // Test for Lionel Messi
  const testMessiExcelRow = {
    team_name: "Arjantin",
    jersey_number: 10,
    player_name: "Lionel Messi",
    player_short: "L. Messi"
  };

  const teamIdArg = teamOverrides[normalizeName(testMessiExcelRow.team_name)] || teamMap.get(normalizeName(testMessiExcelRow.team_name));

  // Method 1: Number first
  let mNum = playerMapByNumber.get(`${teamIdArg}_${testMessiExcelRow.jersey_number}`);
  if (!mNum) mNum = playerMapByName.get(`${teamIdArg}_${normalizeName(testMessiExcelRow.player_name)}`);
  console.log("Number First Match for Messi:", mNum ? mNum.player_name : "None");

  // Method 2: Name first
  let mName = playerMapByName.get(`${teamIdArg}_${normalizeName(testMessiExcelRow.player_name)}`);
  if (!mName) mName = playerMapByName.get(`${teamIdArg}_${normalizeName(testMessiExcelRow.player_short)}`);
  if (!mName) mName = playerMapByNumber.get(`${teamIdArg}_${testMessiExcelRow.jersey_number}`);
  console.log("Name First Match for Messi:", mName ? mName.player_name : "None");
}

test();
