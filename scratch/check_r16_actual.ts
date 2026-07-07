import { buildFullKnockoutBracket } from "../lib/knockout";
import { generateGroupFixtures } from "../lib/fixtures";

// Let's mock fetching rawMatches from Supabase or live scores API if possible,
// or we can query the actual database to see what results we have for R32 matches!
// But wait! We can just fetch the R32 matches and their scores from Supabase to see who won.
// Or we can just run buildFullKnockoutBracket by querying the database for all matches!

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key: string) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Let's query player_stage_stats or check if there is a match results table.
  // Wait, there is no match_results table. The scores are parsed from the live scores API!
  // But wait, the live scores API is queried from Football-Data.org.
  // What does the client do?
  // Let's run a fetch to /api/live-scores and see what it returns!
}
run();
