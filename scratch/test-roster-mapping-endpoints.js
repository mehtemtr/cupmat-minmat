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

async function getPlayerMapping() {
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
      break;
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

  const staticToUuid = {};
  const uuidToStatic = {};

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
  dbPlayers.forEach((p) => {
    const tId = p.team_id.toLowerCase();
    if (!dbPlayerMap[tId]) dbPlayerMap[tId] = [];
    dbPlayerMap[tId].push(p);
  });

  const missingPlayers = [];

  for (const sp of staticPlayers) {
    const tId = sp.teamId.toLowerCase();
    const candidates = dbPlayerMap[tId] || [];
    const spNorm = normalizeName(sp.name);

    let match = candidates.find((c) => normalizeName(c.player_name) === spNorm);

    if (!match) {
      match = candidates.find((c) => {
        const cNorm = normalizeName(c.player_name);
        return cNorm.includes(spNorm) || spNorm.includes(cNorm);
      });
    }

    if (match) {
      staticToUuid[sp.id] = match.id;
      uuidToStatic[match.id] = sp.id;
    } else {
      missingPlayers.push(sp);
    }
  }

  if (missingPlayers.length > 0) {
    console.log(`Inserting ${missingPlayers.length} missing players...`);
    for (const sp of missingPlayers) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("team_rosters")
        .insert({
          team_id: sp.teamId,
          player_name: sp.name,
          player_position: sp.position === "GK" ? "Kaleci" : sp.position === "DF" ? "Defans" : sp.position === "MF" ? "Orta Saha" : "Forvet",
          player_number: 99,
          club: sp.club || "Serbest"
        })
        .select("id")
        .maybeSingle();

      if (insertError) {
        console.error(`Failed to insert ${sp.name}:`, insertError);
      } else if (inserted) {
        staticToUuid[sp.id] = inserted.id;
        uuidToStatic[inserted.id] = sp.id;
      }
    }
  }

  return { staticToUuid, uuidToStatic };
}

function translateToUuid(id, mapping) {
  if (!id) return null;
  if (id.length === 36 && id.includes("-")) return id;
  return mapping.staticToUuid[id] || null;
}

function translateToStatic(id, mapping) {
  if (!id) return null;
  if (id.includes("-p")) return id;
  return mapping.uuidToStatic[id] || null;
}

async function runTest() {
  const mapping = await getPlayerMapping();
  
  // Test 1: Map static IDs to UUIDs
  const clientStarters = ["tur-p1", "tur-p2", "tur-p3", "tur-p4", "tur-p5", "tur-p6", "tur-p7", "tur-p8", "tur-p9", "tur-p10", "tur-p11"];
  const starters = clientStarters.map(id => translateToUuid(id, mapping));
  console.log("Client Starters (static):", clientStarters);
  console.log("Mapped Starters (UUID):", starters);

  // Check if any mapped starters are null
  const hasNulls = starters.some(id => id === null);
  console.log("Has null mapped IDs:", hasNulls);

  // Test 2: Map UUIDs back to static IDs
  const recoveredStarters = starters.map(id => translateToStatic(id, mapping));
  console.log("Recovered Starters (static):", recoveredStarters);

  const matchedAll = clientStarters.every((val, index) => val === recoveredStarters[index]);
  console.log("Did recovered starters match original starters 100%?", matchedAll);
}

runTest();
