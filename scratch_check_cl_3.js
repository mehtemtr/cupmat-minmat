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
    // CL api_id is 2
    const { data: tour } = await supabase.from('cupmat_tournaments').select('id').eq('api_id', 2).single();
    if (!tour) return;
    
    const { data, error } = await supabase.from('cupmat_matches')
        .select('*')
        .eq('tournament_id', tour.id)
        .like('round', '%3. Ön Eleme%')
        .order('date', { ascending: false });

    if (error) console.error(error);
    else console.log(data);
}
run();
