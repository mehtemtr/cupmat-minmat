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
    { home: 'Bodo/Glimt', away: 'Union SG', hScore: 3, aScore: 2, status: 'AET' },
    { home: 'Sabah', away: 'Aarhus', hScore: 4, aScore: 0, status: 'FT' },
    { home: 'Kauno Zalgiris', away: 'D. Zagreb', hScore: 1, aScore: 2, status: 'FT' },
    { home: 'NEC Nijmegen', away: 'Olympiakos', hScore: 2, aScore: 1, status: 'AET' },
    { home: 'Kızılyıldız', away: 'HB Sheva', hScore: 0, aScore: 2, status: 'FT' },
    { home: 'NK Celje', away: 'Ararat-Armenia', hScore: 2, aScore: 0, status: 'FT' },
    { home: 'S. Bratislava', away: 'Mjallby', hScore: 2, aScore: 0, status: 'FT' },
    { home: 'Lyon', away: 'Sparta Prag', hScore: 3, aScore: 0, status: 'FT' }
];

async function run() {
    try {
        const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', 2).single();
        if (!tour) return;
        
        for (const u of updates) {
            await supabase.from('cupmat_matches')
                .update({
                    status: u.status,
                    home_score: u.hScore,
                    home_score_90: u.status === 'AET' ? u.hScore : u.hScore, // rough approx
                    away_score: u.aScore,
                    away_score_90: u.status === 'AET' ? u.aScore : u.aScore
                })
                .eq('tournament_id', tour.id)
                .like('round', '%3. Ön Eleme%')
                .gte('date', '2026-08-11T00:00:00Z')
                .lte('date', '2026-08-11T23:59:59Z')
                .eq('home_team_name', u.home);
            
            console.log(`Updated ${u.home} vs ${u.away} to ${u.hScore}-${u.aScore}`);
        }
        
        console.log("All fixes applied.");
    } catch (e) {
        console.error(e);
    }
}
run();
