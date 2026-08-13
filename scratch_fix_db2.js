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
        // 1. Clear TBD country codes
        const { error: err1 } = await supabase
            .from('cupmat_matches')
            .update({ home_team_country_code: null, away_team_country_code: null })
            .eq('home_team_country_code', 'TBD');
        console.log("TBD codes cleared:", err1 || "Success");

        // 2. We can just run a general replace for the round names
        // But supabase-js doesn't have a direct string replace or LIKE update easily without RPC.
        // We'll fetch all matches that have 'n Eleme' in round, and update them.
        const { data: matches, error: fetchErr } = await supabase
            .from('cupmat_matches')
            .select('id, round')
            .like('round', '%n Eleme%');
            
        if (matches && matches.length > 0) {
            console.log(`Found ${matches.length} matches with broken round names.`);
            for (const match of matches) {
                let newRound = match.round.replace(/n Eleme/g, "Ön Eleme").replace(//g, "Ö");
                if (newRound === match.round) {
                    newRound = match.round.replace("n Eleme", "Ön Eleme");
                }
                await supabase.from('cupmat_matches').update({ round: newRound }).eq('id', match.id);
            }
            console.log("Rounds updated.");
        } else {
            console.log("No broken rounds found.");
        }
    } catch (e) {
        console.error(e);
    }
}
run();
