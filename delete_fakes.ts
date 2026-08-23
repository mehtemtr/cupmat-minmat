import { supabaseAdmin } from './lib/supabase';

async function run() {
  const { data, error } = await supabaseAdmin
    .from('cupmat_matches')
    .delete()
    .gte('api_id', 9900000);
    
  console.log("Deleted fake matches. Error:", error);
}
run();
