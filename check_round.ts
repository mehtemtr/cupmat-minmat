import { supabaseAdmin } from './lib/supabase';
async function run() {
  const { data } = await supabaseAdmin.from('cupmat_matches').select('*').eq('api_id', 1610923);
  console.log(JSON.stringify(data, null, 2));
}
run();
