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
    { name: "Avrupa Şampiyonlar Ligi", type: "Cup", region: "europe", api_id: 2 },
    { name: "Avrupa Ligi", type: "Cup", region: "europe", api_id: 3 },
    { name: "Konferans Ligi", type: "Cup", region: "europe", api_id: 848 },
    { name: "Milli Maçlar", type: "League", region: "europe", api_id: 5 }
];

const rawData = fs.readFileSync('raw_matches.txt', 'utf8');

function parseDateStr(dateStr) {
    // Expected format: "Salı 07.07.2026" or "07.07.2026"
    const m = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (m) {
        return `${m[3]}-${m[2]}-${m[1]}T20:00:00Z`;
    }
    return '2026-07-01T20:00:00Z'; // fallback
}

async function run() {
    try {
        // 1. Get Tournament IDs
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

        // 2. Parse matches
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
            if (line.includes("Eleme Turu") || line.includes("1. Tur") || line.includes("Grup")) {
                currentRound = line;
                continue;
            }
            
            // Check if it's a date line
            if (line.match(/\d{2}\.\d{2}\.\d{4}/)) {
                currentDate = parseDateStr(line);
                continue;
            }

            // It's a match line
            const parts = line.split('\t').map(p => p.trim());
            const status = parts[0];
            
            if (status === '18:00' || status === '19:00' || status === '20:00' || status === '21:00' || status === '22:00' || status === '21:45' || status === '19:30') {
                continue; // Skip future matches if any, or handle them. (User just wants correct historical inserted)
            } else {
                // Results: MS Sabah 2 - 0 The New Saints
                if (parts.length < 6) continue;
                
                const home_team = parts[1];
                const home_score = parseInt(parts[2], 10);
                const away_score = parseInt(parts[4], 10);
                const away_team = parts[5];
                
                let home_score_90 = home_score;
                let away_score_90 = away_score;
                let db_status = "FT";
                
                if (status === 'UZ' || status === 'UZT') {
                    db_status = "AET";
                    if (parts.length >= 8) {
                        home_score_90 = parseInt(parts[6], 10);
                        away_score_90 = parseInt(parts[7], 10);
                    }
                } else if (status === 'PEN') {
                    db_status = "PEN";
                    if (parts.length >= 12) {
                        home_score_90 = parseInt(parts[6], 10);
                        away_score_90 = parseInt(parts[7], 10);
                    }
                }
                
                parsedMatches.push({
                    tournament: currentTournament,
                    round: currentRound.replace(/n Eleme/g, "Ön Eleme"),
                    date: currentDate,
                    status: db_status,
                    home_team,
                    away_team,
                    home_score,
                    away_score,
                    home_score_90,
                    away_score_90
                });
            }
        }

        // 3. Delete existing european matches to avoid duplicates
        const eurTournaments = Object.values(tournamentIdMap);
        if (eurTournaments.length > 0) {
            console.log("Deleting existing european matches...");
            const { error: delErr } = await supabase.from('cupmat_matches').delete().in('tournament_id', eurTournaments);
            if (delErr) console.error("Error deleting old matches:", delErr);
        }

        // 4. Insert new matches
        console.log(`Inserting ${parsedMatches.length} matches...`);
        let insertedCount = 0;
        
        // We'll insert in batches of 50 to avoid timeout
        for (let i = 0; i < parsedMatches.length; i += 50) {
            const batch = parsedMatches.slice(i, i + 50);
            const records = batch.map((m, idx) => ({
                api_id: 9000000 + i + idx,
                tournament_id: tournamentIdMap[m.tournament],
                season: 2026,
                round: m.round,
                date: new Date(m.date),
                status: m.status,
                home_team_id: 1000 + i + idx,
                home_team_name: m.home_team,
                home_team_country_code: null,
                home_score: m.home_score,
                home_score_90: m.home_score_90,
                away_team_id: 2000 + i + idx,
                away_team_name: m.away_team,
                away_team_country_code: null,
                away_score: m.away_score,
                away_score_90: m.away_score_90,
            }));
            
            const { error: insertErr } = await supabase.from('cupmat_matches').insert(records);
            if (insertErr) {
                console.error("Insert error:", insertErr);
            } else {
                insertedCount += records.length;
            }
        }
        console.log(`Successfully inserted ${insertedCount} matches.`);

    } catch (e) {
        console.error(e);
    }
}
run();
