import { supabaseAdmin } from "@/lib/supabase";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN || "15de2c6ad10c459f9e6d0046d30d6512";
const API_URL = "https://v3.football.api-sports.io";

export const TARGET_LEAGUES = [
  // --- KULÜP (CLUBS) ---
  2,   // UEFA Champions League
  3,   // UEFA Europa League
  848, // UEFA Conference League
  73,  // UEFA Super Cup
  13,  // Copa Libertadores (South America)
  11,  // Copa Sudamericana (South America)
  17,  // AFC Champions League (Asia)
  18,  // AFC Cup / Champions League Two (Asia)
  12,  // CAF Champions League (Africa)
  20,  // CAF Confederation Cup (Africa)
  16,  // CONCACAF Champions Cup (North America)
  68,  // OFC Champions League (Oceania)
  15,  // FIFA Club World Cup (Global)
  
  // --- MİLLİ TAKIM (NATIONAL TEAMS) ---
  1,   // FIFA World Cup
  4,   // Euro Championship
  5,   // UEFA Nations League
  9,   // Copa America
  6,   // Africa Cup of Nations (AFCON)
  7,   // AFC Asian Cup
  22,  // CONCACAF Gold Cup
  32,  // AFCON Qualifiers
  34,  // World Cup Qualifiers (CONMEBOL)
];

export const LEAGUE_REGIONS: Record<number, string> = {
  // Europe
  2: 'europe', 3: 'europe', 848: 'europe', 73: 'europe', 5: 'europe', 4: 'europe',
  // America
  13: 'america', 11: 'america', 34: 'america', 16: 'america', 9: 'america', 22: 'america',
  // Asia
  17: 'asia', 18: 'asia', 7: 'asia',
  // Africa
  12: 'africa', 32: 'africa', 20: 'africa', 6: 'africa',
  // World / Oceania
  15: 'world', 1: 'world', 68: 'oceania'
};

const TEAM_COUNTRY_CODES: Record<string, string> = {
  "Beşiktaş": "TÜR", "Fenerbahçe": "TÜR", "Galatasaray": "TÜR", "Trabzonspor": "TÜR", "Başakşehir": "TÜR",
  "Real Madrid": "İSP", "Barcelona": "İSP", "Atlético Madrid": "İSP", "Real Sociedad": "İSP", "Athletic Bilbao": "İSP", "Girona": "İSP", "Real Betis": "İSP", "Villarreal": "İSP",
  "Manchester City": "İNG", "Man City": "İNG", "Arsenal": "İNG", "Liverpool": "İNG", "Chelsea": "İNG", "Aston Villa": "İNG", "Tottenham": "İNG", "Manchester United": "İNG", "Newcastle": "İNG",
  "Bayern Munich": "ALM", "Bayer Leverkusen": "ALM", "Borussia Dortmund": "ALM", "RB Leipzig": "ALM", "VfB Stuttgart": "ALM", "Eintracht Frankfurt": "ALM",
  "PSG": "FRA", "Paris Saint Germain": "FRA", "Paris Saint-Germain": "FRA", "Lille": "FRA", "Lyon": "FRA", "Monaco": "FRA", "Marseille": "FRA", "Brest": "FRA",
  "Inter": "İTA", "Inter Milan": "İTA", "AC Milan": "İTA", "Juventus": "İTA", "Napoli": "İTA", "Atalanta": "İTA", "Bologna": "İTA", "Roma": "İTA", "Lazio": "İTA", "Como 1907": "İTA", "Como": "İTA",
  "Ajax": "HOL", "PSV": "HOL", "PSV Eindhoven": "HOL", "Feyenoord": "HOL", "Twente": "HOL", "AZ Alkmaar": "HOL",
  "Sporting CP": "POR", "Benfica": "POR", "Porto": "POR", "FC Porto": "POR", "Braga": "POR",
  "Celtic": "İSK", "Rangers": "İSK",
  "Club Brugge": "BEL", "Club Brugge KV": "BEL", "Union SG": "BEL", "Anderlecht": "BEL",
  "Red Bull Salzburg": "AVU", "Salzburg": "AVU", "Sturm Graz": "AVU", "Lask Linz": "AVU", "LASK": "AVU",
  "Sparta Prag": "ÇEK", "Slavia Prag": "ÇEK", "Viktoria Plzen": "ÇEK",
  "Dinamo Zagreb": "HIR", "Kızılyıldız": "SIR", "Crvena Zvezda": "SIR", "Young Boys": "İSV", "Lugano": "İSV",
  "Bodø/Glimt": "NOR", "Molde": "NOR", "Viking": "NOR", "Malmö FF": "İSVE", "FC Copenhagen": "DAN", "Midtjylland": "DAN",
  "Shakhtar Donetsk": "UKR", "Dinamo Kiev": "UKR", "Qarabag": "AZE", "Karabağ": "AZE", "Slovan Bratislava": "SVK", "Sabah FK": "AZE", "Sabah": "AZE", "AEK Athens": "YUN",
  "Flamengo": "BRA", "Palmeiras": "BRA", "Fluminense": "BRA", "Botafogo": "BRA", "Sao Paulo": "BRA", "Corinthians": "BRA", "Atletico-MG": "BRA", "Gremio": "BRA", "Cruzeiro": "BRA", "Santos": "BRA", "Vasco DA Gama": "BRA",
  "River Plate": "ARG", "Boca Juniors": "ARG", "San Lorenzo": "ARG", "Estudiantes": "ARG", "Estudiantes L.P.": "ARG", "Talleres": "ARG", "Platense": "ARG",
  "LDU Quito": "EKV", "LDU de Quito": "EKV", "Independiente del Valle": "EKV", "Barcelona SC": "EKV", "Bolivar": "BOL", "The Strongest": "BOL", "Colo Colo": "ŞİL", "Club Nacional": "URU", "Penarol": "URU", "Cerro Porteno": "PAR", "Libertad": "PAR", "Alianza Lima": "PER", "Junior": "KOL", "Millonarios": "KOL", "Deportivo Táchira": "VEN",
  "Al-Hilal": "SUU", "Al-Nassr": "SUU", "Al-Ittihad": "SUU", "Al-Ahli": "SUU", "Al-Ain": "BAE", "Al-Sadd": "KAT", "Yokohama F. Marinos": "JAP", "Vissel Kobe": "JAP", "Kawasaki Frontale": "JAP", "Ulsan HD": "G.KOR", "Pohang Steelers": "G.KOR", "Gwangju": "G.KOR", "Shanghai Port": "ÇİN", "Shandong Taishan": "ÇİN",
  "Al Ahly": "MIS", "Zamalek": "MIS", "Pyramids": "MIS", "Esperance Tunis": "TUN", "Wydad AC": "FAS", "Raja CA": "FAS", "RSB Berkane": "FAS", "Mamelodi Sundowns": "G.AFR", "TP Mazembe": "KON", "Simba": "TAN", "Young Africans": "TAN"
};

const TEAM_CANONICAL_NAMES: Record<string, string> = {
  "Man City": "Manchester City", "Manchester City FC": "Manchester City",
  "Man United": "Manchester United", "Manchester United FC": "Manchester United", "Man. United": "Manchester United",
  "Borussia Dortmund": "Borussia Dortmund", "Dortmund": "Borussia Dortmund", "BVB": "Borussia Dortmund",
  "Bayern Munich": "Bayern Munich", "Bayern München": "Bayern Munich", "FC Bayern München": "Bayern Munich", "Bayern": "Bayern Munich",
  "Real Madrid CF": "Real Madrid",
  "FC Barcelona": "Barcelona", "Barça": "Barcelona",
  "Atletico Madrid": "Atlético Madrid", "Atleti": "Atlético Madrid", "Club Atlético de Madrid": "Atlético Madrid",
  "Real Betis Balompié": "Real Betis", "Betis": "Real Betis",
  "Villarreal CF": "Villarreal",
  "Aston Villa FC": "Aston Villa",
  "Arsenal FC": "Arsenal",
  "Liverpool FC": "Liverpool",
  "Chelsea FC": "Chelsea",
  "Tottenham Hotspur": "Tottenham", "Tottenham Hotspur FC": "Tottenham",
  "Inter Milan": "Inter", "FC Internazionale Milano": "Inter",
  "Milan": "AC Milan",
  "Juventus FC": "Juventus",
  "SSC Napoli": "Napoli",
  "AS Roma": "Roma",
  "PSG": "Paris Saint-Germain", "Paris Saint Germain": "Paris Saint-Germain", "Paris Saint-Germain FC": "Paris Saint-Germain",
  "LOSC Lille": "Lille",
  "Olympique Lyonnais": "Lyon",
  "AS Monaco": "Monaco", "AS Monaco FC": "Monaco",
  "Stade Brestois 29": "Brest",
  "RC Lens": "Lens",
  "AFC Ajax": "Ajax",
  "PSV Eindhoven": "PSV",
  "Feyenoord Rotterdam": "Feyenoord",
  "Sporting": "Sporting CP", "Sporting Clube de Portugal": "Sporting CP",
  "SL Benfica": "Benfica",
  "Porto": "FC Porto",
  "Club Brugge KV": "Club Brugge",
  "Royale Union Saint-Gilloise": "Union SG",
  "Celtic FC": "Celtic",
  "Rangers FC": "Rangers",
  "Red Bull Salzburg": "Salzburg", "FC Red Bull Salzburg": "Salzburg",
  "SK Sturm Graz": "Sturm Graz",
  "Lask Linz": "LASK", "LASK Linz": "LASK",
  "GNK Dinamo Zagreb": "Dinamo Zagreb",
  "Red Star Belgrade": "Kızılyıldız", "FK Crvena Zvezda": "Kızılyıldız",
  "BSC Young Boys": "Young Boys",
  "AC Sparta Praha": "Sparta Prag", "Sparta Praha": "Sparta Prag",
  "SK Slavia Praha": "Slavia Prag", "Slavia Praha": "Slavia Prag", "Slavia Prague": "Slavia Prag",
  "FC Viktoria Plzeň": "Viktoria Plzen",
  "Bodo/Glimt": "Bodø/Glimt", "FK Bodø/Glimt": "Bodø/Glimt",
  "Viking FK": "Viking",
  "FC Shakhtar Donetsk": "Shakhtar Donetsk", "Shaktar": "Shakhtar Donetsk",
  "ŠK Slovan Bratislava": "Slovan Bratislava", "Sl. Bratislava": "Slovan Bratislava",
  "AEK Athens FC": "AEK Athens", "PAE AEK": "AEK Athens",
  "Galatasaray SK": "Galatasaray",
  "Fenerbahce SK": "Fenerbahçe",
  "Stuttgart": "VfB Stuttgart",
  "RasenBallsport Leipzig": "RB Leipzig",
  "Sabah": "Sabah FK", "Sabah FA": "Sabah FK",
  "Como": "Como 1907",
  "Estudiantes LP": "Estudiantes L.P.",
  "LDU Quito": "LDU de Quito"
};

export function normalizeCupMatTeam(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return TEAM_CANONICAL_NAMES[trimmed] || trimmed;
}

export function normalizeCupMatRound(round: string): string {
  if (!round) return "Normal Sezon";
  const r = round.trim();

  // League Stage - 1 -> 1. Hafta
  const leagueStageMatch = r.match(/League\s+Stage\s*-\s*(\d+)/i);
  if (leagueStageMatch) return `${leagueStageMatch[1]}. Hafta`;

  // Regular Season - 1 -> 1. Hafta
  const regSeasonMatch = r.match(/Regular\s+Season\s*-\s*(\d+)/i);
  if (regSeasonMatch) return `${regSeasonMatch[1]}. Hafta`;

  // Group Stage - 1 -> 1. Hafta
  const groupStageMatch = r.match(/Group\s+Stage\s*-\s*(\d+)/i);
  if (groupStageMatch) return `${groupStageMatch[1]}. Hafta`;

  // Matchday 1 -> 1. Hafta
  const matchdayMatch = r.match(/Matchday\s*(\d+)/i) || r.match(/(\d+)\.\s*Matchday/i);
  if (matchdayMatch) return `${matchdayMatch[1]}. Hafta`;

  // Lig Aşaması - 1. Hafta -> 1. Hafta
  const ligAsamasiMatch = r.match(/Lig\s+Aşaması\s*-\s*(\d+)\.\s*Hafta/i);
  if (ligAsamasiMatch) return `${ligAsamasiMatch[1]}. Hafta`;

  // Knockout stages
  if (/round of 16|last 16|8th final/i.test(r)) return "Son 16";
  if (/quarter-final/i.test(r)) return "Çeyrek Final";
  if (/semi-final/i.test(r)) return "Yarı Final";
  if (/^final$/i.test(r)) return "Final";
  if (/play-off|playoff/i.test(r)) return "Play-off";

  return r;
}

export function getCleanCountryCode(teamName: string, fallback?: string): string {
  if (fallback && fallback !== "TBD" && fallback !== "UNK" && fallback.length === 3) return fallback;
  for (const [key, code] of Object.entries(TEAM_COUNTRY_CODES)) {
    if (teamName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(teamName.toLowerCase())) {
      return code;
    }
  }
  return fallback || "";
}

/**
 * Football-Data.org üzerinden tüm sezon fikstürünü ve maç sonuçlarını çeker
 */
export async function syncFootballDataCompetitions() {
  const logs: string[] = [];
  let inserted = 0;
  let updated = 0;

  if (!FOOTBALL_DATA_TOKEN) {
    logs.push("[Football-Data] Token missing");
    return { success: false, inserted, updated, logs };
  }

  const comps = [
    { code: "CL", targetApiId: 2, region: "europe", defaultName: "UEFA Champions League" },
    { code: "CLI", targetApiId: 13, region: "america", defaultName: "Copa Libertadores" },
  ];

  try {
    const { data: allTournaments } = await supabaseAdmin.from("cupmat_tournaments").select("id, api_id");
    const tournamentMap = new Map<number, string>();
    if (allTournaments) {
      allTournaments.forEach(t => tournamentMap.set(t.api_id, t.id));
    }

    for (const comp of comps) {
      logs.push(`[Football-Data] Fetching full schedule for ${comp.code}...`);
      const res = await fetch(`https://api.football-data.org/v4/competitions/${comp.code}/matches`, {
        headers: { "X-Auth-Token": FOOTBALL_DATA_TOKEN },
      });

      if (!res.ok) {
        logs.push(`[Football-Data] Error fetching ${comp.code}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const matches = data.matches || [];
      logs.push(`[Football-Data] Found ${matches.length} matches for ${comp.code}`);

      let tournamentId = tournamentMap.get(comp.targetApiId);
      if (!tournamentId) {
        const { data: newT } = await supabaseAdmin.from("cupmat_tournaments").insert({
          api_id: comp.targetApiId,
          name: comp.defaultName,
          type: "Cup",
          region: comp.region
        }).select("id").single();
        if (newT) {
          tournamentId = newT.id;
          tournamentMap.set(comp.targetApiId, tournamentId);
        }
      }

      const { data: dbMatches } = await supabaseAdmin
        .from("cupmat_matches")
        .select("id, api_id, home_team_name, away_team_name, date, status, home_score, away_score")
        .eq("tournament_id", tournamentId);

      for (const m of matches) {
        if (!m.homeTeam?.name || !m.awayTeam?.name) continue;

        const rawHome = m.homeTeam.shortName || m.homeTeam.name;
        const rawAway = m.awayTeam.shortName || m.awayTeam.name;
        const homeName = normalizeCupMatTeam(rawHome);
        const awayName = normalizeCupMatTeam(rawAway);

        let status = "NS";
        if (m.status === "FINISHED") status = "FT";
        else if (m.status === "IN_PLAY" || m.status === "PAUSED") status = "LIVE";
        else if (m.status === "POSTPONED") status = "PST";
        else if (m.status === "SUSPENDED" || m.status === "CANCELLED") status = "CANC";

        let rawRound = m.matchday ? `${m.matchday}. Hafta` : (m.stage || "Normal Sezon");
        if (m.stage === "FINAL") rawRound = "Final";
        else if (m.stage === "SEMI_FINALS") rawRound = "Yarı Final";
        else if (m.stage === "QUARTER_FINALS") rawRound = "Çeyrek Final";
        else if (m.stage === "ROUND_OF_16" || m.stage === "LAST_16") rawRound = "Son 16";
        else if (m.stage === "PLAYOFFS" || m.stage === "PLAYOFF_ROUND") rawRound = "Play-off";

        const roundName = normalizeCupMatRound(rawRound);

        const homeWinner = m.score?.winner === "HOME_TEAM";
        const awayWinner = m.score?.winner === "AWAY_TEAM";
        const homeScore = m.score?.fullTime?.home !== undefined ? m.score.fullTime.home : null;
        const awayScore = m.score?.fullTime?.away !== undefined ? m.score.fullTime.away : null;

        const homePen = m.score?.penalties?.home ?? null;
        const awayPen = m.score?.penalties?.away ?? null;

        const matchRecord = {
          tournament_id: tournamentId,
          season: m.season?.startDate ? parseInt(m.season.startDate.split("-")[0]) : 2026,
          round: roundName,
          date: m.utcDate,
          status: status,
          home_team_id: m.homeTeam.id,
          home_team_name: homeName,
          home_team_country_code: getCleanCountryCode(homeName, m.homeTeam.tla),
          home_team_logo: m.homeTeam.crest,
          home_score: homeScore,
          home_penalty_score: homePen,
          home_is_winner: homeWinner,
          away_team_id: m.awayTeam.id,
          away_team_name: awayName,
          away_team_country_code: getCleanCountryCode(awayName, m.awayTeam.tla),
          away_team_logo: m.awayTeam.crest,
          away_score: awayScore,
          away_penalty_score: awayPen,
          away_is_winner: awayWinner,
          home_score_90: homeScore,
          away_score_90: awayScore,
          updated_at: new Date().toISOString()
        };

        const matchDateStr = m.utcDate.split("T")[0];
        const existing = dbMatches?.find((dbM: any) => {
          if (dbM.api_id === m.id) return true;
          const dbHome = normalizeCupMatTeam(dbM.home_team_name || "").toLowerCase();
          const dbAway = normalizeCupMatTeam(dbM.away_team_name || "").toLowerCase();
          const hNorm = homeName.toLowerCase();
          const aNorm = awayName.toLowerCase();
          const sameHome = dbHome === hNorm || dbHome.includes(hNorm) || hNorm.includes(dbHome);
          const sameAway = dbAway === aNorm || dbAway.includes(aNorm) || aNorm.includes(dbAway);
          const sameDate = dbM.date?.startsWith(matchDateStr);
          return sameHome && sameAway && sameDate;
        });

        if (existing) {
          // If existing match is already FT with score, keep score if incoming has no score
          const finalRecord = {
            ...matchRecord,
            api_id: existing.api_id || m.id,
            home_score: homeScore !== null ? homeScore : existing.home_score,
            away_score: awayScore !== null ? awayScore : existing.away_score,
            status: status !== "NS" ? status : existing.status
          };
          const { error: uErr } = await supabaseAdmin
            .from("cupmat_matches")
            .update(finalRecord)
            .eq("id", existing.id);
          if (!uErr) updated++;
        } else {
          const { error: iErr } = await supabaseAdmin
            .from("cupmat_matches")
            .insert({ ...matchRecord, api_id: m.id });
          if (!iErr) inserted++;
        }
      }
    }

    logs.push(`[Football-Data] Complete. Inserted: ${inserted}, Updated: ${updated}`);
    return { success: true, inserted, updated, logs };
  } catch (err: any) {
    logs.push(`[Football-Data] Exception: ${err.message}`);
    return { success: false, inserted, updated, logs };
  }
}

/**
 * API-Football üzerinden günlük maç skorlarını ve canlı verileri çeker (Dün, Bugün, Yarın)
 */
export async function syncApiFootballDays(dates?: string[]) {
  const logs: string[] = [];
  let inserted = 0;
  let updated = 0;

  if (!API_FOOTBALL_KEY) {
    logs.push("[API-Football] Key missing");
    return { success: false, inserted, updated, logs };
  }

  let targetDates = dates;
  if (!targetDates || targetDates.length === 0) {
    const todayObj = new Date();
    const yestObj = new Date();
    yestObj.setDate(todayObj.getDate() - 1);
    const tomObj = new Date();
    tomObj.setDate(todayObj.getDate() + 1);

    targetDates = [
      yestObj.toISOString().split("T")[0],
      todayObj.toISOString().split("T")[0],
      tomObj.toISOString().split("T")[0]
    ];
  }

  try {
    const { data: allTournaments } = await supabaseAdmin.from("cupmat_tournaments").select("id, api_id");
    const tournamentMap = new Map<number, string>();
    if (allTournaments) {
      allTournaments.forEach(t => tournamentMap.set(t.api_id, t.id));
    }

    for (const dateStr of targetDates) {
      logs.push(`[API-Football] Fetching date: ${dateStr}`);
      const response = await fetch(`${API_URL}/fixtures?date=${dateStr}`, {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": API_FOOTBALL_KEY,
        },
      });

      if (!response.ok) {
        logs.push(`[API-Football] HTTP ${response.status} on ${dateStr}`);
        continue;
      }

      const data = await response.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        logs.push(`[API-Football] Error on ${dateStr}: ${JSON.stringify(data.errors)}`);
        continue;
      }

      const allFixtures = data.response || [];
      const targetFixtures = allFixtures.filter((f: any) => TARGET_LEAGUES.includes(f.league.id));
      logs.push(`[API-Football] Found ${targetFixtures.length} target matches for ${dateStr}`);

      if (targetFixtures.length === 0) continue;

      for (const item of targetFixtures) {
        const fixture = item.fixture;
        const league = item.league;
        const teams = item.teams;
        const goals = item.goals;
        const score = item.score;

        let tournamentId = tournamentMap.get(league.id);
        if (!tournamentId) {
          const region = LEAGUE_REGIONS[league.id] || "world";
          const { data: newT } = await supabaseAdmin.from("cupmat_tournaments").insert({
            api_id: league.id,
            name: league.name,
            type: league.type || "Cup",
            region: region,
            logo_url: league.logo
          }).select("id").single();
          if (newT) {
            tournamentId = newT.id;
            tournamentMap.set(league.id, tournamentId);
          }
        }

        const rawHome = teams.home.name || "";
        const rawAway = teams.away.name || "";
        const homeName = normalizeCupMatTeam(rawHome);
        const awayName = normalizeCupMatTeam(rawAway);
        const roundName = normalizeCupMatRound(league.round || "Normal Sezon");

        const matchData = {
          api_id: fixture.id,
          tournament_id: tournamentId,
          season: league.season,
          round: roundName,
          date: fixture.date,
          status: fixture.status.short,
          venue_name: fixture.venue?.name,
          home_team_id: teams.home.id,
          home_team_name: homeName,
          home_team_country_code: getCleanCountryCode(homeName),
          home_team_logo: teams.home.logo,
          home_score: goals.home,
          home_penalty_score: score.penalty?.home ?? null,
          home_is_winner: teams.home.winner,
          away_team_id: teams.away.id,
          away_team_name: awayName,
          away_team_country_code: getCleanCountryCode(awayName),
          away_team_logo: teams.away.logo,
          away_score: goals.away,
          away_penalty_score: score.penalty?.away ?? null,
          away_is_winner: teams.away.winner,
          home_score_90: score.fulltime?.home ?? goals.home,
          away_score_90: score.fulltime?.away ?? goals.away,
          updated_at: new Date().toISOString()
        };

        // Smart lookup: first by api_id, then by tournament + date + teams
        const matchDayStr = fixture.date.split("T")[0];
        const { data: existingList } = await supabaseAdmin
          .from("cupmat_matches")
          .select("id, api_id, home_team_name, away_team_name, date, round")
          .eq("tournament_id", tournamentId)
          .gte("date", `${matchDayStr}T00:00:00Z`)
          .lte("date", `${matchDayStr}T23:59:59Z`);

        let existingMatch = existingList?.find((em: any) => em.api_id === fixture.id);
        if (!existingMatch && existingList) {
          existingMatch = existingList.find((em: any) => {
            const h1 = normalizeCupMatTeam(em.home_team_name).toLowerCase();
            const a1 = normalizeCupMatTeam(em.away_team_name).toLowerCase();
            const h2 = homeName.toLowerCase();
            const a2 = awayName.toLowerCase();
            return (h1 === h2 || h1.includes(h2) || h2.includes(h1)) &&
                   (a1 === a2 || a1.includes(a2) || a2.includes(a1));
          });
        }

        if (existingMatch) {
          const { error: uErr } = await supabaseAdmin
            .from("cupmat_matches")
            .update(matchData)
            .eq("id", existingMatch.id);
          if (!uErr) updated++;
        } else {
          const { error: iErr } = await supabaseAdmin
            .from("cupmat_matches")
            .insert(matchData);
          if (!iErr) inserted++;
        }
      }
    }

    logs.push(`[API-Football] Complete. Inserted: ${inserted}, Updated: ${updated}`);
    return { success: true, inserted, updated, logs };
  } catch (err: any) {
    logs.push(`[API-Football] Exception: ${err.message}`);
    return { success: false, inserted, updated, logs };
  }
}

/**
 * Backward compatibility wrapper and unified entry point
 */
export async function fetchAndStoreDailyMatches(dateStr?: string) {
  return syncCupMatAll(dateStr);
}

/**
 * Master Sync: Runs both Football-Data (season schedule) & API-Football (daily scores)
 */
export async function syncCupMatAll(specificDate?: string) {
  const allLogs: string[] = [];
  
  const apiRes = await syncApiFootballDays(specificDate ? [specificDate] : undefined);
  allLogs.push(...apiRes.logs);

  const fdRes = await syncFootballDataCompetitions();
  allLogs.push(...fdRes.logs);

  const totalInserted = (apiRes.inserted || 0) + (fdRes.inserted || 0);
  const totalUpdated = (apiRes.updated || 0) + (fdRes.updated || 0);

  return {
    success: apiRes.success || fdRes.success,
    inserted: totalInserted,
    updated: totalUpdated,
    logs: allLogs
  };
}


