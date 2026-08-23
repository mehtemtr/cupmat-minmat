import { supabaseAdmin } from './lib/supabase';
async function run() {
  const { data, error } = await supabaseAdmin.from('cupmat_matches').select('*').gte('date', '2026-08-18T00:00:00Z').lte('date', '2026-08-19T23:59:59Z');
  console.log("Error:", error);
  console.log(JSON.stringify(data, null, 2));
}
run();
