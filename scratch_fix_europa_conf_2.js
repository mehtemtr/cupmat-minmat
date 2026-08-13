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
    { tour_id: 3, home: 'Iberia', away: 'Larne', hScore: 1, aScore: 2, status: 'FT' },
    { tour_id: 848, home: 'Apollon', away: 'Brann', hScore: 2, aScore: 3, status: 'FT' },
    { tour_id: 848, home: 'CSKA', away: 'Panathinaikos', hScore: 0, aScore: 1, status: 'FT' },
    { tour_id: 3, home: 'LASK', away: 'St. Gallen', hScore: 1, aScore: 1, status: 'FT' }
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
                    away_score_90: u.aScore,
                    updated_at: new Date().toISOString()
                })
                .eq('tournament_id', tour.id)
                .like('home_team_name', `%${u.home}%`)
                .like('away_team_name', `%${u.away}%`);
            
            console.log(`Updated ${u.home} vs ${u.away} to ${u.hScore}-${u.aScore}`);
        }
        
        console.log("All fixes applied.");
    } catch (e) {
        console.error(e);
    }
}
run();
