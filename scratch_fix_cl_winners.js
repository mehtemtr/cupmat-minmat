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

const tieWinners = [
    { home: 'Sturm Graz', away: 'Fenerbahçe', hWin: false, aWin: true },
    { home: 'K. Almaty', away: 'Levski Sofya', hWin: false, aWin: true },
    { home: 'Bodo/Glimt', away: 'Union SG', hWin: true, aWin: false },
    { home: 'Sabah', away: 'Aarhus', hWin: true, aWin: false },
    { home: 'Kauno Zalgiris', away: 'D. Zagreb', hWin: false, aWin: true },
    { home: 'NEC Nijmegen', away: 'Olympiakos', hWin: true, aWin: false },
    { home: 'Kızılyıldız', away: 'HB Sheva', hWin: false, aWin: true },
    { home: 'NK Celje', away: 'Ararat-Armenia', hWin: true, aWin: false },
    { home: 'S. Bratislava', away: 'Mjallby', hWin: true, aWin: false },
    { home: 'Lyon', away: 'Sparta Prag', hWin: true, aWin: false }
];

async function run() {
    try {
        const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', 2).single();
        if (!tour) return;
        
        for (const u of tieWinners) {
            await supabase.from('cupmat_matches')
                .update({
                    home_is_winner: u.hWin,
                    away_is_winner: u.aWin
                })
                .eq('tournament_id', tour.id)
                .like('round', '%3. Ön Eleme%')
                .gte('date', '2026-08-11T00:00:00Z')
                .lte('date', '2026-08-11T23:59:59Z')
                .eq('home_team_name', u.home);
            
            console.log(`Updated winner for ${u.home} vs ${u.away}: H=${u.hWin}, A=${u.aWin}`);
        }
        console.log("All CL winners updated.");
    } catch (e) {
        console.error(e);
    }
}
run();
