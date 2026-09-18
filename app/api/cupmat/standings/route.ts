import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import standingsDataFallback from "@/data/standings-data.json";

export const dynamic = "force-dynamic";

const TEAM_ALIASES: Record<string, string> = {
  "Man City": "Man City", "Manchester City": "Man City", "Manchester City FC": "Man City",
  "Man United": "Man United", "Manchester United": "Man United", "Manchester United FC": "Man United",
  "Borussia Dortmund": "Borussia Dortmund", "Dortmund": "Borussia Dortmund", "BVB": "Borussia Dortmund",
  "Bayern Munich": "Bayern Munich", "Bayern München": "Bayern Munich", "FC Bayern München": "Bayern Munich", "Bayern": "Bayern Munich",
  "Real Madrid": "Real Madrid", "Real Madrid CF": "Real Madrid",
  "Barcelona": "Barcelona", "FC Barcelona": "Barcelona", "Barça": "Barcelona",
  "Atlético Madrid": "Atlético Madrid", "Atletico Madrid": "Atlético Madrid", "Atleti": "Atlético Madrid", "Club Atlético de Madrid": "Atlético Madrid",
  "Real Betis": "Real Betis", "Real Betis Balompié": "Real Betis", "Betis": "Real Betis",
  "Villarreal": "Villarreal", "Villarreal CF": "Villarreal",
  "Aston Villa": "Aston Villa", "Aston Villa FC": "Aston Villa",
  "Arsenal": "Arsenal", "Arsenal FC": "Arsenal",
  "Liverpool": "Liverpool", "Liverpool FC": "Liverpool",
  "Chelsea": "Chelsea", "Chelsea FC": "Chelsea",
  "Tottenham": "Tottenham", "Tottenham Hotspur": "Tottenham", "Tottenham Hotspur FC": "Tottenham",
  "Inter": "Inter", "Inter Milan": "Inter", "FC Internazionale Milano": "Inter",
  "AC Milan": "AC Milan", "Milan": "AC Milan",
  "Juventus": "Juventus", "Juventus FC": "Juventus",
  "Napoli": "Napoli", "SSC Napoli": "Napoli",
  "Roma": "Roma", "AS Roma": "Roma",
  "PSG": "PSG", "Paris Saint Germain": "PSG", "Paris Saint-Germain": "PSG", "Paris Saint-Germain FC": "PSG", "Paris": "PSG",
  "Lille": "Lille", "LOSC Lille": "Lille",
  "Lyon": "Lyon", "Olympique Lyonnais": "Lyon",
  "Monaco": "Monaco", "AS Monaco": "Monaco", "AS Monaco FC": "Monaco",
  "Brest": "Brest", "Stade Brestois 29": "Brest",
  "Lens": "Lens", "RC Lens": "Lens",
  "Ajax": "Ajax", "AFC Ajax": "Ajax",
  "PSV": "PSV", "PSV Eindhoven": "PSV",
  "Feyenoord": "Feyenoord", "Feyenoord Rotterdam": "Feyenoord",
  "Sporting CP": "Sporting CP", "Sporting": "Sporting CP", "Sporting Clube de Portugal": "Sporting CP",
  "Benfica": "Benfica", "SL Benfica": "Benfica",
  "Porto": "Porto", "FC Porto": "Porto",
  "Club Brugge": "Club Brugge", "Club Brugge KV": "Club Brugge",
  "Union SG": "Union SG", "Royale Union Saint-Gilloise": "Union SG", "Union St. Gilloise": "Union SG",
  "Celtic": "Celtic", "Celtic FC": "Celtic",
  "Rangers": "Rangers", "Rangers FC": "Rangers",
  "Salzburg": "Salzburg", "Red Bull Salzburg": "Salzburg", "FC Red Bull Salzburg": "Salzburg",
  "Sturm Graz": "Sturm Graz", "SK Sturm Graz": "Sturm Graz",
  "LASK": "LASK", "Lask Linz": "LASK",
  "Dinamo Zagreb": "Dinamo Zagreb", "GNK Dinamo Zagreb": "Dinamo Zagreb",
  "Kızılyıldız": "Kızılyıldız", "Red Star Belgrade": "Kızılyıldız", "FK Crvena Zvezda": "Kızılyıldız",
  "Young Boys": "Young Boys", "BSC Young Boys": "Young Boys",
  "Sparta Prag": "Sparta Prag", "AC Sparta Praha": "Sparta Prag", "Sparta Praha": "Sparta Prag",
  "Slavia Prag": "Slavia Prag", "SK Slavia Praha": "Slavia Prag", "Slavia Praha": "Slavia Prag",
  "Viktoria Plzen": "Viktoria Plzen", "FC Viktoria Plzeň": "Viktoria Plzen", "Plzen": "Viktoria Plzen",
  "Bodø/Glimt": "Bodø/Glimt", "Bodo/Glimt": "Bodø/Glimt", "FK Bodø/Glimt": "Bodø/Glimt",
  "Viking": "Viking", "Viking FK": "Viking",
  "Shakhtar Donetsk": "Shakhtar Donetsk", "FC Shakhtar Donetsk": "Shakhtar Donetsk", "Shaktar": "Shakhtar Donetsk",
  "Slovan Bratislava": "Slovan Bratislava", "ŠK Slovan Bratislava": "Slovan Bratislava", "Sl. Bratislava": "Slovan Bratislava",
  "AEK Athens": "AEK Athens", "AEK Athens FC": "AEK Athens", "PAE AEK": "AEK Athens",
  "Galatasaray": "Galatasaray", "Galatasaray SK": "Galatasaray",
  "Fenerbahçe": "Fenerbahçe", "Fenerbahce SK": "Fenerbahçe",
  "Beşiktaş": "Beşiktaş", "Besiktas JK": "Beşiktaş", "Besiktas": "Beşiktaş",
  "Başakşehir": "Başakşehir", "Basaksehir": "Başakşehir", "Istanbul Basaksehir": "Başakşehir",
  "Stuttgart": "Stuttgart", "VfB Stuttgart": "Stuttgart",
  "RB Leipzig": "RB Leipzig", "RasenBallsport Leipzig": "RB Leipzig",
  "Sabah": "Sabah", "Sabah FA": "Sabah", "Sabah FK": "Sabah",
  "Como": "Como", "Como 1907": "Como",
  "Bayer Leverkusen": "Bayer Leverkusen", "Leverkusen": "Bayer Leverkusen",
  "Athletic Club": "Athletic Bilbao", "Athletic Bilbao": "Athletic Bilbao",
  "Eintracht Frankfurt": "Eintracht Frankfurt", "Frankfurt": "Eintracht Frankfurt",
  "Olympiakos Piraeus": "Olympiakos", "Olympiakos": "Olympiakos", "Olympiacos": "Olympiakos",
  "Vitória SC": "Vitoria Guimaraes", "Vitoria SC": "Vitoria Guimaraes",
  "Legia Warszawa": "Legia Varşova", "Legia Warsaw": "Legia Varşova",
  "Djurgardens IF": "Djurgarden", "Djurgårdens IF": "Djurgarden",
  "1. FC Heidenheim": "Heidenheim", "Heidenheim": "Heidenheim",
  "1899 Hoffenheim": "Hoffenheim", "TSG Hoffenheim": "Hoffenheim"
};

const TOURNAMENT_CONTINENTS: Record<number, string> = {
  2: "europe",    // Champions League
  3: "europe",    // Europa League
  848: "europe",  // Conference League
  5: "europe",    // Nations League
  4: "europe",    // EURO
  13: "america",  // Copa Libertadores
  14: "america",  // Copa Sudamericana
  11: "america",  // CONMEBOL Sudamericana
  16: "america",  // CONCACAF Champions
  22: "america",  // CONCACAF Nations
  34: "america",  // CONMEBOL Qualifiers
  73: "america",  // Copa Do Brasil
  9: "america",   // Copa America
  17: "asia",     // AFC Champions League Elite
  18: "asia",     // AFC Champions League Two
  7: "asia",      // AFC Asian Cup
  12: "africa",   // CAF Champions League
  20: "africa",   // CAF Confederation
  32: "africa",   // AFCON Qualifiers
  6: "africa",    // AFCON
  1: "world",     // FIFA World Cup
  15: "world",    // FIFA Club World Cup
  68: "europe",   // National 2
};

function normalizeTeam(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return TEAM_ALIASES[trimmed] || trimmed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "";
    const continentFilter = (searchParams.get("continent") || "all").toLowerCase();
    const tournamentParam = searchParams.get("tournament");
    const isGlobalView = view === "global_ppg" || tournamentParam === "all" || tournamentParam === "0";

    // =========================================================================
    // 🌍 1. GLOBAL / CONTINENTAL CLUB MBP (x1000) LEADERBOARD
    // =========================================================================
    if (isGlobalView) {
      const { data: tourneys } = await supabaseAdmin.from("cupmat_tournaments").select("*");
      const tourneyMap: Record<string, any> = {};
      (tourneys || []).forEach(t => {
        tourneyMap[t.id] = {
          ...t,
          continent: TOURNAMENT_CONTINENTS[t.api_id] || "europe"
        };
      });

      const { data: matches, error: mErr } = await supabaseAdmin
        .from("cupmat_matches")
        .select("tournament_id, home_team_name, away_team_name, home_score, away_score, status, date, home_team_logo, away_team_logo, home_team_country_code, away_team_country_code, round")
        .limit(10000);

      if (mErr || !matches || matches.length === 0) {
        return NextResponse.json({
          success: true,
          view: "global_ppg",
          standings: [],
          message: "Henüz maç verisi bulunamadı."
        });
      }

      // Deduplicate finished matches
      const finishedMatches = matches.filter(m =>
        ["FT", "AET", "PEN"].includes(m.status) &&
        m.home_score !== null &&
        m.away_score !== null
      );

      const processedMatchKeys = new Set<string>();
      const uniqueFinishedMatches = [];

      for (const m of finishedMatches) {
        const h = normalizeTeam(m.home_team_name);
        const a = normalizeTeam(m.away_team_name);
        const d = m.date ? m.date.split("T")[0] : "";
        const key = `${h}_vs_${a}_${d}`;
        if (!processedMatchKeys.has(key)) {
          processedMatchKeys.add(key);
          uniqueFinishedMatches.push(m);
        }
      }

      const teamsMap: Record<string, any> = {};

      uniqueFinishedMatches.forEach(m => {
        const tInfo = tourneyMap[m.tournament_id] || { name: "Uluslararası Kupa", continent: "europe", api_id: 0 };
        const homeName = normalizeTeam(m.home_team_name);
        const awayName = normalizeTeam(m.away_team_name);

        if (!homeName || !awayName) return;

        [
          { name: homeName, logo: m.home_team_logo, country: m.home_team_country_code },
          { name: awayName, logo: m.away_team_logo, country: m.away_team_country_code }
        ].forEach(item => {
          if (!teamsMap[item.name]) {
            teamsMap[item.name] = {
              team: item.name,
              logo: item.logo || null,
              country: item.country || "",
              continent: tInfo.continent || "europe",
              tournaments: new Set<string>(),
              played: 0,
              win: 0,
              draw: 0,
              lose: 0,
              gf: 0,
              ga: 0,
              gd: 0,
              pts: 0,
              ppg: 0,
              ppg1000: 0,
            };
          }
          if (item.logo && !teamsMap[item.name].logo) teamsMap[item.name].logo = item.logo;
          if (item.country && !teamsMap[item.name].country) teamsMap[item.name].country = item.country;
          if (tInfo.name) teamsMap[item.name].tournaments.add(tInfo.name);
        });

        const home = teamsMap[homeName];
        const away = teamsMap[awayName];
        if (!home || !away) return;

        const hs = Number(m.home_score);
        const as = Number(m.away_score);

        home.played += 1;
        away.played += 1;
        home.gf += hs;
        home.ga += as;
        away.gf += as;
        away.ga += hs;

        if (hs > as) {
          home.win += 1;
          home.pts += 3;
          away.lose += 1;
        } else if (as > hs) {
          away.win += 1;
          away.pts += 3;
          home.lose += 1;
        } else {
          home.draw += 1;
          home.pts += 1;
          away.draw += 1;
          away.pts += 1;
        }
      });

      // Format & calculate MBP x1000
      let allTeams = Object.values(teamsMap)
        .filter(t => t.played > 0)
        .map(t => {
          t.gd = t.gf - t.ga;
          t.ppg = t.played > 0 ? Number((t.pts / t.played).toFixed(3)) : 0;
          t.ppg1000 = t.played > 0 ? Math.round((t.pts / t.played) * 1000) : 0;
          t.tournaments = Array.from(t.tournaments);
          return t;
        });

      // Filter by continent if specified
      if (continentFilter !== "all") {
        allTeams = allTeams.filter(t => t.continent === continentFilter);
      }

      // Sort by MBP (x1000) desc -> Pts desc -> GD desc -> GF desc -> Played desc
      allTeams.sort((a, b) => {
        if (b.ppg1000 !== a.ppg1000) return b.ppg1000 - a.ppg1000;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return b.played - a.played;
      });

      const rankedTeams = allTeams.map((t, idx) => ({
        rank: idx + 1,
        ...t
      }));

      return NextResponse.json({
        success: true,
        view: "global_ppg",
        continent: continentFilter,
        standings: rankedTeams,
        totalTeams: rankedTeams.length,
        totalMatchesPlayed: uniqueFinishedMatches.length,
        message: "Kıtalararası Uluslararası Kulüpler MBP (×1000) Sıralaması"
      });
    }

    // =========================================================================
    // 🏆 2. TOURNAMENT SPECIFIC LEAGUE / GROUP STAGE STANDINGS
    // =========================================================================
    const tournamentId = parseInt(tournamentParam || "2", 10);

    // 1. Get tournament ID from Supabase
    const { data: tournaments } = await supabaseAdmin
      .from("cupmat_tournaments")
      .select("id, api_id, name")
      .eq("api_id", tournamentId);

    const tournament = tournaments?.[0];

    if (!tournament) {
      const fallbackMap = standingsDataFallback as Record<string, any>;
      const fallbackStandings = (fallbackMap[tournamentId.toString()] || []).map((t: any, i: number) => ({
        ...t,
        rank: t.rank || i + 1,
        ppg: t.played > 0 ? Number((t.pts / t.played).toFixed(3)) : 0,
        ppg1000: t.played > 0 ? Math.round((t.pts / t.played) * 1000) : 0,
      }));
      return NextResponse.json({
        success: true,
        tournamentId,
        standings: fallbackStandings,
        isLive: false,
        message: "Statik Puan Tablosu"
      });
    }

    // 2. Fetch matches for this tournament
    const { data: matches, error: mErr } = await supabaseAdmin
      .from("cupmat_matches")
      .select("*")
      .eq("tournament_id", tournament.id);

    if (mErr || !matches || matches.length === 0) {
      const fallbackMap = standingsDataFallback as Record<string, any>;
      const fallbackStandings = (fallbackMap[tournamentId.toString()] || []).map((t: any, i: number) => ({
        ...t,
        rank: t.rank || i + 1,
        ppg: t.played > 0 ? Number((t.pts / t.played).toFixed(3)) : 0,
        ppg1000: t.played > 0 ? Math.round((t.pts / t.played) * 1000) : 0,
      }));
      return NextResponse.json({
        success: true,
        tournamentId,
        standings: fallbackStandings,
        isLive: false,
      });
    }

    // 3. For 36-team UEFA leagues (CL:2, EL:3, ECL:848), filter strictly to League Stage matches
    const isLeagueStageTourney = [2, 3, 848].includes(tournamentId);
    let targetMatches = matches;

    if (isLeagueStageTourney) {
      const maxWeeks = tournamentId === 848 ? 6 : 8;
      const hasLeagueStageMatches = matches.some(m => /^League Stage\s*-\s*\d+$/i.test((m.round || "").trim()));
      
      const isLeagueRound = (r: string) => {
        if (!r || r.startsWith("{")) return false;
        const leagueStageMatch = r.match(/^League Stage\s*-\s*(\d+)$/i);
        if (leagueStageMatch) {
          const week = parseInt(leagueStageMatch[1], 10);
          return week >= 1 && week <= maxWeeks;
        }
        const haftaMatch = r.match(/^(\d+)\.\s*Hafta$/i);
        if (haftaMatch) {
          const week = parseInt(haftaMatch[1], 10);
          return week >= 1 && week <= maxWeeks;
        }
        const mdMatch = r.match(/^Matchday\s*(\d+)$/i);
        if (mdMatch) {
          const week = parseInt(mdMatch[1], 10);
          return week >= 1 && week <= maxWeeks;
        }
        return false;
      };

      const lm = matches.filter(m => {
        if (hasLeagueStageMatches) {
          return /^League Stage\s*-\s*\d+$/i.test((m.round || "").trim());
        }
        return isLeagueRound(m.round);
      });

      if (lm.length > 0) {
        targetMatches = lm;
      }
    }

    // 4. Build team map
    const teamsMap: Record<string, any> = {};

    function ensureTeam(name: string, logo?: string, countryId?: string, teamId?: number, league?: string, group?: string) {
      const cleanName = normalizeTeam(name);
      if (!cleanName) return;
      if (!teamsMap[cleanName]) {
        teamsMap[cleanName] = {
          team: cleanName,
          teamId: teamId || null,
          logo: logo || null,
          country: countryId || "",
          league: league || "",
          group: group || "",
          played: 0,
          win: 0,
          draw: 0,
          lose: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          pts: 0,
          ppg: 0,
          ppg1000: 0,
          form: []
        };
      } else {
        if (logo && !teamsMap[cleanName].logo) teamsMap[cleanName].logo = logo;
        if (countryId && !teamsMap[cleanName].country) teamsMap[cleanName].country = countryId;
        if (league && !teamsMap[cleanName].league) teamsMap[cleanName].league = league;
        if (group && !teamsMap[cleanName].group) teamsMap[cleanName].group = group;
      }
    }

    // Register all teams that participate in these matches
    targetMatches.forEach(m => {
      let league = "";
      let group = "";
      if (tournamentId === 5) {
        const parsed = (m.round || "").match(/(Lig\s+[A-D])\s*-\s*(\d+\.\s*Grup)/i);
        if (parsed) {
          league = parsed[1].trim(); // "Lig A"
          group = parsed[2].trim();  // "1. Grup"
        }
      }
      ensureTeam(m.home_team_name, m.home_team_logo, m.home_team_country_code, m.home_team_id, league, group);
      ensureTeam(m.away_team_name, m.away_team_logo, m.away_team_country_code, m.away_team_id, league, group);
    });

    // 5. Deduplicate finished matches
    const finishedMatches = targetMatches.filter(m =>
      ["FT", "AET", "PEN"].includes(m.status) &&
      m.home_score !== null &&
      m.away_score !== null
    );

    const processedMatchKeys = new Set<string>();
    const uniqueFinishedMatches = [];

    for (const m of finishedMatches) {
      const h = normalizeTeam(m.home_team_name);
      const a = normalizeTeam(m.away_team_name);
      const d = m.date ? m.date.split("T")[0] : "";
      const key = `${h}_vs_${a}_${d}`;
      if (!processedMatchKeys.has(key)) {
        processedMatchKeys.add(key);
        uniqueFinishedMatches.push(m);
      }
    }

    // 6. Calculate statistics from played matches
    uniqueFinishedMatches.forEach(m => {
      const homeName = normalizeTeam(m.home_team_name);
      const awayName = normalizeTeam(m.away_team_name);
      const home = teamsMap[homeName];
      const away = teamsMap[awayName];
      if (!home || !away) return;

      const hs = Number(m.home_score);
      const as = Number(m.away_score);

      home.played += 1;
      away.played += 1;
      home.gf += hs;
      home.ga += as;
      away.gf += as;
      away.ga += hs;

      if (hs > as) {
        home.win += 1;
        home.pts += 3;
        home.form.push("W");
        away.lose += 1;
        away.form.push("L");
      } else if (as > hs) {
        away.win += 1;
        away.pts += 3;
        away.form.push("W");
        home.lose += 1;
        home.form.push("L");
      } else {
        home.draw += 1;
        home.pts += 1;
        home.form.push("D");
        away.draw += 1;
        away.pts += 1;
        away.form.push("D");
      }
    });

    // 7. Sort standings by points, GD, GF, Wins, Name & compute MBP x1000
    const standings = Object.values(teamsMap)
      .map(t => {
        t.gd = t.gf - t.ga;
        t.ppg = t.played > 0 ? Number((t.pts / t.played).toFixed(3)) : 0;
        t.ppg1000 = t.played > 0 ? Math.round((t.pts / t.played) * 1000) : 0;
        return t;
      })
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.win !== a.win) return b.win - a.win;
        return a.team.localeCompare(b.team);
      })
      .map((t, index) => ({
        rank: index + 1,
        ...t
      }));

    return NextResponse.json({
      success: true,
      tournamentId,
      standings,
      isLive: true,
      totalMatchesPlayed: uniqueFinishedMatches.length,
      message: "Oynanan maçlara göre hesaplanan canlı puan tablosu"
    });

  } catch (error: any) {
    console.error("Standings computation error:", error);
    const fallbackMap = standingsDataFallback as Record<string, any>;
    return NextResponse.json({
      success: false,
      standings: fallbackMap["2"] || [],
      error: error.message
    }, { status: 500 });
  }
}

