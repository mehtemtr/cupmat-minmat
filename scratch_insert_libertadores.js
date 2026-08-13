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

const MONTH_MAP = {
    "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04", "Mayıs": "05", "Haziran": "06",
    "Temmuz": "07", "Ağustos": "08", "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12"
};

function parseDateStr(dateStr, timeStr = "20:00") {
    // "04 Şubat 2026"
    const m = dateStr.match(/(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})/);
    if (m) {
        const day = m[1].padStart(2, '0');
        const month = MONTH_MAP[m[2]] || "01";
        const year = m[3];
        return `${year}-${month}-${day}T${timeStr}:00+03:00`;
    }
    return '2026-01-01T20:00:00Z';
}

async function run() {
    try {
        // Find or create tournament
        const api_id = 13; // CONMEBOL Libertadores
        let { data: existingTour } = await supabase.from('cupmat_tournaments').select('id, name').eq('api_id', api_id).single();
        let tournamentId;
        
        if (!existingTour) {
            const { data: inserted } = await supabase.from('cupmat_tournaments').insert([{
                name: 'Copa Libertadores',
                region: 'South America',
                type: 'Cup',
                api_id: api_id
            }]).select('id').single();
            tournamentId = inserted.id;
        } else {
            tournamentId = existingTour.id;
        }

        const rawData = fs.readFileSync('raw_matches_libertadores.txt', 'utf8');
        const lines = rawData.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const parsedMatches = [];
        let baseApiId = 9600000;

        for (const line of lines) {
            if (line.includes("Güney Amerika") || line.includes("Libertadores Kupası") || line.includes("Türü\tTarih")) {
                continue;
            }

            const parts = line.split('\t').map(p => p.trim());
            if (parts.length < 8) continue;

            let round, dateStr, status, home_team, home_score, away_score, away_team, home_pen, away_pen;
            
            // Check if group stage line (C 1. Hafta) or Knockout (1. Tur)
            if (parts[0].length === 1 && parts[1].includes("Hafta")) {
                round = `Grup ${parts[0]} - ${parts[1]}`;
                dateStr = parts[2];
                status = parts[3];
                home_team = parts[4];
                home_score = parseInt(parts[5], 10);
                away_score = parseInt(parts[7], 10);
                away_team = parts[8];
            } else {
                round = parts[0];
                dateStr = parts[1];
                status = parts[2];
                home_team = parts[3];
                home_score = parseInt(parts[4], 10);
                away_score = parseInt(parts[6], 10);
                away_team = parts[7];
                home_pen = parts[8] ? parseInt(parts[8], 10) : null;
                away_pen = parts[9] ? parseInt(parts[9], 10) : null;
            }

            let dbStatus = "FT";
            if (status === "PEN") {
                dbStatus = "PEN";
            } else if (status === "HÜK") {
                dbStatus = "AW"; // Awarded
            }

            parsedMatches.push({
                api_id: baseApiId + parsedMatches.length,
                tournament_id: tournamentId,
                season: 2026,
                round: round,
                date: new Date(parseDateStr(dateStr)),
                status: dbStatus,
                home_team_id: 10000 + parsedMatches.length,
                home_team_name: home_team,
                home_score: home_score,
                home_score_90: home_score,
                away_team_id: 20000 + parsedMatches.length,
                away_team_name: away_team,
                away_score: away_score,
                away_score_90: away_score,
                home_penalty_score: home_pen || null,
                away_penalty_score: away_pen || null,
            });
        }
        
        console.log(`Parsed ${parsedMatches.length} matches.`);

        // Delete existing libertadores matches for 2026 to avoid duplicates
        await supabase.from('cupmat_matches').delete().eq('tournament_id', tournamentId).eq('season', 2026);

        // Insert
        for (let i = 0; i < parsedMatches.length; i += 50) {
            const batch = parsedMatches.slice(i, i + 50);
            const { error } = await supabase.from('cupmat_matches').insert(batch);
            if (error) console.error("Insert error:", error);
        }
        
        console.log(`Successfully inserted ${parsedMatches.length} Libertadores matches.`);

    } catch (e) {
        console.error(e);
    }
}
run();
