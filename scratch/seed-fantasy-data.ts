import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      let key = match[1];
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      process.env[key] = val;
    }
  });
}

// Re-read service role key construction
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (serviceKey && serviceKey.includes(".")) {
  try {
    const parts = serviceKey.split(".");
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], "base64").toString("utf8");
      const claims = JSON.parse(payload);
      if (claims && claims.ref) {
        supabaseUrl = `https://${claims.ref}.supabase.co`;
      }
    }
  } catch (e) {
    console.error("JWT parse error:", e);
  }
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Position mapping helper
function getGeneralPosition(pos: string): "GK" | "DEF" | "MID" | "FWD" {
  const p = pos?.toLowerCase() || "";
  if (p.includes("kaleci")) return "GK";
  if (p.includes("defans") || p.includes("bek") || p.includes("stoper")) return "DEF";
  if (p.includes("orta saha") || p.includes("libero") || p.includes("midfielder")) return "MID";
  if (p.includes("açık")) return "MID";
  if (p.includes("forvet")) return "FWD";
  return "FWD";
}

async function seed() {
  console.log("=== FANTEZİ KADRO TEST SEEDER BAŞLATILDI ===");
  console.log("Supabase URL:", supabaseUrl);

  try {
    // 1. Fetch players from team_rosters
    console.log("Fetching team rosters players...");
    const { data: players, error: fetchPlayersErr } = await supabaseAdmin
      .from("team_rosters")
      .select("id, team_id, player_position");

    if (fetchPlayersErr || !players || players.length === 0) {
      console.error("Error: team_rosters table is empty! Please seed team rosters first.", fetchPlayersErr);
      return;
    }

    console.log(`Found ${players.length} players in team_rosters.`);

    const gks = players.filter((p) => getGeneralPosition(p.player_position) === "GK");
    const defs = players.filter((p) => getGeneralPosition(p.player_position) === "DEF");
    const mids = players.filter((p) => getGeneralPosition(p.player_position) === "MID");
    const fwds = players.filter((p) => getGeneralPosition(p.player_position) === "FWD");

    console.log(`Distribution: GK: ${gks.length}, DEF: ${defs.length}, MID: ${mids.length}, FWD: ${fwds.length}`);

    if (gks.length < 5 || defs.length < 20 || mids.length < 20 || fwds.length < 10) {
      console.error("Insufficient players in team_rosters to seed valid rosters.");
      return;
    }

    // Clean existing fantasy records to reset state
    console.log("Cleaning old fantasy data...");
    await supabaseAdmin.from("fantasy_duels").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("fantasy_rosters").delete().neq("user_id", "invalid_placeholder");
    await supabaseAdmin.from("fantasy_duel_standings").delete().neq("user_id", "invalid_placeholder");
    await supabaseAdmin.from("player_stage_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("manager_stage_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Generate 31 Mock Profiles and Roster Teams
    console.log("Generating 31 mock profiles and rosters...");
    const selectedPlayerIds = new Set<string>();

    for (let i = 1; i <= 31; i++) {
      const mockUserId = `user_mock_${i}`;
      const mockEmail = `mock_user_${i}@statmatik-test.com`;
      const mockNickname = `FanteziKoçu_${i}`;

      // Insert or Update profile manually to avoid constraint issues on user_id
      let profileErr = null;
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", mockUserId)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            email: mockEmail,
            nickname: mockNickname,
          })
          .eq("user_id", mockUserId);
        profileErr = error;
      } else {
        const { error } = await supabaseAdmin
          .from("profiles")
          .insert({
            user_id: mockUserId,
            email: mockEmail,
            nickname: mockNickname,
          });
        profileErr = error;
      }

      if (profileErr) {
        console.error(`Failed to seed profile for ${mockUserId}:`, profileErr);
        continue;
      }

      // Pick standard 4-4-2 starters (1 GK, 4 DEF, 4 MID, 2 FWD)
      // Pick random players from lists
      const pickedGk = gks[Math.floor(Math.random() * gks.length)].id;
      const pickedDefs = Array.from({ length: 4 }).map(() => defs[Math.floor(Math.random() * defs.length)].id);
      const pickedMids = Array.from({ length: 4 }).map(() => mids[Math.floor(Math.random() * mids.length)].id);
      const pickedFwds = Array.from({ length: 2 }).map(() => fwds[Math.floor(Math.random() * fwds.length)].id);

      const starters = [pickedGk, ...pickedDefs, ...pickedMids, ...pickedFwds];
      starters.forEach((id) => selectedPlayerIds.add(id));

      // Pick 2 bench slots
      const bench = [
        mids[Math.floor(Math.random() * mids.length)].id,
        defs[Math.floor(Math.random() * defs.length)].id,
      ];
      bench.forEach((id) => selectedPlayerIds.add(id));

      const mockTeamName = `${mockNickname} United`;
      const managerId = ["tur", "bra", "arg", "fra", "ger", "eng", "esp", "ita"][Math.floor(Math.random() * 8)];

      // Insert roster
      const { error: rosterErr } = await supabaseAdmin.from("fantasy_rosters").insert({
        user_id: mockUserId,
        team_name: mockTeamName,
        stage: "matchday_1",
        formation: "4-4-2",
        starters,
        bench,
        manager_id: managerId,
        points: 0,
        team_index: 1,
      });

      if (rosterErr) {
        console.error(`Failed to insert roster for mock user ${i}:`, rosterErr);
      }
    }

    // 3. Seed player_stage_stats for all picked players to calculate actual scoring
    console.log(`Seeding stats for ${selectedPlayerIds.size} unique selected players...`);
    const statsInserts = Array.from(selectedPlayerIds).map((pid) => {
      const goals = Math.random() > 0.8 ? (Math.random() > 0.9 ? 2 : 1) : 0;
      const assists = Math.random() > 0.85 ? 1 : 0;
      const yellow = Math.random() > 0.8 ? 1 : 0;
      const red = Math.random() > 0.97 ? 1 : 0;
      const conceded = Math.floor(Math.random() * 3);
      const clean = conceded === 0 && Math.random() > 0.4;
      const saves = Math.floor(Math.random() * 6);

      return {
        player_id: pid,
        stage: "matchday_1",
        goals,
        assists,
        yellow_cards: yellow,
        red_cards: red,
        clean_sheet: clean,
        minutes_played: 90,
        team_result: conceded === 0 ? "win" : conceded === 1 ? "draw" : "loss",
        goals_conceded: conceded,
        goal_difference: conceded === 0 ? 2 : conceded === 1 ? 0 : -2,
        saves,
      };
    });

    const { error: statsErr } = await supabaseAdmin
      .from("player_stage_stats")
      .insert(statsInserts);

    if (statsErr) {
      console.error("Failed to seed player stage stats:", statsErr);
    } else {
      console.log("Successfully seeded player stage stats.");
    }

    // 4. Seed manager_stage_stats
    console.log("Seeding manager stage stats...");
    const managers = ["tur", "bra", "arg", "fra", "ger", "eng", "esp", "ita"];
    const managerInserts = managers.map((mid) => {
      const results = ["win", "draw", "loss"];
      const result = results[Math.floor(Math.random() * 3)];
      return {
        manager_id: mid,
        stage: "matchday_1",
        result,
        goal_difference: result === "win" ? 2 : result === "draw" ? 0 : -2,
      };
    });

    const { error: managerStatsErr } = await supabaseAdmin
      .from("manager_stage_stats")
      .insert(managerInserts);

    if (managerStatsErr) {
      console.error("Failed to seed manager stage stats:", managerStatsErr);
    }

    // 5. Trigger H2H Matchmaking and Score Calculations via Fetch calls
    console.log("Triggering matchmaking and score calculation...");
    try {
      // Force local URL to hit the Next.js dev server if running
      const triggerRes = await fetch("http://localhost:3000/api/fantasy/trigger-matchday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": "minmat_odul_2026",
        },
        body: JSON.stringify({
          stage: "matchday_1",
          action: "all",
        }),
      });

      if (triggerRes.ok) {
        const data = await triggerRes.json();
        console.log("Trigger output reports:", data.reports);
        console.log("=== TEST DATA SEEDING COMPLETED SUCCESSFULLY ===");
      } else {
        console.warn("API trigger returned non-200 status. Note: To run score calculations, run `npm run dev` and trigger '/api/fantasy/trigger-matchday' via the Admin panel in your browser!");
      }
    } catch (fetchErr) {
      console.log("API trigger was offline or local server is not running yet. This is completely normal!");
      console.log("Note: To run H2H matchmaking and score calculations, run `npm run dev`, go to /fantasy page, bypass the teaser lock using the admin code, and click 'Hepsini Tetikle' from the top Admin Panel!");
      console.log("=== SEEDING COMPLETED SUCCESSFULLY (MATCHMAKING PENDING API RUN) ===");
    }
  } catch (e: any) {
    console.error("Seeder script failed with error:", e);
  }
}

seed();
