import { supabaseAdmin } from "../lib/supabase";
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

// Map team ID to its local/domestic league
const domesticLeagues: Record<string, string> = {
  tur: "Süper Lig",
  mex: "Liga MX",
  usa: "MLS",
  can: "MLS",
  bra: "Série A (Brezilya)",
  arg: "Primera División (Arjantin)",
  eng: "Premier League",
  ger: "Bundesliga",
  fra: "Ligue 1",
  esp: "La Liga",
  jpn: "J1 League",
  kor: "K League 1",
  ned: "Eredivisie",
  por: "Primeira Liga",
  uru: "Primera División (Uruguay)",
  sen: "Senegal Premier League",
  mar: "Botola Pro (Fas)",
  cro: "HNL (Hırvatistan)",
  ita: "Serie A",
  ecu: "LigaPro (Ekvador)",
  col: "Categoría Primera A (Kolombiya)",
  egy: "Mısır Premier Ligi",
  ksa: "Saudi Pro League",
  civ: "Fildişi Sahili Ligue 1",
  rsa: "South African Premier Division",
  bih: "Bosna-Hersek Premier Ligi",
  qat: "Qatar Stars League",
  sco: "Scottish Premiership",
  hti: "Haiti Championnat National",
  par: "Primera División (Paraguay)",
  aus: "A-League Men",
  aut: "Avusturya Bundesliga",
  jor: "Ürdün Pro Ligi",
  uzb: "Özbekistan Süper Ligi",
  cod: "Linafoot (Kongo)",
  pan: "Liga Panameña de Fútbol",
  gha: "Gana Premier Ligi",
  cze: "Çek Birinci Ligi",
  irn: "Persian Gulf Pro League",
  nzl: "New Zealand National League",
  irq: "Irak Yıldızlar Ligi",
  alg: "Cezayir 1. Ligi",
  swe: "Allsvenskan (İsveç)",
  nor: "Eliteserien (Norveç)",
  tun: "Tunus 1. Ligi",
  bel: "Belçika Pro Lig",
  cuw: "Curaçao Promé Divishon",
  cpv: "Yeşil Burun Adaları Ligi"
};

function normalizeText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove other accents like é, á, í, ó, ú, ñ
    .toUpperCase();
}

function getLeagueByClubAndTeam(club: string, teamId: string): string {
  if (!club || club === "Kulüp Yok" || club === "Serbest") return "Serbest";
  
  const cNorm = normalizeText(club);

  // 1. Specific club name mappings
  
  // Süper Lig
  if (
    cNorm.includes("GALATASARAY") || cNorm.includes("FENERBAHCE") || cNorm.includes("FENER") || 
    cNorm.includes("BESIKTAS") || cNorm.includes("TRABZONSPOR") || cNorm.includes("BASAKSEHIR") || 
    cNorm.includes("ISTANBUL B") || cNorm.includes("EYUPSPOR") || cNorm.includes("KASIMPASA") || 
    cNorm.includes("GOZTEPE") || cNorm.includes("KONYASPOR") || cNorm.includes("ANTALYASPOR") || 
    cNorm.includes("RIZESPOR") || cNorm.includes("SIVASSPOR") || cNorm.includes("ALANYASPOR") || 
    cNorm.includes("BODRUM") || cNorm.includes("HATAYSPOR") || cNorm.includes("DEMIRSPOR") || 
    cNorm.includes("KAYSERISPOR") || cNorm.includes("PENDIK") || cNorm.includes("KARAGUMRUK") || 
    cNorm.includes("ANKARAGUCU") || cNorm.includes("ISTANBULSPOR")
  ) {
    return "Süper Lig";
  }

  // La Liga
  if (
    cNorm.includes("REAL MADRID") || cNorm.includes("BARCELONA") || cNorm.includes("BARCA") ||
    cNorm.includes("ATLETICO MADRID") || cNorm.includes("ATLETICO M") || cNorm.includes("BILBAO") || 
    cNorm.includes("ATHLETIC") || cNorm.includes("REAL SOCIEDAD") || cNorm.includes("REAL BETIS") || 
    cNorm.includes("VILLARREAL") || cNorm.includes("VALENCIA") || cNorm.includes("SEVILLA") || 
    cNorm.includes("GETAFE") || cNorm.includes("GIRONA") || cNorm.includes("CELTA") || 
    cNorm.includes("MALLORCA") || cNorm.includes("ALAVES") || cNorm.includes("LEGANES") || 
    cNorm.includes("VALLADOLID") || cNorm.includes("ESPANYOL") || cNorm.includes("CADIZ") || 
    cNorm.includes("GRANADA") || cNorm.includes("ALMERIA")
  ) {
    return "La Liga";
  }

  // Serie A
  if (
    cNorm.includes("MILAN") || cNorm.includes("JUVENTUS") || cNorm.includes("INTER") || 
    cNorm.includes("ROMA") || cNorm.includes("LAZIO") || cNorm.includes("FIORENTINA") || 
    cNorm.includes("ATALANTA") || cNorm.includes("TORINO") || cNorm.includes("NAPOLI") || 
    cNorm.includes("COMO") || cNorm.includes("MONZA") || cNorm.includes("BOLOGNA") || 
    cNorm.includes("GENOA") || cNorm.includes("SASSUOLO") || cNorm.includes("VERONA") || 
    cNorm.includes("LECCE") || cNorm.includes("UDINESE") || cNorm.includes("CAGLIARI") || 
    cNorm.includes("EMPOLI") || cNorm.includes("PARMA") || cNorm.includes("VENEZIA") || 
    cNorm.includes("SALERNITANA") || cNorm.includes("SAMPDORIA")
  ) {
    return "Serie A";
  }

  // Bundesliga
  if (
    cNorm.includes("BAYERN") || cNorm.includes("MUNCHEN") || cNorm.includes("MUNICH") ||
    cNorm.includes("LEVERKUSEN") || cNorm.includes("DORTMUND") || cNorm.includes("STUTTGART") || 
    cNorm.includes("LEIPZIG") || cNorm.includes("FRANKFURT") || cNorm.includes("EINTRACHT") || 
    cNorm.includes("HOFFENHEIM") || cNorm.includes("HEIDENHEIM") || cNorm.includes("BREMEN") || 
    cNorm.includes("WERDER") || cNorm.includes("FREIBURG") || cNorm.includes("AUGSBURG") || 
    cNorm.includes("WOLFSBURG") || cNorm.includes("MAINZ") || cNorm.includes("GLADBACH") || 
    cNorm.includes("MONCHENGLADBACH") || cNorm.includes("BERLIN") || cNorm.includes("BOCHUM") || 
    cNorm.includes("PAULI") || cNorm.includes("KIEL") || cNorm.includes("DUSSELDORF") || 
    cNorm.includes("KOLN") || cNorm.includes("COLGNE") || cNorm.includes("SCHALKE") || 
    cNorm.includes("HERTHA") || cNorm.includes("SALZBURG")
  ) {
    return "Bundesliga";
  }

  // Ligue 1 & Ligue 2
  if (
    cNorm.includes("PSG") || cNorm.includes("PARIS") || cNorm.includes("MONACO") || 
    cNorm.includes("BREST") || cNorm.includes("LILLE") || cNorm.includes("NICE") || 
    cNorm.includes("LENS") || cNorm.includes("MARSEILLE") || cNorm.includes("REIMS") || 
    cNorm.includes("RENNES") || cNorm.includes("TOULOUSE") || cNorm.includes("MONTPELLIER") || 
    cNorm.includes("STRASBOURG") || cNorm.includes("HAVRE") || cNorm.includes("NANTES") || 
    cNorm.includes("AUXERRE") || cNorm.includes("ANGERS") || cNorm.includes("ETIENNE") || 
    cNorm.includes("LYON") || cNorm.includes("OLYMPIQUE") || cNorm.includes("METZ") || 
    cNorm.includes("LORIENT") || cNorm.includes("METZ")
  ) {
    return "Ligue 1";
  }

  // Premier League
  if (
    cNorm.includes("MANCHESTER") || cNorm.includes("LIVERPOOL") || cNorm.includes("ARSENAL") || 
    cNorm.includes("CHELSEA") || cNorm.includes("TOTTENHAM") || cNorm.includes("SPURS") || 
    cNorm.includes("WEST HAM") || cNorm.includes("CRYSTAL PALACE") || cNorm.includes("NEWCASTLE") || 
    cNorm.includes("ASTON VILLA") || cNorm.includes("BRIGHTON") || cNorm.includes("BOURNEMOUTH") || 
    cNorm.includes("EVERTON") || cNorm.includes("BRENTFORD") || cNorm.includes("WOLVES") || 
    cNorm.includes("WOLVERHAMPTON") || cNorm.includes("FOREST") || cNorm.includes("LEICESTER") || 
    cNorm.includes("SOUTHAMPTON") || cNorm.includes("IPSWICH") || cNorm.includes("FULHAM")
  ) {
    return "Premier League";
  }

  // EFL Championship
  if (
    cNorm.includes("SUNDERLAND") || cNorm.includes("NORWICH") || cNorm.includes("BURNLEY") || 
    cNorm.includes("WATFORD") || cNorm.includes("LEEDS") || cNorm.includes("HULL") || 
    cNorm.includes("STOKE") || cNorm.includes("SWANSEA") || cNorm.includes("SHEFFIELD") || 
    cNorm.includes("WEST BROM") || cNorm.includes("COVENTRY") || cNorm.includes("BLACKBURN") ||
    cNorm.includes("MIDDLESBROUGH") || cNorm.includes("LUTON") || cNorm.includes("DERBY")
  ) {
    return "Championship (İngiltere)";
  }

  // Scottish Premiership
  if (
    cNorm.includes("CELTIC") || cNorm.includes("RANGERS") || cNorm.includes("HEARTS") || 
    cNorm.includes("ABERDEEN") || cNorm.includes("HIBERNIAN") || cNorm.includes("MOTHERWELL")
  ) {
    return "Scottish Premiership";
  }

  // Eredivisie
  if (
    cNorm.includes("AJAX") || cNorm.includes("PSV") || cNorm.includes("FEYENOORD") || 
    cNorm.includes("ALKMAAR") || cNorm.includes("UTRECHT") || cNorm.includes("TWENTE") || 
    cNorm.includes("NIJMEGEN") || cNorm.includes("ROTTERDAM") || cNorm.includes("SITTARD") || 
    cNorm.includes("HEERENVEEN") || cNorm.includes("ZWOLLE") || cNorm.includes("ALMERE") || 
    cNorm.includes("HERACLES") || cNorm.includes("WAALWIJK") || cNorm.includes("GRONINGEN") || 
    cNorm.includes("WILLEM") || cNorm.includes("BREDA")
  ) {
    return "Eredivisie";
  }

  // Primeira Liga
  if (
    cNorm.includes("BENFICA") || cNorm.includes("SPORTING CP") || cNorm.includes("SPORTING LISBON") || 
    cNorm.includes("FC PORTO") || cNorm.includes("PORTO") || cNorm.includes("BRAGA") || 
    cNorm.includes("GUIMARAES") || cNorm.includes("BOAVISTA") || cNorm.includes("FAMALICAO") || 
    cNorm.includes("ESTORIL") || cNorm.includes("FARENSE") || cNorm.includes("CASA PIA") || 
    cNorm.includes("AMADORA") || cNorm.includes("TORREENSE") || cNorm.includes("SANTA CLARA") ||
    cNorm.includes("RIL VICENTE") || cNorm.includes("MOREIRENSE") || cNorm.includes("RIO AVE")
  ) {
    return "Primeira Liga";
  }

  if (cNorm.includes("SPORTING")) {
    if (teamId === "por") return "Primeira Liga";
    if (teamId === "usa") return "MLS";
  }

  // MLS
  if (
    cNorm.includes("MIAMI") || cNorm.includes("LAFC") || cNorm.includes("GALAXY") || 
    cNorm.includes("COLUMBUS") || cNorm.includes("CINCINNATI") || cNorm.includes("RED BULL") || 
    cNorm.includes("NYCFC") || cNorm.includes("SOUNDERS") || cNorm.includes("ORLANDO") || 
    cNorm.includes("CHARLOTTE") || cNorm.includes("TIMBERS") || cNorm.includes("WHITECAPS") || 
    cNorm.includes("TORONTO") || cNorm.includes("MONTREAL") || cNorm.includes("PHILADELPHIA") || 
    cNorm.includes("DALLAS") || cNorm.includes("AUSTIN") || cNorm.includes("SAN JOSE") || 
    cNorm.includes("FIRE") || cNorm.includes("REVOLUTION") || cNorm.includes("ATLANTA") || 
    cNorm.includes("D.C.") || cNorm.includes("LOS ANGELES") || cNorm.includes("ST. LOUIS")
  ) {
    return "MLS";
  }

  // Saudi Pro League
  if (
    cNorm.includes("AL HILAL") || cNorm.includes("AL-HILAL") || cNorm.includes("AL NASSR") || 
    cNorm.includes("AL-NASSR") || cNorm.includes("AL ITTIHAD") || cNorm.includes("AL-ITTIHAD") || 
    cNorm.includes("AL AHLI") || cNorm.includes("AL-AHLI") || cNorm.includes("AL SHABAB") || 
    cNorm.includes("AL-SHABAB") || cNorm.includes("AL ETTIFAQ") || cNorm.includes("AL-ETTIFAC") || 
    cNorm.includes("NEOM") || cNorm.includes("QADSIAH") || cNorm.includes("DAMAC") || 
    cNorm.includes("AL TAAWOUN") || cNorm.includes("AL-TAAWOUN") || cNorm.includes("AL FATEH") ||
    cNorm.includes("AL-KHALEEJ") || cNorm.includes("AL-RAED") || cNorm.includes("AL-WEHDA") ||
    cNorm.includes("AL-FAYHA") || cNorm.includes("AL-RIYADH") || cNorm.includes("AL-OKHDOOD")
  ) {
    return "Saudi Pro League";
  }

  // Série A (Brezilya)
  if (
    cNorm.includes("FLAMENGO") || cNorm.includes("PALMEIRAS") || cNorm.includes("SAO PAULO") || 
    cNorm.includes("CORINTHIANS") || cNorm.includes("FLUMINENSE") || cNorm.includes("GREMIO") || 
    cNorm.includes("SANTOS") || cNorm.includes("MINEIRO") || cNorm.includes("BOTAFOGO") || 
    cNorm.includes("INTERNACIONAL") || cNorm.includes("CRUZEIRO") || cNorm.includes("PARANAENSE") || 
    cNorm.includes("BAHIA") || cNorm.includes("VASCO") || cNorm.includes("FORTALEZA") ||
    cNorm.includes("CUIABA") || cNorm.includes("GOIAS") || cNorm.includes("BRAGANTINO")
  ) {
    return "Série A (Brezilya)";
  }

  // Primera División (Arjantin)
  if (
    cNorm.includes("RIVER PLATE") || cNorm.includes("BOCA JUNIORS") || cNorm.includes("BOCA") || 
    cNorm.includes("RACING CLUB") || cNorm.includes("RACING") || cNorm.includes("INDEPENDIENTE") || 
    cNorm.includes("SAN LORENZO") || cNorm.includes("ESTUDIANTES") || cNorm.includes("VELEZ") || 
    cNorm.includes("TALLERES") || cNorm.includes("LANUS") || cNorm.includes("NEWELL") || 
    cNorm.includes("GIMNASIA") || cNorm.includes("ROSARIO CENTRAL") || cNorm.includes("HURACAN") ||
    cNorm.includes("ARGENTINOS") || cNorm.includes("DEFENSA Y JUSTICIA") || cNorm.includes("BANFIELD")
  ) {
    return "Primera División (Arjantin)";
  }

  // Liga MX
  if (
    cNorm.includes("AMERICA") || cNorm.includes("GUADALAJARA") || cNorm.includes("CHIVAS") || 
    cNorm.includes("MONTERREY") || cNorm.includes("TIGRES") || cNorm.includes("CRUZ AZUL") || 
    cNorm.includes("PUMAS") || cNorm.includes("TOLUCA") || cNorm.includes("PACHUCA") || 
    cNorm.includes("LAGUNA") || cNorm.includes("LEON") || cNorm.includes("TIJUANA") || 
    cNorm.includes("ATLAS") || cNorm.includes("QUERETARO") || cNorm.includes("NECAXA") || 
    cNorm.includes("JUAREZ") || cNorm.includes("PUEBLA") || cNorm.includes("SAN LUIS")
  ) {
    return "Liga MX";
  }

  // Swiss Super League
  if (
    cNorm.includes("YOUNG BOYS") || cNorm.includes("WINTERTHUR") || cNorm.includes("LUGANO") || 
    cNorm.includes("SERVETTE") || cNorm.includes("ZURICH") || cNorm.includes("BASEL") || 
    cNorm.includes("ST. GALLEN") || cNorm.includes("LAUSANNE") || cNorm.includes("SION") || 
    cNorm.includes("GRASSHOPPER")
  ) {
    return "Swiss Super League";
  }

  // Belçika Pro Lig
  if (
    cNorm.includes("GENK") || cNorm.includes("CLUB BRUGGE") || cNorm.includes("ANDERLECHT") || 
    cNorm.includes("CHARLEROI") || cNorm.includes("ANTWERP") || cNorm.includes("GENT") || 
    cNorm.includes("UNION SG") || cNorm.includes("CERCLE BRUGGE") || cNorm.includes("KORTRIJK")
  ) {
    return "Belçika Pro Lig";
  }

  // Danimarka Süper Ligi
  if (
    cNorm.includes("MIDTJYLLAND") || cNorm.includes("COPENHAGEN") || cNorm.includes("BRONDBY") || 
    cNorm.includes("NORDJAELLAND") || cNorm.includes("AARHUS") || cNorm.includes("SILKEBORG") ||
    cNorm.includes("NORDSIELLAND") || cNorm.includes("NORDSELAND") || cNorm.includes("NORDSIELLAND")
  ) {
    return "Danimarka Süper Ligi";
  }

  // Yunanistan Süper Ligi
  if (
    cNorm.includes("PAOK") || cNorm.includes("PANATHINAIKOS") || cNorm.includes("OLYMPIACOS") || 
    cNorm.includes("OLYMPIAKOS") || cNorm.includes("AEK")
  ) {
    return "Yunanistan Süper Ligi";
  }

  // UAE Pro League
  if (
    cNorm.includes("AL AIN") || cNorm.includes("AL-AIN") || cNorm.includes("AL SHARJAH") || 
    cNorm.includes("AL-SHARJAH") || cNorm.includes("AL WAHDA") || cNorm.includes("AL-WAHDA") || 
    cNorm.includes("AL JAZIRA") || cNorm.includes("AL-JAZIRA") || cNorm.includes("SHABAB AL AHLI")
  ) {
    return "UAE Pro League";
  }

  // Avusturya Bundesliga
  if (
    cNorm.includes("LASK") || cNorm.includes("RAPID WIEN") || cNorm.includes("STURM GRAZ") || 
    cNorm.includes("AUSTRIA WIEN") || cNorm.includes("SALZBURG")
  ) {
    return "Avusturya Bundesliga";
  }

  // Mısır Premier Ligi
  if (
    cNorm.includes("AL AHLY") || cNorm.includes("ZAMALEK") || cNorm.includes("PYRAMIDS")
  ) {
    return "Mısır Premier Ligi";
  }

  // Qatar Stars League
  if (
    cNorm.includes("AL GHARAFA") || cNorm.includes("AL-GHARAFA") || cNorm.includes("AL WAKRAH") || 
    cNorm.includes("AL-WAKRAH") || cNorm.includes("AL RAYYAN") || cNorm.includes("AL-RAYYAN") || 
    cNorm.includes("AL DUHAIL") || cNorm.includes("AL-DUHAIL") || cNorm.includes("AL SADD") || 
    cNorm.includes("AL-SADD")
  ) {
    return "Qatar Stars League";
  }

  // İsrail Ligat ha'Al
  if (
    cNorm.includes("MACCABI") || cNorm.includes("HAPOEL")
  ) {
    return "İsrail Ligat ha'Al";
  }

  // Sırbistan Süper Ligi
  if (
    cNorm.includes("RED STAR") || cNorm.includes("CRVENA ZVEZDA") || cNorm.includes("PARTIZAN")
  ) {
    return "Sırbistan Süper Ligi";
  }

  // HNL (Hırvatistan)
  if (
    cNorm.includes("RIJEKA") || cNorm.includes("DINAMO ZAGREB") || cNorm.includes("DINAMO Z") || 
    cNorm.includes("HAJDUK SPLIT")
  ) {
    return "HNL (Hırvatistan)";
  }

  // LigaPro (Ekvador)
  if (
    cNorm.includes("LDU QUITO") || cNorm.includes("EMELEC") || cNorm.includes("BARCELONA SC") || 
    cNorm.includes("INDEPENDIENTE DEL VALLE")
  ) {
    return "LigaPro (Ekvador)";
  }

  // Categoría Primera A (Kolombiya)
  if (
    cNorm.includes("MILLONARIOS") || cNorm.includes("DEPORTIVO CALI") || cNorm.includes("ATLETICO NACIONAL") || 
    cNorm.includes("JUNIOR")
  ) {
    return "Categoría Primera A (Kolombiya)";
  }

  // J1 League
  if (
    cNorm.includes("FC TOKYO") || cNorm.includes("URAWA REDS") || cNorm.includes("VISSEL KOBE") || 
    cNorm.includes("YOKOHAMA") || cNorm.includes("KAWASAKI")
  ) {
    return "J1 League";
  }

  // Kıbrıs Birinci Ligi
  if (
    cNorm.includes("AEL LIMASSOL") || cNorm.includes("APOEL") || cNorm.includes("OMONOIA")
  ) {
    return "Kıbrıs Birinci Ligi";
  }

  // 2. Default fallback: use player's national team's domestic league
  return domesticLeagues[teamId] || "Diğer";
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  console.log("Fetching all players from team_rosters...");
  const players: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("id, team_id, player_name, club, league")
      .range(from, to);

    if (error) {
      console.error("Error loading players:", error);
      return;
    }

    if (data && data.length > 0) {
      players.push(...data);
      if (data.length < 1000) {
        hasMore = false;
      } else {
        from += 1000;
        to += 1000;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Loaded ${players.length} players. Fixing leagues...`);
  
  let fixedCount = 0;

  for (const player of players) {
    const correctLeague = getLeagueByClubAndTeam(player.club, player.team_id);
    
    if (player.league !== correctLeague) {
      const { error } = await supabaseAdmin
        .from("team_rosters")
        .update({ league: correctLeague })
        .eq("id", player.id);
        
      if (error) {
        console.error(`Failed to update league for ${player.player_name}:`, error.message);
      } else {
        fixedCount++;
      }
    }
  }

  console.log(`✅ Completed! Fixed leagues for ${fixedCount} players in the database.`);
}

main().catch(console.error);
