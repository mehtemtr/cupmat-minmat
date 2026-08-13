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

async function run() {
    try {
        const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', 2).single();
        if (!tour) return;
        
        // Fix Fenerbahçe match (Sturm Graz vs Fenerbahçe)
        await supabase.from('cupmat_matches')
            .update({
                home_score: 0,
                home_score_90: 0,
                away_score: 1,
                away_score_90: 1
            })
            .eq('tournament_id', tour.id)
            .like('round', '%3. Ön Eleme%')
            .gte('date', '2026-08-11T00:00:00Z')
            .lte('date', '2026-08-11T23:59:59Z')
            .eq('away_team_name', 'Fenerbahçe');

        // Fix Almaty match (K. Almaty vs Levski Sofya)
        await supabase.from('cupmat_matches')
            .update({
                home_score: 0,
                home_score_90: 0,
                away_score: 1,
                away_score_90: 1
            })
            .eq('tournament_id', tour.id)
            .like('round', '%3. Ön Eleme%')
            .gte('date', '2026-08-11T00:00:00Z')
            .lte('date', '2026-08-11T23:59:59Z')
            .eq('home_team_name', 'K. Almaty');

        console.log("Fixed F.Bahçe and Almaty matches.");
    } catch (e) {
        console.error(e);
    }
}
run();
