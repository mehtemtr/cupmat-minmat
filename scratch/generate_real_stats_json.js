const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse environment variables manually
const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function normalizeName(str) {
  if (!str) return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[\-\–\—]/g, ' ') // replace all dash-like characters with space
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '') // remove special characters
    .trim();
}

const TEAM_NAME_TO_ID = {
  "meksika": "mex",
  "guney afrika": "rsa",
  "guney kore": "kor",
  "cekya": "cze",
  "kanada": "can",
  "bosna hersek": "bih",
  "isvicre": "sui",
  "katar": "qat",
  "brezilya": "bra",
  "fas": "mar",
  "iskocya": "sco",
  "haiti": "hti",
  "amerika birlesik devletleri": "usa",
  "abd": "usa",
  "paraguay": "par",
  "avustralya": "aus",
  "turkiye": "tur",
  "almanya": "ger",
  "curacao": "cuw",
  "fildisi sahili": "civ",
  "ekvador": "ecu",
  "hollanda": "ned",
  "japonya": "jpn",
  "isvec": "swe",
  "tunus": "tun",
  "belcika": "bel",
  "misir": "egy",
  "iran": "irn",
  "yeni zelanda": "nzl",
  "portekiz": "por",
  "gana": "gha",
  "uruguay": "uru",
  "fransa": "fra",
  "senegal": "sen",
  "irak": "irq",
  "norvec": "nor",
  "arjantin": "arg",
  "cezayir": "alg",
  "avusturya": "aut",
  "urdun": "jor",
  "kongo dc": "cod",
  "demokratik kongo": "cod",
  "ozbekistan": "uzb",
  "kolombiya": "col",
  "ingiltere": "eng",
  "hirvatistan": "cro",
  "panama": "pan",
  "ispanya": "esp",
  "yesil burun adalari": "cpv",
  "suudi arabistan": "ksa"
};

// Helper to resolve team ID from name
function resolveTeamId(name) {
  const norm = normalizeName(name);
  if (TEAM_NAME_TO_ID[norm]) return TEAM_NAME_TO_ID[norm];
  for (const [key, id] of Object.entries(TEAM_NAME_TO_ID)) {
    if (norm.includes(key) || key.includes(norm)) {
      return id;
    }
  }
  return null;
}

// Hand-tuned mappings for spelling differences
const MANUAL_PLAYER_MAPPINGS = {
  "muhammed salah": "Mohamed Salah",
  "andrew robertson": "Andy Robertson",
  "micky van de ven": "Micky van de Ven",
  "hakan calhanoglu": "Hakan Çalhanoğlu",
  "arda guler": "Arda Güler",
  "kenan yildiz": "Kenan Yıldız",
  "baris alper yilmaz": "Barış Alper Yılmaz",
  "ismail yuksek": "İsmail Yüksek",
  "semih kilicsoy": "Semih Kılıçsoy",
  "mert muldur": "Mert Müldür",
  "kerem akturkoglu": "Kerem Aktürkoğlu",
  "ahmetcan kaplan": "Ahmetcan Kaplan",
  "ugurcan cakir": "Uğurcan Çakır",
  "abdulkerim bardakci": "Abdülkerim Bardakcı",
  "merih demiral": "Merih Demiral",
  "ferdi kadioglu": "Ferdi Kadıoğlu",
  "zeki celik": "Zeki Çelik",
  "salih ozcan": "Salih Özcan",
  "orkun kokcu": "Orkun Kökçü",
  "cristiano ronaldo": "Cristiano Ronaldo",
  "bruno fernandes": "Bruno Fernandes",
  "rafael leao": "Rafael Leão",
  "joao felix": "João Félix",
  "ruben dias": "Rúben Dias",
  "diogo costa": "Diogo Costa",
  "joao cancelo": "João Cancelo",
  "bernardo silva": "Bernardo Silva",
  "vitinha": "Vitinha",
  "goncalo ramos": "Gonçalo Ramos",
  "joao neves": "João Neves",
  "nuno mendes": "Nuno Mendes",
  "joao palhinha": "João Palhinha",
  "diogo jota": "Diogo Jota",
  "francisco conceicao": "Francisco Conceição",
  "diogo dalot": "Diogo Dalot",
  "antonio silva": "António Silva",
  "marquinhos": "Marquinhos",
  "casemiro": "Casemiro",
  "rodrygo": "Rodrygo",
  "endrick": "Endrick",
  "raphinha": "Raphinha",
  "gabriel martinelli": "Gabriel Martinelli",
  "danilo": "Danilo",
  "ro ro": "Pedro Miguel"
};

async function run() {
  const rawFileArg = process.argv[2] || 'scratch/user_raw_stats.txt';
  const stageName = process.argv[3] || 'matchday_1';
  
  const rawFilePath = path.isAbsolute(rawFileArg) ? rawFileArg : path.join(workspaceDir, rawFileArg);
  if (!fs.existsSync(rawFilePath)) {
    console.error(`Raw stats file not found: ${rawFilePath}`);
    process.exit(1);
  }

  // Load GROUP_FIXTURES from JSON
  const fixturesPath = path.join(workspaceDir, 'data', 'fixtures-list.json');
  if (!fs.existsSync(fixturesPath)) {
    console.error("fixtures-list.json not found! Run extract_fixtures.ts first.");
    process.exit(1);
  }
  const GROUP_FIXTURES = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

  // Paged fetch of team_rosters
  const dbRosters = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('team_rosters')
      .select('id, player_name, team_id')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) {
      console.error(error);
      break;
    }
    if (!data || data.length === 0) break;
    dbRosters.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Loaded ${dbRosters.length} players from database for matching.`);

  const rawText = fs.readFileSync(rawFilePath, 'utf8');
  
  // Split raw text into matches
  const matchBlocks = rawText.split(/(?=\d+\.\s+MAÇ:)/);
  const parsedMatches = [];

  for (const block of matchBlocks) {
    if (!block.trim()) continue;
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    const headerLine = lines[0];
    const matchHeader = headerLine.match(/\d+\.\s+MAÇ:\s+(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)(?:\s*\(|$)/i);
    if (!matchHeader) continue;

    const homeName = matchHeader[1].trim();
    const homeScore = parseInt(matchHeader[2].trim());
    const awayScore = parseInt(matchHeader[3].trim());
    const awayName = matchHeader[4].trim();

    const homeId = resolveTeamId(homeName);
    const awayId = resolveTeamId(awayName);

    // Map to official GROUP_FIXTURES using team IDs
    let matchedFixture = GROUP_FIXTURES.find(f => 
      (f.homeTeamId === homeId && f.awayTeamId === awayId) ||
      (f.homeTeamId === awayId && f.awayTeamId === homeId)
    );

    if (!matchedFixture) {
      console.error(`Could not map fixture for: ${homeName} (${homeId}) vs ${awayName} (${awayId})`);
      continue;
    }

    const matchInfo = {
      matchId: matchedFixture.id,
      officialHomeTeamId: matchedFixture.homeTeamId,
      officialAwayTeamId: matchedFixture.awayTeamId,
      homeName,
      awayName,
      homeId,
      awayId,
      homeScore,
      awayScore,
      players: []
    };

    // Parse player tables
    let currentTeamId = null;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("İstatistikleri")) {
        const teamName = line.replace(/[\-\–\—]/g, ' ').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').replace("İstatistikleri", "").trim();
        currentTeamId = resolveTeamId(teamName);
        continue;
      }
      if (line.startsWith("Oyuncu Adı")) continue;
      if (line.startsWith("Not:")) continue;

      const parts = line.split(/\t+/);
      if (parts.length < 4) continue;

      const playerNameWithGK = parts[0].trim();
      const playerName = playerNameWithGK.replace(/\s*\(GK\)\s*/gi, "").trim();
      const goalsText = parts[1] || '0';
      const assistsText = parts[2] || '0';
      const yellowText = parts[3] || '0';
      const redText = parts[4] || '0';
      const startText = parts[5] || 'İlk 11';
      const durationText = parts[7] || '90 dk';

      let goals = parseInt(goalsText.split(' ')[0]) || 0;
      const assists = parseInt(assistsText.split(' ')[0]) || 0;
      const yellow = parseInt(yellowText.split(' ')[0]) || 0;
      const red = parseInt(redText.split(' ')[0]) || 0;
      const duration = parseInt(durationText.replace(/[^0-9]/g, '')) || 0;

      // Find player in dbRosters
      let lookupTeamId = currentTeamId;
      if (playerName.includes("(KK)") || playerName.toLowerCase().includes("hany")) {
        if (playerName.toLowerCase().includes("hany")) {
          lookupTeamId = "egy";
        }
      }

      const teamRoster = dbRosters.filter(r => r.team_id === lookupTeamId);
      const normPName = normalizeName(playerName);
      
      let matchedPlayer = teamRoster.find(r => normalizeName(r.player_name) === normPName);
      
      if (!matchedPlayer && lookupTeamId) {
        const manualTarget = MANUAL_PLAYER_MAPPINGS[normPName];
        if (manualTarget) {
          matchedPlayer = teamRoster.find(r => r.player_name.toLowerCase() === manualTarget.toLowerCase());
        }
      }

      if (!matchedPlayer && lookupTeamId) {
        // loose match
        matchedPlayer = teamRoster.find(r => {
          const normDbName = normalizeName(r.player_name);
          const pNameParts = normPName.split(' ');
          const dbNameParts = normDbName.split(' ');
          if (pNameParts.length > 0 && dbNameParts.length > 0) {
            const lastName = pNameParts[pNameParts.length - 1];
            const dbLastName = dbNameParts[dbNameParts.length - 1];
            if (lastName.length > 3 && (dbLastName === lastName || normDbName.includes(lastName) || normPName.includes(dbLastName))) {
              return true;
            }
          }
          return normDbName.includes(normPName) || normPName.includes(normDbName);
        });
      }

      if (!matchedPlayer) {
        console.error(`ERROR: Player still not found in DB: ${playerName} (${lookupTeamId})`);
        continue;
      }

      // Check for own goals
      let ownGoals = 0;
      if (playerName.includes("(KK)")) {
        ownGoals = goals;
        goals = 0;
      }

      // Special case own goal checks (Breel Embolo in match B-6)
      if (matchedFixture.id === "B-6" && normalizeName(playerName) === "breel embolo") {
        ownGoals = 1;
      }

      // Matchday 3 own goals
      if (matchedFixture.id === "B-4" && normalizeName(playerName) === "homam ahmed") {
        ownGoals = 1;
      }
      if (matchedFixture.id === "C-4" && normalizeName(playerName) === "yassine bounou") {
        ownGoals = 1;
      }
      if (matchedFixture.id === "F-4" && normalizeName(playerName) === "ellyes skhiri") {
        ownGoals = 1;
      }

      matchInfo.players.push({
        playerId: matchedPlayer.id,
        playerName: matchedPlayer.player_name,
        teamId: lookupTeamId,
        goals,
        assists,
        ownGoals,
        yellowCards: yellow,
        redCards: red,
        minutesPlayed: duration,
        starting11: normalizeName(startText).includes("ilk 11")
      });
    }

    parsedMatches.push(matchInfo);
  }

  // Format into stage JSON structure
  const stageMatches = parsedMatches.map(m => {
    // Map score to official home/away teams
    let officialHomeScore = m.homeScore;
    let officialAwayScore = m.awayScore;
    if (m.homeId !== m.officialHomeTeamId) {
      // swap scores because home/away was swapped in the raw sheet
      officialHomeScore = m.awayScore;
      officialAwayScore = m.homeScore;
    }

    return {
      matchId: m.matchId,
      homeTeamId: m.officialHomeTeamId,
      awayTeamId: m.officialAwayTeamId,
      homeScore: officialHomeScore,
      awayScore: officialAwayScore,
      players: m.players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        teamId: p.teamId,
        goals: p.goals,
        assists: p.assists,
        ownGoals: p.ownGoals,
        yellowCards: p.yellowCards,
        redCards: p.redCards,
        minutesPlayed: p.minutesPlayed,
        starting11: p.starting11
      }))
    };
  });

  const outputPath = path.join(workspaceDir, 'data', 'real-tournament-stats.json');
  
  let existingJson = {};
  if (fs.existsSync(outputPath)) {
    try {
      existingJson = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    } catch (e) {
      console.warn("Could not parse existing real-tournament-stats.json, starting fresh.");
    }
  }

  // Merge new stage matches
  existingJson[stageName] = stageMatches;

  fs.writeFileSync(outputPath, JSON.stringify(existingJson, null, 2), 'utf8');
  console.log(`Successfully generated/updated ${outputPath} with ${stageMatches.length} matches under stage '${stageName}'!`);
}
run();
