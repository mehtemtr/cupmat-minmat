import { supabaseAdmin } from "@/lib/supabase";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_URL = "https://v3.football.api-sports.io";

// We only want to track these continental/global leagues
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

const LEAGUE_REGIONS: Record<number, string> = {
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

// Basit 3 harfli ülke kısaltma haritası (Gerçekte API'den veya statik bir sözlükten beslenebilir)
function getTeamCountryCode(teamName: string): string {
  // Örnek statik çözümleme (Bu kısım ileride detaylı bir veritabanı veya dictionary ile değiştirilebilir)
  const dict: Record<string, string> = {
    "Beşiktaş": "TÜR", "Fenerbahçe": "TÜR", "Galatasaray": "TÜR", "Trabzonspor": "TÜR",
    "Real Madrid": "İSP", "Barcelona": "İSP", "Atlético Madrid": "İSP",
    "Man City": "İNG", "Arsenal": "İNG", "Liverpool": "İNG", "Chelsea": "İNG", "Brighton": "İNG",
    "Bayern Munich": "ALM", "Bayer Leverkusen": "ALM", "Borussia Dortmund": "ALM",
    "PSG": "FRA", "Lille": "FRA", "Lyon": "FRA",
    "Inter Milan": "İTA", "AC Milan": "İTA", "Juventus": "İTA", "Napoli": "İTA",
    "Ajax": "HOL", "PSV": "HOL",
    "Braga": "POR", "Benfica": "POR", "Porto": "POR",
    "Molde": "NOR", "Lugano": "İSV", "Kralove": "ÇEK"
  };
  return dict[teamName] || "";
}

export async function fetchAndStoreDailyMatches(dateStr?: string) {
  const logs: string[] = [];
  
  if (!API_FOOTBALL_KEY) {
    logs.push("[ERROR] API_FOOTBALL_KEY is missing in environment variables.");
    return { success: false, logs };
  }

  // If no date is provided, use today's date in YYYY-MM-DD format
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  logs.push(`[API-Football] Fetching all fixtures for date: ${targetDate}`);

  try {
    // 1. Fetch ALL matches for the day (costs only 1 API request!)
    const response = await fetch(`${API_URL}/fixtures?date=${targetDate}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": API_FOOTBALL_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      logs.push(`[API-Football] API Error: ${JSON.stringify(data.errors)}`);
      return { success: false, logs };
    }

    const allFixtures = data.response || [];
    logs.push(`[API-Football] Total fixtures found globally today: ${allFixtures.length}`);

    // 2. Filter only our target continental leagues
    const targetFixtures = allFixtures.filter((f: any) => TARGET_LEAGUES.includes(f.league.id));
    logs.push(`[API-Football] Target continental fixtures found: ${targetFixtures.length}`);

    if (targetFixtures.length === 0) {
      return { success: true, message: "No target continental matches today.", logs };
    }

    // 3. Process and Insert/Update in Supabase
    let inserted = 0;
    let updated = 0;

    // 3.0 Pre-fetch existing tournaments to avoid sequential DB lookups
    const { data: allTournaments } = await supabaseAdmin.from("cupmat_tournaments").select("id, api_id");
    const tournamentMap = new Map();
    if (allTournaments) {
      allTournaments.forEach(t => tournamentMap.set(t.api_id, t.id));
    }

    // 3.0 Pre-fetch existing matches to avoid sequential DB lookups
    const fixtureIds = targetFixtures.map((f: any) => f.fixture.id);
    const { data: existingMatches } = await supabaseAdmin
      .from("cupmat_matches")
      .select("id, api_id")
      .in("api_id", fixtureIds);
    const matchMap = new Map();
    if (existingMatches) {
      existingMatches.forEach(m => matchMap.set(m.api_id, m.id));
    }

    const promises = [];

    for (const item of targetFixtures) {
      const fixture = item.fixture;
      const league = item.league;
      const teams = item.teams;
      const goals = item.goals;
      const score = item.score;

      // 3.1 Ensure Tournament exists in our DB
      let tournamentId = tournamentMap.get(league.id);
      
      if (!tournamentId) {
        const region = LEAGUE_REGIONS[league.id] || 'world';
        const { data: newTournament, error: tError } = await supabaseAdmin
          .from("cupmat_tournaments")
          .insert({
            api_id: league.id,
            name: league.name,
            type: league.type,
            region: region,
            logo_url: league.logo
          })
          .select("id")
          .single();
          
        if (tError) {
          logs.push(`[ERROR] Failed to insert tournament ${league.name}: ${tError.message}`);
          continue;
        }
        if (newTournament) {
            tournamentId = newTournament.id;
            tournamentMap.set(league.id, tournamentId);
            logs.push(`[DB] Created new tournament: ${league.name}`);
        }
      }

      // 3.2 Determine Winner & Extract Extra Info
      const homeWinner = teams.home.winner;
      const awayWinner = teams.away.winner;
      
      const homePen = score.penalty?.home;
      const awayPen = score.penalty?.away;

      // Extract 90 Minute Score (Fulltime)
      const homeScore90 = score.fulltime?.home;
      const awayScore90 = score.fulltime?.away;
      
      // 3.3 Insert or Update Match
      const matchData = {
        api_id: fixture.id,
        tournament_id: tournamentId,
        season: league.season,
        round: league.round,
        date: fixture.date,
        status: fixture.status.short, // 'FT', 'NS', 'PEN' etc.
        venue_name: fixture.venue.name,
        
        home_team_id: teams.home.id,
        home_team_name: teams.home.name,
        home_team_country_code: getTeamCountryCode(teams.home.name), // 3-letter code
        home_team_logo: teams.home.logo,
        home_score: goals.home,
        home_penalty_score: homePen,
        home_is_winner: homeWinner,
        
        away_team_id: teams.away.id,
        away_team_name: teams.away.name,
        away_team_country_code: getTeamCountryCode(teams.away.name), // 3-letter code
        away_team_logo: teams.away.logo,
        away_score: goals.away,
        away_penalty_score: awayPen,
        away_is_winner: awayWinner,
        
        home_score_90: homeScore90,
        away_score_90: awayScore90,
        
        updated_at: new Date().toISOString()
      };

      const existingMatchId = matchMap.get(fixture.id);

      if (existingMatchId) {
        promises.push(
          supabaseAdmin
            .from("cupmat_matches")
            .update(matchData)
            .eq("id", existingMatchId)
            .then(({ error: updateError }) => {
              if (updateError) {
                logs.push(`[ERROR] Update failed for match ${fixture.id}: ${updateError.message}`);
              } else {
                updated++;
              }
            })
        );
      } else {
        promises.push(
          supabaseAdmin
            .from("cupmat_matches")
            .insert(matchData)
            .then(({ error: insertError }) => {
              if (insertError) {
                logs.push(`[ERROR] Insert failed for match ${fixture.id}: ${insertError.message}`);
              } else {
                inserted++;
              }
            })
        );
      }
    }
    
    // Execute all database updates/inserts in parallel to prevent Vercel 10s timeouts
    await Promise.all(promises);

    logs.push(`[DB] Successfully processed matches. Inserted: ${inserted}, Updated: ${updated}`);
    return { success: true, inserted, updated, logs };

  } catch (error: any) {
    logs.push(`[API-Football] Exception: ${error.message}`);
    return { success: false, logs };
  }
}
