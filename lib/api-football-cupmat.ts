import { supabaseAdmin } from "@/lib/supabase";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_URL = "https://v3.football.api-sports.io";

// We only want to track these continental/global leagues
export const TARGET_LEAGUES = [
  2,  // UEFA Champions League
  3,  // UEFA Europa League
  848, // UEFA Conference League
  13, // Copa Libertadores
  17, // AFC Champions League
  11, // Copa Sudamericana
  12, // CAF Champions League
  16, // CONCACAF Champions Cup
  15, // FIFA Club World Cup
  5,  // UEFA Nations League (Milli)
  34, // World Cup Qualifiers CONMEBOL (Milli)
  32, // AFCON Qualifiers (Milli)
];

const LEAGUE_REGIONS: Record<number, string> = {
  2: 'europe',
  3: 'europe',
  848: 'europe',
  5: 'europe',
  13: 'america',
  11: 'america',
  34: 'america',
  16: 'america',
  17: 'asia',
  12: 'africa',
  32: 'africa',
  15: 'world'
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
  return dict[teamName] || "UNK";
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

    for (const item of targetFixtures) {
      const fixture = item.fixture;
      const league = item.league;
      const teams = item.teams;
      const goals = item.goals;
      const score = item.score;

      // 3.1 Ensure Tournament exists in our DB
      const { data: existingTournament } = await supabaseAdmin
        .from("cupmat_tournaments")
        .select("id")
        .eq("api_id", league.id)
        .single();

      let tournamentId = existingTournament?.id;
      const region = LEAGUE_REGIONS[league.id] || 'world';

      if (!tournamentId) {
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

      // API-Football returns aggregate scores in score.fulltime if it's a 2-legged match, or we could fetch the first leg. 
      // For simplicity in this mock integration, we check if API provides aggregate data in `fixture.status.elapsed` etc.
      // Usually, it's not provided in the basic /fixtures payload, so we leave it null until an advanced lookup is built.
      
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
        
        // aggregate_home_score: null, 
        // aggregate_away_score: null,
        // first_leg_home_score: null,
        // first_leg_away_score: null,
        
        updated_at: new Date().toISOString()
      };

      const { data: existingMatch } = await supabaseAdmin
        .from("cupmat_matches")
        .select("id")
        .eq("api_id", fixture.id)
        .single();

      if (existingMatch) {
        const { error: updateError } = await supabaseAdmin
          .from("cupmat_matches")
          .update(matchData)
          .eq("id", existingMatch.id);
          
        if (updateError) {
          logs.push(`[ERROR] Update failed for match ${fixture.id}: ${updateError.message}`);
        } else {
          updated++;
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from("cupmat_matches")
          .insert(matchData);
          
        if (insertError) {
          logs.push(`[ERROR] Insert failed for match ${fixture.id}: ${insertError.message}`);
        } else {
          inserted++;
        }
      }
    }

    logs.push(`[DB] Successfully processed matches. Inserted: ${inserted}, Updated: ${updated}`);
    return { success: true, inserted, updated, logs };

  } catch (error: any) {
    logs.push(`[API-Football] Exception: ${error.message}`);
    return { success: false, logs };
  }
}
