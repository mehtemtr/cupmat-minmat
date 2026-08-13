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

const updates = [
    { tour_id: 3, home: 'Iberia', away: 'Larne', hScore: 2, aScore: 1, status: 'AET' },
    { tour_id: 848, home: 'Apollon L.', away: 'Brann', hScore: 2, aScore: 4, status: 'AET' },
    { tour_id: 848, home: 'CSKA 1948', away: 'Panathinaikos', hScore: 1, aScore: 2, status: 'AET' }
];

async function run() {
    try {
        for (const u of updates) {
            const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', u.tour_id).single();
            if (!tour) {
                console.log(`Tournament ${u.tour_id} not found.`);
                continue;
            }
            
            await supabase.from('cupmat_matches')
                .update({
                    status: u.status,
                    home_score: u.hScore,
                    home_score_90: u.hScore,
                    away_score: u.aScore,
                    away_score_90: u.aScore
                })
                .eq('tournament_id', tour.id)
                .like('round', '%3. Ön Eleme%')
                .eq('home_team_name', u.home)
                .eq('away_team_name', u.away);
            
            console.log(`Updated ${u.home} vs ${u.away} to ${u.hScore}-${u.aScore}`);
        }
        
        console.log("All fixes applied.");
    } catch (e) {
        console.error(e);
    }
}
run();
