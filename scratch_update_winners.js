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
            
            // Only update finished matches
            if (m2.status === "NS") continue;

            // Find 1st leg
            let m1 = matches.find(m => 
                m.tournament_id === m2.tournament_id &&
                m.round === m2.round &&
                m.home_team_name === m2.away_team_name &&
                m.away_team_name === m2.home_team_name &&
                new Date(m.date) < new Date(m2.date)
            );

            if (m1) {
                // M2 is 2nd leg
                let aggA = m2.home_score + m1.away_score;
                let aggB = m2.away_score + m1.home_score;
                
                let home_win = null;
                let away_win = null;

                if (aggA > aggB) {
                    home_win = true; away_win = false;
                } else if (aggB > aggA) {
                    home_win = false; away_win = true;
                } else {
                    if (m2.status === "PEN") {
                        if (m2.home_penalty_score > m2.away_penalty_score) {
                            home_win = true; away_win = false;
                        } else {
                            home_win = false; away_win = true;
                        }
                    } else {
                        // Tie not decided by pens, maybe it was just a 1st leg wrongly detected? Or no penalties played yet.
                    }
                }

                if (home_win !== null) {
                    updates.push({
                        id: m2.id,
                        home_is_winner: home_win,
                        away_is_winner: away_win
                    });
                }
            } else {
                // If it's a single leg match (like a final), we should just use match score
                // But in qualifying, all are 2 legs, EXCEPT if we only have 1 match data.
                // If we only have 1 match data, maybe it is a single leg.
                // Let's not guess. The user only cares about 2. maçlarda turu geçenler.
            }
        }

        console.log(`Found ${updates.length} 2nd leg matches to update winners.`);
        
        let success = 0;
        for (let u of updates) {
            const { error: updErr } = await supabase.from('cupmat_matches').update({
                home_is_winner: u.home_is_winner,
                away_is_winner: u.away_is_winner
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
