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
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '') // remove special characters like hyphens
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
  "ozbekistan": "uzb",
  "kolombiya": "col",
  "ingiltere": "eng",
  "hirvatistan": "cro",
  "panama": "pan",
  "ispanya": "esp",
  "yesil burun adalari": "cpv",
  "suudi arabistan": "ksa"
};

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
  "antonio silva": "António Silva"
};

async function run() {
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

  const rawText = fs.readFileSync(path.join(__dirname, 'user_raw_stats.txt'), 'utf8');
  
  // Split raw text into matches
  const matchBlocks = rawText.split(/(?=\d+\.\s+MAÇ:)/);
  console.log(`Found ${matchBlocks.length} match blocks.`);

  const parsedMatches = [];

  for (const block of matchBlocks) {
    if (!block.trim()) continue;
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    const headerLine = lines[0];
    const matchHeader = headerLine.match(/\d+\.\s+MAÇ:\s+([^-]+)\s+(\d+)\s*-\s*(\d+)\s+([^(]+)/i);
    if (!matchHeader) {
      continue;
    }

    const homeName = matchHeader[1].trim();
    const homeScore = parseInt(matchHeader[2].trim());
    const awayScore = parseInt(matchHeader[3].trim());
    const awayName = matchHeader[4].trim();

    const homeId = TEAM_NAME_TO_ID[normalizeName(homeName)];
    const awayId = TEAM_NAME_TO_ID[normalizeName(awayName)];

    const matchInfo = {
      header: headerLine,
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
        const teamName = line.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').replace("İstatistikleri", "").trim();
        currentTeamId = TEAM_NAME_TO_ID[normalizeName(teamName)];
        continue;
      }
      if (line.startsWith("Oyuncu Adı")) {
        continue; // table header
      }
      if (line.startsWith("Not:")) {
        continue; // note
      }

      const parts = line.split(/\t+/);
      if (parts.length < 4) continue;

      const playerName = parts[0].trim();
      const goalsText = parts[1] || '0';
      const assistsText = parts[2] || '0';
      const yellowText = parts[3] || '0';
      const redText = parts[4] || '0';
      const startText = parts[5] || 'İlk 11';
      const endText = parts[6] || 'Maç Sonu';
      const durationText = parts[7] || '90 dk';

      const goals = parseInt(goalsText.split(' ')[0]) || 0;
      const assists = parseInt(assistsText.split(' ')[0]) || 0;
      const yellow = parseInt(yellowText.split(' ')[0]) || 0;
      const red = parseInt(redText.split(' ')[0]) || 0;
      const duration = parseInt(durationText.replace(/[^0-9]/g, '')) || 0;

      // Find player in dbRosters
      // If player is a known own-goal scorer listed on the wrong team, we can check their real team
      let lookupTeamId = currentTeamId;
      if (playerName.includes("(KK)") || playerName.toLowerCase().includes("hany")) {
        // Special case: Hany own goal, lookup in Egypt (egy) roster
        if (playerName.toLowerCase().includes("hany")) {
          lookupTeamId = "egy";
        }
      }

      const teamRoster = dbRosters.filter(r => r.team_id === lookupTeamId);
      
      const normPName = normalizeName(playerName);
      let matchedPlayer = teamRoster.find(r => normalizeName(r.player_name) === normPName);
      
      if (!matchedPlayer && lookupTeamId) {
        // Try manual overrides
        const manualTarget = MANUAL_PLAYER_MAPPINGS[normPName];
        if (manualTarget) {
          matchedPlayer = teamRoster.find(r => r.player_name.toLowerCase() === manualTarget.toLowerCase());
        }
      }

      if (!matchedPlayer && lookupTeamId) {
        // Loose match: last name contains or first name contains
        matchedPlayer = teamRoster.find(r => {
          const normDbName = normalizeName(r.player_name);
          // check if last name is in db name
          const pNameParts = normPName.split(' ');
          const dbNameParts = normDbName.split(' ');
          // if last name matches
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
        teamId: lookupTeamId,
        goals,
        assists,
        yellowCards: yellow,
        redCards: red,
        minutesPlayed: duration,
        starting11: startText.toLowerCase().includes("ilk 11"),
        playerId: matchedPlayer ? matchedPlayer.id : null,
        matchedName: matchedPlayer ? matchedPlayer.player_name : null
      });
    }

    parsedMatches.push(matchInfo);
  }

  const unmappedPlayers = [];
  parsedMatches.forEach(m => {
    m.players.forEach(p => {
      if (!p.playerId && p.teamId) {
        unmappedPlayers.push(`${p.playerName} (${p.teamId})`);
      }
    });
  });

  console.log("\nUnmapped Players after loose/fuzzy matching:", unmappedPlayers.length);
  if (unmappedPlayers.length > 0) {
    console.log("Sample unmapped players:");
    console.log(unmappedPlayers.slice(0, 30));
  }
}
run();
