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

function getRandomScore() {
    return Math.floor(Math.random() * 4);
}

async function run() {
    try {
        const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', 2).single();
        if (!tour) return;
        
        // Find 2nd leg matches for CL 3rd round (date: 2026-08-11)
        const { data: matches, error } = await supabase.from('cupmat_matches')
            .select('*')
            .eq('tournament_id', tour.id)
            .like('round', '%3. Ön Eleme%')
            .gte('date', '2026-08-11T00:00:00Z')
            .lte('date', '2026-08-11T23:59:59Z')
            .eq('status', 'NS');

        if (error) {
            console.error(error);
            return;
        }
        
        if (!matches || matches.length === 0) {
            console.log("No NS matches found for 11 Aug 2026.");
            return;
        }

        console.log(`Found ${matches.length} matches to update.`);

        for (const match of matches) {
            const hScore = getRandomScore();
            const aScore = getRandomScore();
            
            const { error: updErr } = await supabase.from('cupmat_matches')
                .update({
                    status: 'FT',
                    home_score: hScore,
                    home_score_90: hScore,
                    away_score: aScore,
                    away_score_90: aScore
                })
                .eq('id', match.id);
                
            if (updErr) {
                console.error(`Error updating match ${match.id}:`, updErr);
            } else {
                console.log(`Updated match: ${match.home_team_name} ${hScore} - ${aScore} ${match.away_team_name}`);
            }
        }
        
        console.log("Done updating CL 3rd round 2nd leg matches.");

    } catch (e) {
        console.error(e);
    }
}

run();
