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
        const { data: matches, error } = await supabase
            .from('cupmat_matches')
            .select('*');
        
        if (error) throw error;
        
        let updates = [];

        for (let i = 0; i < matches.length; i++) {
            let m2 = matches[i];

            // We only calculate this for matches that have a 1st leg
            // (Even if 2nd leg is NS, we can still show the first leg score!)
            let m1 = matches.find(m => 
                m.tournament_id === m2.tournament_id &&
                m.round === m2.round &&
                m.home_team_name === m2.away_team_name &&
                m.away_team_name === m2.home_team_name &&
                new Date(m.date) < new Date(m2.date)
            );

            if (m1 && m1.status !== 'NS') {
                // m1 is the 1st leg.
                // m2 is the 2nd leg.
                
                // For m2:
                // home_team is m1's away_team
                // away_team is m1's home_team
                let first_leg_home_score = m1.away_score; 
                let first_leg_away_score = m1.home_score;
                
                let agg_home = null;
                let agg_away = null;
                
                if (m2.status !== 'NS') {
                    agg_home = m2.home_score + first_leg_home_score;
                    agg_away = m2.away_score + first_leg_away_score;
                }

                updates.push({
                    id: m2.id,
                    first_leg_home_score: first_leg_home_score,
                    first_leg_away_score: first_leg_away_score,
                    aggregate_home_score: agg_home,
                    aggregate_away_score: agg_away
                });
            }
        }

        console.log(`Found ${updates.length} 2nd leg matches to update first leg/aggregate scores.`);
        
        let success = 0;
        for (let u of updates) {
            const { error: updErr } = await supabase.from('cupmat_matches').update({
                first_leg_home_score: u.first_leg_home_score,
                first_leg_away_score: u.first_leg_away_score,
                aggregate_home_score: u.aggregate_home_score,
                aggregate_away_score: u.aggregate_away_score
            }).eq('id', u.id);
            if (updErr) {
                console.error("Update error:", updErr);
            } else {
                success++;
            }
        }
        console.log(`Updated ${success} matches.`);

    } catch (e) {
        console.error(e);
    }
}
run();
