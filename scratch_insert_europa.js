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
    { name: "Avrupa Ligi", type: "Cup", region: "europe", api_id: 3 },
    { name: "Konferans Ligi", type: "Cup", region: "europe", api_id: 848 }
];

const rawData = fs.readFileSync('raw_matches_europa.txt', 'utf8');

const MONTH_MAP = {
    "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04", "Mayıs": "05", "Haziran": "06",
    "Temmuz": "07", "Ağustos": "08", "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12"
};

function parseDateStr(dateStr, timeStr = "20:00") {
    // Expected format: "09 Temmuz 2026"
    const m = dateStr.match(/(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})/);
    if (m) {
        const day = m[1].padStart(2, '0');
        const month = MONTH_MAP[m[2]] || "07";
        const year = m[3];
        return `${year}-${month}-${day}T${timeStr}:00+03:00`;
    }
    return '2026-07-01T20:00:00Z'; // fallback
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
            if (line.includes("Ön Eleme")) {
                currentRound = line;
                continue;
            }
            
            // Date line: 09 Temmuz 2026
            if (line.match(/^\d{1,2}\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]+\s+\d{4}$/)) {
                currentDate = line;
                continue;
            }

            const parts = line.split('\t').map(p => p.trim());
            const status = parts[0];
            
            if (status.includes(':')) {
                // Future match: 18:00 K. Almaty - Levski Sofya
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
                    tournament_name: currentTournament,
                    tournament_id: tournamentIdMap[currentTournament],
                    season: 2026,
                    round: currentRound,
                    date: new Date(parseDateStr(currentDate, status)),
                    status: "NS",
                    home_team_name: home_team,
                    home_score: null,
                    home_score_90: null,
                    away_team_name: away_team,
                    away_score: null,
                    away_score_90: null,
                    home_penalty_score: null,
                    away_penalty_score: null,
                    home_is_winner: null,
                    away_is_winner: null
                });
            } else if (status === 'MS' || status === 'UZ' || status === 'UZT' || status === 'PEN') {
                if (parts.length < 6) continue;
                
                const home_team = parts[1];
                const home_score = parseInt(parts[2], 10);
                const away_score = parseInt(parts[4], 10);
                const away_team = parts[5];
                
                let home_score_90 = home_score;
                let away_score_90 = away_score;
                let home_penalty_score = null;
                let away_penalty_score = null;
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
                        home_penalty_score = parseInt(parts[10], 10);
                        away_penalty_score = parseInt(parts[11], 10);
                    }
                }
                
                parsedMatches.push({
                    tournament_name: currentTournament,
                    tournament_id: tournamentIdMap[currentTournament],
                    season: 2026,
                    round: currentRound,
                    date: new Date(parseDateStr(currentDate, "20:00")),
                    status: db_status,
                    home_team_name: home_team,
                    home_score: home_score,
                    home_score_90: home_score_90,
                    away_team_name: away_team,
                    away_score: away_score,
                    away_score_90: away_score_90,
                    home_penalty_score,
                    away_penalty_score,
                    home_is_winner: null,
                    away_is_winner: null
                });
            }
        }

        // Calculate aggregate winners for 2nd legs
        // A match is a 2nd leg if there's an earlier match in the same round/tournament with reversed teams
        for (let i = 0; i < parsedMatches.length; i++) {
            let m2 = parsedMatches[i];
            
            // Find possible 1st leg
            let m1 = parsedMatches.find(m => 
                m.tournament_id === m2.tournament_id &&
                m.round === m2.round &&
                m.home_team_name === m2.away_team_name &&
                m.away_team_name === m2.home_team_name &&
                m.date < m2.date
            );

            if (m1) {
                // We found a 1st leg and m2 is the 2nd leg.
                // If 2nd leg is finished, calculate the winner.
                if (m2.status !== "NS") {
                    let aggA = m2.home_score + m1.away_score; // m2's home team is A
                    let aggB = m2.away_score + m1.home_score; // m2's away team is B
                    
                    if (aggA > aggB) {
                        m2.home_is_winner = true;
                        m2.away_is_winner = false;
                    } else if (aggB > aggA) {
                        m2.home_is_winner = false;
                        m2.away_is_winner = true;
                    } else {
                        // Aggregate tied. Check penalties if applicable.
                        if (m2.status === "PEN") {
                            if (m2.home_penalty_score > m2.away_penalty_score) {
                                m2.home_is_winner = true;
                                m2.away_is_winner = false;
                            } else {
                                m2.home_is_winner = false;
                                m2.away_is_winner = true;
                            }
                        }
                        // If no penalties, maybe away goals? But UEFA abolished it. We'll leave it null if totally ambiguous.
                    }
                }
            }
        }

        // Insert logic
        console.log(`Deleting existing matches for UEL and UECL...`);
        const { error: delErr } = await supabase.from('cupmat_matches').delete().in('tournament_id', Object.values(tournamentIdMap));
        if (delErr) console.error("Delete error:", delErr);

        console.log(`Inserting ${parsedMatches.length} matches...`);
        let insertedCount = 0;
        
        for (let i = 0; i < parsedMatches.length; i += 50) {
            const batch = parsedMatches.slice(i, i + 50);
            const records = batch.map((m, idx) => ({
                api_id: 9500000 + i + idx,
                tournament_id: m.tournament_id,
                season: m.season,
                round: m.round,
                date: m.date,
                status: m.status,
                home_team_id: 3000 + i + idx,
                home_team_name: m.home_team_name,
                home_team_country_code: null,
                home_score: m.home_score,
                home_score_90: m.home_score_90,
                away_team_id: 4000 + i + idx,
                away_team_name: m.away_team_name,
                away_team_country_code: null,
                away_score: m.away_score,
                away_score_90: m.away_score_90,
                home_penalty_score: m.home_penalty_score,
                away_penalty_score: m.away_penalty_score,
                home_is_winner: m.home_is_winner,
                away_is_winner: m.away_is_winner
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
