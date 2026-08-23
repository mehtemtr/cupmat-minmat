import { supabaseAdmin } from './lib/supabase';
async function run() {
  const { data } = await supabaseAdmin.from('cupmat_tournaments').select('*').eq('id', 'eee1093f-479c-430b-b1e2-9ff17c6ccccb');
  console.log(JSON.stringify(data, null, 2));
}
run();
