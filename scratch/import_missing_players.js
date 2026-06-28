const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

// Load TEAM_NAME_TO_ID
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

// Known positions of famous unmapped players
const FAMOUS_PLAYER_POSITIONS = {
  "yann sommer": "Kaleci",
  "xherdan shaqiri": "Orta Saha",
  "cedric zesiger": "Defans",
  "sebastien haller": "Forvet",
  "youssef en-nesyri": "Forvet",
  "achraf hakimi": "Defans",
  "sofyan amrabat": "Orta Saha",
  "yassine bounou": "Kaleci",
  "nayef aguerd": "Defans",
  "romain saiss": "Defans",
  "noussair mazraoui": "Defans",
  "azzedine ounahi": "Orta Saha",
  "hakim ziyech": "Orta Saha",
  "amine harit": "Orta Saha",
  "abde ezzalzouli": "Forvet",
  "bilal el khannouss": "Orta Saha",
  "soufiane rahimi": "Forvet",
  "tarik tissoudali": "Forvet",
  "ismael saibari": "Orta Saha",
  "vinicius junior": "Forvet",
  "bruno guimaraes": "Orta Saha",
  "alisson": "Kaleci",
  "marquinhos": "Defans",
  "gabriel magalhaes": "Defans",
  "alex sandro": "Defans",
  "casemiro": "Orta Saha",
  "lucas paqueta": "Orta Saha",
  "rodrygo": "Forvet",
  "endrick": "Forvet",
  "raphinha": "Forvet",
  "gabriel martinelli": "Forvet",
  "leo pereira": "Defans",
  "ederson atalanta": "Orta Saha",
  "matheus cunha": "Forvet",
  "hakan calhanoglu": "Orta Saha",
  "arda guler": "Orta Saha",
  "kenan yildiz": "Forvet",
  "baris alper yilmaz": "Forvet",
  "ismail yuksek": "Orta Saha",
  "semih kilicsoy": "Forvet",
  "mert muldur": "Defans",
  "kerem akturkoglu": "Forvet",
  "ahmetcan kaplan": "Defans",
  "ugurcan cakir": "Kaleci",
  "abdulkerim bardakci": "Defans",
  "merih demiral": "Defans",
  "ferdi kadioglu": "Defans",
  "zeki celik": "Defans",
  "salih ozcan": "Orta Saha",
  "orkun kokcu": "Orta Saha",
  "cristiano ronaldo": "Forvet",
  "bruno fernandes": "Orta Saha",
  "rafael leao": "Forvet",
  "joao felix": "Forvet",
  "ruben dias": "Defans",
  "diogo costa": "Kaleci",
  "joao cancelo": "Defans",
  "bernardo silva": "Orta Saha",
  "vitinha": "Orta Saha",
  "goncalo ramos": "Forvet",
  "joao neves": "Orta Saha",
  "nuno mendes": "Defans",
  "joao palhinha": "Orta Saha",
  "diogo jota": "Forvet",
  "francisco conceicao": "Forvet",
  "diogo dalot": "Defans",
  "antonio silva": "Defans"
};

async function run() {
  const rawFileArg = process.argv[2] || 'scratch/user_raw_stats.txt';
  const rawFilePath = path.isAbsolute(rawFileArg) ? rawFileArg : path.join(workspaceDir, rawFileArg);

  if (!fs.existsSync(rawFilePath)) {
    console.error(`Raw stats file not found: ${rawFilePath}`);
    process.exit(1);
  }
  console.log(`Reading raw stats from: ${rawFilePath}`);

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
      console.error("Error fetching rosters:", error);
      break;
    }
    if (!data || data.length === 0) break;
    dbRosters.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Fetched ${dbRosters.length} players from team_rosters.`);

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
    const awayName = matchHeader[4].trim();

    const homeId = resolveTeamId(homeName);
    const awayId = resolveTeamId(awayName);

    const matchInfo = {
      homeId,
      awayId,
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

      matchInfo.players.push({
        playerName,
        playerNameWithGK,
        teamId: lookupTeamId,
        playerId: matchedPlayer ? matchedPlayer.id : null
      });
    }

    parsedMatches.push(matchInfo);
  }

  // Find all missing players
  const missingPlayers = [];
  parsedMatches.forEach(m => {
    m.players.forEach(p => {
      if (!p.playerId && p.teamId) {
        const key = `${p.playerName}::${p.teamId}`;
        if (!missingPlayers.some(x => `${x.playerName}::${x.teamId}` === key)) {
          missingPlayers.push(p);
        }
      }
    });
  });

  console.log(`\nFound ${missingPlayers.length} unique missing players to import.`);
  if (missingPlayers.length === 0) {
    console.log("All players are already mapped!");
    return;
  }

  // Prepare database inserts
  const inserts = [];
  for (const p of missingPlayers) {
    const norm = normalizeName(p.playerName);
    let position = "Orta Saha";
    if (p.playerNameWithGK.includes("(GK)")) {
      position = "Kaleci";
    } else {
      const knownPos = FAMOUS_PLAYER_POSITIONS[norm];
      if (knownPos) {
        position = knownPos;
      }
    }

    inserts.push({
      team_id: p.teamId,
      player_name: p.playerName,
      player_position: position,
      player_number: 99,
      club: "Unmapped Club",
      height: 180,
      weight: 75,
      league: "Unmapped League",
      is_captain: false
    });
  }

  console.log(`Sample inserts (first 10):`, inserts.slice(0, 10));

  // Perform inserts in chunks of 50
  console.log("Starting database inserts...");
  let successCount = 0;
  for (let i = 0; i < inserts.length; i += 50) {
    const chunk = inserts.slice(i, i + 50);
    const { data, error } = await supabase
      .from('team_rosters')
      .insert(chunk)
      .select('id');
    
    if (error) {
      console.error(`Error inserting chunk starting at index ${i}:`, error);
    } else {
      successCount += data.length;
      console.log(`Successfully inserted chunk: +${data.length} players (Total: ${successCount})`);
    }
  }

  console.log(`Completed. Successfully imported ${successCount}/${inserts.length} missing players!`);
}
run();
