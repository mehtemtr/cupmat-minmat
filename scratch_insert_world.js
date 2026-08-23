import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TOURNAMENTS = [
    { name: "Copa Libertadores", type: "Cup", region: "South America", api_id: 13 },
    { name: "Copa Sudamericana", type: "Cup", region: "South America", api_id: 14 },
    { name: "CONCACAF Champions Cup", type: "Cup", region: "North America", api_id: 16 },
    { name: "AFC Champions League Elite", type: "Cup", region: "Asia", api_id: 17 },
    { name: "CAF Champions League", type: "Cup", region: "Africa", api_id: 12 }
];

const rawData = fs.readFileSync('raw_matches_world.txt', 'utf8');

function parseDateStr(dateStr, timeStr = "20:00") {
    // Expected format: "4.08.2026" or "11.08.2026"
    const m = dateStr.match(/(\d{1,2})\.(\d{2})\.(\d{4})/);
    if (m) {
        const day = m[1].padStart(2, '0');
        const month = m[2];
        const year = m[3];
        return `${year}-${month}-${day}T${timeStr}:00+03:00`;
    }
    return '2026-08-01T20:00:00Z'; // fallback
}

async function run() {
    try {
        const tournamentIdMap = {};
        
        for (const t of TOURNAMENTS) {
            let { data: existing } = await supabase.from('cupmat_tournaments').select('id, api_id').eq('api_id', t.api_id).single();
            if (!existing) {
                const { data: inserted } = await supabase.from('cupmat_tournaments').insert([t]).select('id').single();
                tournamentIdMap[t.name] = inserted.id;
            } else {
                tournamentIdMap[t.name] = existing.id;
            }
        }

        const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let currentTournament = "";
        let currentRound = "";
        let currentDate = "";
        let parsedMatches = [];

        for (const line of lines) {
            if (TOURNAMENTS.find(t => t.name === line)) {
                currentTournament = line;
                continue;
            }
            if (line === "Son 16 Turu" || line === "Play-off") {
                currentRound = line;
                continue;
            }
            
            // Date line: 18.08.2026
            if (line.match(/^\d{1,2}\.\d{2}\.\d{4}$/)) {
                currentDate = line;
                continue;
            }

            const parts = line.split('\t').map(p => p.trim());
            const status = parts[0];
            
            if (status.includes(':')) {
                // Future match
                let home_team, away_team;
                if (parts.length >= 4 && parts[2] === '-') {
                    home_team = parts[1];
                    away_team = parts[3];
                } else if (parts.length >= 2) {
                    const rest = parts.slice(1).join(' ').split('-');
                    home_team = rest[0].trim();
                    away_team = rest[1].trim();
                }

                parsedMatches.push({
                    api_id: 9940000 + parsedMatches.length,
                    tournament_id: tournamentIdMap[currentTournament],
                    season: 2026,
                    round: currentRound,
                    date: new Date(parseDateStr(currentDate, status)),
                    status: "NS", // Not Started
                    home_team_id: 8500 + parsedMatches.length,
                    home_team_name: home_team,
                    home_team_country_code: null,
                    home_score: null,
                    home_score_90: null,
                    away_team_id: 9500 + parsedMatches.length,
                    away_team_name: away_team,
                    away_team_country_code: null,
                    away_score: null,
                    away_score_90: null,
                });
            }
        }

        console.log(`Inserting ${parsedMatches.length} matches...`);
        const { error: insertErr } = await supabase.from('cupmat_matches').insert(parsedMatches);
        if (insertErr) {
            console.error("Insert error:", insertErr);
        } else {
            console.log(`Successfully inserted ${parsedMatches.length} matches.`);
        }

    } catch (e) {
        console.error(e);
    }
}
run();
