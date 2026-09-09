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
  "PSG": "PSG", "Paris Saint Germain": "PSG", "Paris Saint-Germain": "PSG", "Paris Saint-Germain FC": "PSG",
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
  "Union SG": "Union SG", "Royale Union Saint-Gilloise": "Union SG",
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
  "Viktoria Plzen": "Viktoria Plzen", "FC Viktoria Plzeň": "Viktoria Plzen",
  "Bodø/Glimt": "Bodø/Glimt", "Bodo/Glimt": "Bodø/Glimt", "FK Bodø/Glimt": "Bodø/Glimt",
  "Viking": "Viking", "Viking FK": "Viking",
  "Shakhtar Donetsk": "Shakhtar Donetsk", "FC Shakhtar Donetsk": "Shakhtar Donetsk", "Shaktar": "Shakhtar Donetsk",
  "Slovan Bratislava": "Slovan Bratislava", "ŠK Slovan Bratislava": "Slovan Bratislava", "Sl. Bratislava": "Slovan Bratislava",
  "AEK Athens": "AEK Athens", "AEK Athens FC": "AEK Athens", "PAE AEK": "AEK Athens",
  "Galatasaray": "Galatasaray", "Galatasaray SK": "Galatasaray",
  "Fenerbahçe": "Fenerbahçe", "Fenerbahce SK": "Fenerbahçe",
  "Stuttgart": "Stuttgart", "VfB Stuttgart": "Stuttgart",
  "RB Leipzig": "RB Leipzig", "RasenBallsport Leipzig": "RB Leipzig",
  "Sabah": "Sabah", "Sabah FA": "Sabah", "Sabah FK": "Sabah",
  "Como": "Como", "Como 1907": "Como"
};

function normalizeTeam(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return TEAM_ALIASES[trimmed] || trimmed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = parseInt(searchParams.get("tournament") || "2", 10);

    // 1. Get tournament ID from Supabase
    const { data: tournaments } = await supabaseAdmin
      .from("cupmat_tournaments")
      .select("id, api_id, name")
      .eq("api_id", tournamentId);

    const tournament = tournaments?.[0];

    if (!tournament) {
      const fallbackMap = standingsDataFallback as Record<string, any>;
      const fallbackStandings = fallbackMap[tournamentId.toString()] || [];
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
      const fallbackStandings = fallbackMap[tournamentId.toString()] || [];
      return NextResponse.json({
        success: true,
        tournamentId,
        standings: fallbackStandings,
        isLive: false,
      });
    }

    // 3. For 36-team UEFA leagues (CL:2, EL:3, ECL:848), filter to League Stage matches
    const isLeagueStageTourney = [2, 3, 848].includes(tournamentId);
    let targetMatches = matches;

    if (isLeagueStageTourney) {
      const isLeagueRound = (r: string) => /hafta|matchday|lig aşaması|league stage/i.test(r || "");
      const lm = matches.filter(m => isLeagueRound(m.round));
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

    // 7. Sort standings by points, GD, GF, Wins, Name
    const standings = Object.values(teamsMap)
      .map(t => {
        t.gd = t.gf - t.ga;
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

