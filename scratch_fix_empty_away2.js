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
    console.log("Empty away_team_name fix started...");
    // 1. Fetch matches with empty away_team_name
    const { data: brokenMatches, error: fetchErr } = await supabase.from('cupmat_matches')
        .select('*')
        .or('away_team_name.is.null,away_team_name.eq.,away_team_name.eq. ');

    if (fetchErr) {
        console.error("Error fetching broken matches:", fetchErr);
        return;
    }

    if (!brokenMatches || brokenMatches.length === 0) {
        console.log("No broken matches found.");
        return;
    }

    console.log(`Found ${brokenMatches.length} broken matches. Attempting to fix...`);

    // 2. Fetch all matches to find the 1st legs
    const { data: allMatches, error: allErr } = await supabase.from('cupmat_matches').select('*');
    if (allErr) {
        console.error("Error fetching all matches:", allErr);
        return;
    }

    let fixedCount = 0;
    for (const match of brokenMatches) {
        // Find the corresponding 1st leg match
        // 1st leg away_team_name === broken_match home_team_name
        // same tournament, same round
        const firstLeg = allMatches.find(m => 
            m.tournament_id === match.tournament_id &&
            m.round === match.round &&
            m.away_team_name === match.home_team_name &&
            m.home_team_name !== '' // ensure it has a valid home team
        );

        if (firstLeg) {
            const correctAwayTeamName = firstLeg.home_team_name;
            console.log(`Fixing match: ${match.home_team_name} vs [${correctAwayTeamName}]`);
            
            const { error: updateErr } = await supabase.from('cupmat_matches')
                .update({ away_team_name: correctAwayTeamName })
                .eq('id', match.id);
                
            if (updateErr) {
                console.error(`Error updating match ${match.id}:`, updateErr);
            } else {
                fixedCount++;
            }
        } else {
            console.log(`Could not find 1st leg for: ${match.home_team_name}`);
        }
    }
    
    console.log(`Successfully fixed ${fixedCount} matches!`);
}

run();
