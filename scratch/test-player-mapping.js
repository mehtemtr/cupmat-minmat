const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    envVars[key] = value.trim();
  }
});

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Import static teams/players
const { getAllPlayers } = require('../data/teams');

async function main() {
  const staticPlayers = getAllPlayers();
  const dbPlayers = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("id, team_id, player_name, player_position")
      .range(from, to);

    if (error) {
      console.error("Error fetching db players:", error);
      return;
    }

    if (data && data.length > 0) {
      dbPlayers.push(...data);
      if (data.length < 1000) {
        hasMore = false;
      } else {
        from += 1000;
        to += 1000;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Static players count: ${staticPlayers.length}`);
  console.log(`Database players count: ${dbPlayers.length}`);

  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]/g, "");
  };

  const dbPlayerMap = {};
  if (dbPlayers) {
    dbPlayers.forEach((p) => {
      const tId = p.team_id.toLowerCase();
      if (!dbPlayerMap[tId]) dbPlayerMap[tId] = [];
      dbPlayerMap[tId].push(p);
    });
  }

  let matched = 0;
  let unmatched = [];

  staticPlayers.forEach((sp) => {
    const tId = sp.teamId.toLowerCase();
    const candidates = dbPlayerMap[tId] || [];
    const spNorm = normalizeName(sp.name);

    // Try exact normalized match
    let match = candidates.find((c) => normalizeName(c.player_name) === spNorm);

    // Try partial containment match if no exact match
    if (!match) {
      match = candidates.find((c) => {
        const cNorm = normalizeName(c.player_name);
        return cNorm.includes(spNorm) || spNorm.includes(cNorm);
      });
    }

    if (match) {
      matched++;
    } else {
      unmatched.push(sp);
    }
  });

  console.log(`Successfully matched: ${matched} / ${staticPlayers.length}`);
  console.log(`Unmatched count: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("Some unmatched players:");
    unmatched.slice(0, 15).forEach((p) => {
      console.log(`- ID: ${p.id}, Team: ${p.teamId}, Name: ${p.name}`);
    });
  }
}

main();
