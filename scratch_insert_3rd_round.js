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
    { name: "Avrupa Şampiyonlar Ligi", type: "Cup", region: "europe", api_id: 2 }
];

const rawData = fs.readFileSync('raw_matches_3.txt', 'utf8');

function parseDateStr(dateStr, timeStr = "20:00") {
    // Expected format: "4.08.2026" or "11.08.2026"
    const m = dateStr.match(/(\d{1,2})\.(\d{2})\.(\d{4})/);
    if (m) {
        const day = m[1].padStart(2, '0');
        const month = m[2];
        const year = m[3];
        // TR is UTC+3 in summer. So 18:00 TR time is 15:00 UTC. 
        // We'll just append timeStr as local TR time by assuming it, but UTC is fine for dummy data too.
        // Let's just create a string like "2026-08-04T20:00:00+03:00"
        return `${year}-${month}-${day}T${timeStr}:00+03:00`;
    }
    return '2026-08-01T20:00:00Z'; // fallback
}

async function run() {
    try {
        let { data: existing } = await supabase.from('cupmat_tournaments').select('id, api_id').eq('api_id', 2).single();
        if (!existing) {
            console.error("Tournament UCL not found!");
            return;
        }
        const tournamentId = existing.id;

        // Parse matches
        const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let currentRound = "";
        let currentDate = "";
        let parsedMatches = [];

        for (const line of lines) {
            if (line === "Avrupa Şampiyonlar Ligi") continue;
            if (line === "3. Ön Eleme") {
                currentRound = line;
                continue;
            }
            
            // Date line: 4.08.2026
            if (line.match(/^\d{1,2}\.\d{2}\.\d{4}$/)) {
                currentDate = line;
                continue;
            }

            // Match line
            const parts = line.split('\t').map(p => p.trim());
            const status = parts[0];
            
            if (status.includes(':')) {
                // Future match: 18:00 K. Almaty - Levski Sofya
                // parts could be: ["18:00", "K. Almaty", "-", "Levski Sofya"] or similar depending on tabs
                let home_team, away_team;
                if (parts.length === 4 && parts[2] === '-') {
                    home_team = parts[1];
                    away_team = parts[3];
                } else if (parts.length >= 2) {
                    // split by "-" if it's one big string
                    const rest = parts.slice(1).join(' ').split('-');
                    home_team = rest[0].trim();
                    away_team = rest[1].trim();
                }

                parsedMatches.push({
                    api_id: 9900000 + parsedMatches.length,
                    tournament_id: tournamentId,
                    season: 2026,
                    round: currentRound,
                    date: new Date(parseDateStr(currentDate, status)),
                    status: "NS", // Not Started
                    home_team_id: 8000 + parsedMatches.length,
                    home_team_name: home_team,
                    home_team_country_code: null,
                    home_score: null,
                    home_score_90: null,
                    away_team_id: 9000 + parsedMatches.length,
                    away_team_name: away_team,
                    away_team_country_code: null,
                    away_score: null,
                    away_score_90: null,
                });
            } else if (status === 'MS') {
                // Results: MS Mjallby 1 - 2 S. Bratislava
                if (parts.length < 6) continue;
                
                const home_team = parts[1];
                const home_score = parseInt(parts[2], 10);
                const away_score = parseInt(parts[4], 10);
                const away_team = parts[5];
                
                parsedMatches.push({
                    api_id: 9900000 + parsedMatches.length,
                    tournament_id: tournamentId,
                    season: 2026,
                    round: currentRound,
                    date: new Date(parseDateStr(currentDate, "20:00")),
                    status: "FT",
                    home_team_id: 8000 + parsedMatches.length,
                    home_team_name: home_team,
                    home_team_country_code: null,
                    home_score: home_score,
                    home_score_90: home_score,
                    away_team_id: 9000 + parsedMatches.length,
                    away_team_name: away_team,
                    away_team_country_code: null,
                    away_score: away_score,
                    away_score_90: away_score,
                });
            }
        }

        console.log(`Inserting ${parsedMatches.length} 3rd round matches...`);
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
