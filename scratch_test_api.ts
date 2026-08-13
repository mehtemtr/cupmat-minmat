import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Since api-football-cupmat is written in TS, let's just use fetch directly to see if API-Sports has the data for 2026-08-12

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_URL = "https://v3.football.api-sports.io";

async function run() {
  const targetDate = "2026-08-12";
  console.log("Fetching API for", targetDate);
  try {
    const response = await fetch(`${API_URL}/fixtures?date=${targetDate}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": API_FOOTBALL_KEY,
      },
    });
    
    if (!response.ok) {
        console.error("API error", response.status);
        return;
    }
    const data = await response.json();
    const fixtures = data.response || [];
    
    console.log(`Total fixtures found globally: ${fixtures.length}`);
    
    const TARGET_LEAGUES = [2, 3, 848, 73, 13, 17, 18, 11, 12, 20, 16, 15, 5, 34, 32, 68];
    const targetFixtures = fixtures.filter((f: any) => TARGET_LEAGUES.includes(f.league.id));
    console.log(`Target continental fixtures found: ${targetFixtures.length}`);
    
    for (const item of targetFixtures) {
        console.log(`- League: ${item.league.id} | Match: ${item.teams.home.name} ${item.goals.home}-${item.goals.away} ${item.teams.away.name} [Status: ${item.fixture.status.short}]`);
    }
  } catch (e) {
      console.error(e);
  }
}
run();
