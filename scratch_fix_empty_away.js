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
    // find matches with empty or null away_team_name
    const { data, error } = await supabase.from('cupmat_matches')
        .select('id, tournament_id, round, date, home_team_name, away_team_name, api_id, status')
        .or('away_team_name.is.null,away_team_name.eq.,away_team_name.eq. ');

    if (error) {
        console.error(error);
        return;
    }
    
    console.log("Matches with empty away_team_name:", data);
}
run();
