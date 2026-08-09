import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Deleting bot_% profiles...");
  const { data: data1, error: error1 } = await supabaseAdmin
    .from("profiles")
    .delete()
    .like("user_id", "bot_%");
  
  if (error1) console.error("Error 1:", error1);
  else console.log("Deleted bot_%:", data1);

  console.log("Deleting statmatik_bot profiles...");
  const { data: data2, error: error2 } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("user_id", "statmatik_bot");

  if (error2) console.error("Error 2:", error2);
  else console.log("Deleted statmatik_bot:", data2);
}

run();
