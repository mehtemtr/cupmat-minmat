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

async function setLive() {
    try {
        const { data: tournaments } = await supabase.from('cupmat_tournaments')
            .select('id, name')
            .in('api_id', [2, 3, 848]); // API IDs for UCL, UEL, UECL
            
        if (!tournaments || tournaments.length === 0) {
            console.log("No tournaments found.");
            return;
        }
            
        const tournamentIds = tournaments.map(t => t.id);
        
        const { error, count } = await supabase.from('cupmat_matches')
            .update({ status: '1H', home_score: 0, away_score: 0, home_score_90: 0, away_score_90: 0 })
            .in('tournament_id', tournamentIds)
            .eq('status', 'NS');
            
        if (error) {
            console.error("Error updating:", error);
        } else {
            console.log("Successfully set European matches to live (1H) with 0-0 score.");
        }
    } catch (e) {
        console.error(e);
    }
}
setLive();
