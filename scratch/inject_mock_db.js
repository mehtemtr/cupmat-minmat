const fs = require('fs');
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if(line.includes('=')) {
      const [key, ...rest] = line.split('=');
      process.env[key.trim()] = rest.join('=').trim().replace(/['"]/g, '');
    }
  });
} catch(e) {}

const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inject() {
  await supabaseAdmin.from('cupmat_tournaments').insert({api_id: 2, name: 'UEFA Champions League', type: 'Cup', region: 'europe', logo_url: 'https://media.api-sports.io/football/leagues/2.png'}).select('id').single();
  const { data: t } = await supabaseAdmin.from('cupmat_tournaments').select('id').eq('api_id', 2).single();

  const mockMatches = [
    {
      api_id: 999001, tournament_id: t.id, season: 2026, round: "3. Ön Eleme Turu", date: "2026-08-04T20:00:00Z", status: "FT", venue_name: "Mock Stadium",
      home_team_id: 111, home_team_name: "Kralove", home_team_country_code: "ÇEK", home_team_logo: "https://media.api-sports.io/football/teams/1.png", home_score: 0, home_is_winner: false,
      away_team_id: 222, away_team_name: "Beþiktaþ", away_team_country_code: "TÜR", away_team_logo: "https://media.api-sports.io/football/teams/549.png", away_score: 3, away_is_winner: true
    },
    {
      api_id: 999002, tournament_id: t.id, season: 2026, round: "3. Ön Eleme Turu", date: "2026-08-06T21:00:00Z", status: "FT", venue_name: "Mock Stadium",
      home_team_id: 333, home_team_name: "Brighton", home_team_country_code: "ÝNG", home_team_logo: "https://media.api-sports.io/football/teams/51.png", home_score: 1, home_is_winner: false,
      away_team_id: 444, away_team_name: "Lille", away_team_country_code: "FRA", away_team_logo: "https://media.api-sports.io/football/teams/79.png", away_score: 2, away_is_winner: true,
      first_leg_home_score: 1, first_leg_away_score: 1, aggregate_home_score: 2, aggregate_away_score: 3
    },
    {
      api_id: 999003, tournament_id: t.id, season: 2026, round: "2. Ön Eleme Turu", date: "2026-07-30T20:00:00Z", status: "FT", venue_name: "Mock Stadium",
      home_team_id: 555, home_team_name: "Fenerbahçe", home_team_country_code: "TÜR", home_team_logo: "https://media.api-sports.io/football/teams/548.png", home_score: 2, home_is_winner: true,
      away_team_id: 666, away_team_name: "Lugano", away_team_country_code: "ÝSV", away_team_logo: "https://media.api-sports.io/football/teams/123.png", away_score: 1, away_is_winner: false,
      first_leg_home_score: 2, first_leg_away_score: 1, aggregate_home_score: 4, aggregate_away_score: 2
    }
  ];

  for(let m of mockMatches) {
    await supabaseAdmin.from('cupmat_matches').upsert(m, {onConflict: 'api_id'});
  }
  console.log("Mock data injected successfully!");
}
inject();
