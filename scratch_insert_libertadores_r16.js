import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
    // "12 Ağustos 2026"
    const m = dateStr.match(/(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})/);
    if (m) {
        const day = m[1].padStart(2, '0');
        const month = MONTH_MAP[m[2]] || "01";
        const year = m[3];
        // Ensure valid timeStr
        let validTime = timeStr.includes(":") ? timeStr : "20:00";
        return `${year}-${month}-${day}T${validTime}:00+03:00`;
    }
    return '2026-01-01T20:00:00Z';
}

const rawMatches = `
Son 16 Turu	12 Ağustos 2026	01:00	Fluminense	-	Ind. Mendoza
Son 16 Turu	12 Ağustos 2026	03:30	Estudiantes	-	U. Catolica
Son 16 Turu	12 Ağustos 2026	ERT	Dep. Tolima	-	Ind. del Valle
Son 16 Turu	13 Ağustos 2026	01:00	Platense	-	Coquimbo U.
Son 16 Turu	13 Ağustos 2026	01:00	Palmeiras	-	Cerro Porteno
Son 16 Turu	13 Ağustos 2026	03:30	Cruzeiro MG	-	Flamengo
Son 16 Turu	14 Ağustos 2026	01:00	Mirassol SP	-	LDU Quito
Son 16 Turu	14 Ağustos 2026	03:30	Rosario C.	-	Corinthians
Son 16 Turu	19 Ağustos 2026	01:00	Ind. Mendoza	-	Fluminense
Son 16 Turu	19 Ağustos 2026	03:30	U. Catolica	-	Estudiantes
Son 16 Turu	19 Ağustos 2026	03:30	Ind. del Valle	-	Dep. Tolima
Son 16 Turu	20 Ağustos 2026	01:00	Coquimbo U.	-	Platense
Son 16 Turu	20 Ağustos 2026	01:00	Cerro Porteno	-	Palmeiras
Son 16 Turu	20 Ağustos 2026	03:30	Flamengo	-	Cruzeiro MG
Son 16 Turu	21 Ağustos 2026	01:00	LDU Quito	-	Mirassol SP
Son 16 Turu	21 Ağustos 2026	03:30	Corinthians	-	Rosario C.
`.trim();

async function run() {
    try {
        const api_id = 13; // CONMEBOL Libertadores
        let { data: existingTour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', api_id).single();
        
        if (!existingTour) {
            console.error("Tournament not found!");
            return;
        }
        
        const tournamentId = existingTour.id;
        const parsedMatches = [];
        const lines = rawMatches.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let baseApiId = 9600500;

        for (const line of lines) {
            const parts = line.split('\t').map(p => p.trim());
            const round = parts[0];
            const dateStr = parts[1];
            const timeOrStatus = parts[2];
            const home_team = parts[3];
            const away_team = parts[5];
            
            let status = "NS";
            if (timeOrStatus === "ERT") {
                status = "PST"; // Postponed
            }

            parsedMatches.push({
                api_id: baseApiId + parsedMatches.length,
                tournament_id: tournamentId,
                season: 2026,
                round: round,
                date: new Date(parseDateStr(dateStr, timeOrStatus)),
                status: status,
                home_team_id: 30000 + parsedMatches.length,
                home_team_name: home_team,
                home_score: null,
                home_score_90: null,
                away_team_id: 40000 + parsedMatches.length,
                away_team_name: away_team,
                away_score: null,
                away_score_90: null
            });
        }
        
        // Delete any existing round of 16 matches to avoid duplicates
        await supabase.from('cupmat_matches').delete().eq('tournament_id', tournamentId).eq('round', 'Son 16 Turu');

        const { error } = await supabase.from('cupmat_matches').insert(parsedMatches);
        if (error) console.error("Insert error:", error);
        else console.log(`Successfully inserted ${parsedMatches.length} Round of 16 matches.`);

    } catch (e) {
        console.error(e);
    }
}
run();
