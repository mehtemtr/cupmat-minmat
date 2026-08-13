import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndStoreDailyMatches } from './lib/api-football-cupmat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function run() {
  console.log("Syncing Aug 11...");
  await fetchAndStoreDailyMatches("2026-08-11");
  console.log("Syncing Aug 12...");
  await fetchAndStoreDailyMatches("2026-08-12");
  console.log("Syncing Aug 13...");
  await fetchAndStoreDailyMatches("2026-08-13");
  console.log("Done.");
}
run();
