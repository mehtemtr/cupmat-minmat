import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define tournament mappings for the mock data
const tournaments = [
    { name: "UEFA Şampiyonlar Ligi", type: "Cup", region: "europe", api_id: 2 },
    { name: "UEFA Avrupa Ligi", type: "Cup", region: "europe", api_id: 3 },
    { name: "UEFA Konferans Ligi", type: "Cup", region: "europe", api_id: 848 }
];

async function insertMatches() {
    try {
        console.log('Ensuring tournaments exist...');
        const tournamentIdMap = {};
        for (const t of tournaments) {
            let { data: existing, error: fetchErr } = await supabase
                .from('cupmat_tournaments')
                .select('id')
                .eq('api_id', t.api_id)
                .single();
            
            if (fetchErr && fetchErr.code !== 'PGRST116') {
                console.error(`Error fetching tournament ${t.name}:`, fetchErr);
                continue;
            }

            if (!existing) {
                const { data: inserted, error: insertErr } = await supabase
                    .from('cupmat_tournaments')
                    .insert([
                        { api_id: t.api_id, name: t.name, type: t.type, region: t.region }
                    ])
                    .select('id')
                    .single();
                
                if (insertErr) {
                    console.error(`Error inserting tournament ${t.name}:`, insertErr);
                    continue;
                }
                tournamentIdMap[t.name] = inserted.id;
                console.log(`Inserted tournament ${t.name}`);
            } else {
                // Also update the name in the map just in case it differs
                tournamentIdMap[t.name] = existing.id;
            }
        }

        console.log('Reading matches JSON...');
        const matchesRaw = fs.readFileSync(path.resolve(__dirname, 'scratch', 'parsed_euro_matches.json'), 'utf8');
        const matches = JSON.parse(matchesRaw);

        console.log(`Preparing to insert ${matches.length} matches...`);
        let insertedCount = 0;

        for (let i = 0; i < matches.length; i++) {
            const m = matches[i];
            const tId = tournamentIdMap[m.tournament];
            
            if (!tId) {
                console.log(`Skipping match due to missing tournament: ${m.tournament}`);
                continue;
            }

            // Using dummy api_id for these historical manual inserts, e.g., 900000 + i to avoid collisions
            const fakeApiId = 9000000 + i; 

            // Map standard Date (approximate since we only have string like 'Salı 07.07.2026')
            // Match "07.07.2026" or "07 Temmuz 2026"
            // For now, let's just insert a default date or parse it roughly if needed.
            // Since this is mock historical data just to test StatMatik, we use an arbitrary valid date
            const matchDate = new Date(`2026-07-01T20:00:00Z`);

            const matchData = {
                api_id: fakeApiId,
                tournament_id: tId,
                season: 2026,
                round: m.round,
                date: matchDate,
                status: m.status,
                home_team_id: 1000 + i, // Fake IDs for testing
                home_team_name: m.home_team,
                home_team_country_code: "TBD",
                home_score: m.home_score,
                home_score_90: m.home_score_90,
                home_penalty_score: m.home_penalty_score,
                away_team_id: 2000 + i,
                away_team_name: m.away_team,
                away_team_country_code: "TBD",
                away_score: m.away_score,
                away_score_90: m.away_score_90,
                away_penalty_score: m.away_penalty_score
            };

            const { error: matchErr } = await supabase
                .from('cupmat_matches')
                .upsert([matchData], { onConflict: 'api_id' });
            
            if (matchErr) {
                console.error(`Error inserting match ${m.home_team} vs ${m.away_team}:`, matchErr);
            } else {
                insertedCount++;
            }
        }
        
        console.log(`Successfully inserted/upserted ${insertedCount} matches.`);
    } catch (e) {
        console.error('Fatal error:', e);
    }
}

insertMatches();
