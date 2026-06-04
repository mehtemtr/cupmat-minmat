import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";

// Identifiers
const SOURCE_USER_ID = "user_3E1moQp7w4ETZnBAGPLuFjIQjr0";
const TARGET_USER_ID = "user_3ESNMt3VVkj9ixjcPx2fH4gdRDp";

const SOURCE_EMAIL = "";
const SOURCE_DISPLAY_NAME = "ismail toptaş";

const TARGET_EMAIL = "ismail.huzursokagi@gmail.com";
const TARGET_DISPLAY_NAME = "ismail_toptas";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  let envJwt: string | undefined;

  // First pass: find the valid JWT from .env
  const envPathDefault = path.join(dir, ".env");
  if (fs.existsSync(envPathDefault)) {
    const lines = fs.readFileSync(envPathDefault, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[1] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
        if (val.trim().includes(".")) {
          envJwt = val.trim();
        }
      }
    }
  }

  for (const file of envFiles) {
    const envPath = path.join(dir, file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().startsWith("#")) continue;
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      }
    }
  }

  if (envJwt && (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("."))) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = envJwt;
  }
}

async function main() {
  loadEnv();
  const { supabaseAdmin } = await import("../lib/supabase");

  const args = process.argv.slice(2);
  const isLive = args.includes("--live");

  console.log(`=== RUNNING USER ACCOUNT MERGE (${isLive ? "LIVE" : "DRY-RUN"}) ===`);
  console.log(`Source: ${SOURCE_USER_ID} ("${SOURCE_DISPLAY_NAME}")`);
  console.log(`Target: ${TARGET_USER_ID} ("${TARGET_DISPLAY_NAME}" <${TARGET_EMAIL}>)`);
  console.log("-----------------------------------------");

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  // 1. REDIS: gamification_store
  console.log("\n[1/4] Processing Redis gamification_store...");
  const gamificationKey = "gamification_store";
  const gamificationStore = await redis.get(gamificationKey) as any;

  if (!gamificationStore || !gamificationStore.userActivities) {
    console.error("❌ Error: gamification_store or userActivities not found in Redis!");
    return;
  }

  const u1Index = gamificationStore.userActivities.findIndex((u: any) => u.userId === SOURCE_USER_ID);
  const u2Index = gamificationStore.userActivities.findIndex((u: any) => u.userId === TARGET_USER_ID);

  let u1 = u1Index >= 0 ? gamificationStore.userActivities[u1Index] : null;
  let u2 = u2Index >= 0 ? gamificationStore.userActivities[u2Index] : null;

  if (!u1) {
    console.log(`⚠️ Source user ${SOURCE_USER_ID} not found in gamification_store (already merged or non-existent).`);
  }
  if (!u2) {
    console.log(`ℹ️ Target user ${TARGET_USER_ID} not found in gamification_store, will initialize default.`);
    u2 = {
      userId: TARGET_USER_ID,
      displayName: TARGET_DISPLAY_NAME,
      email: TARGET_EMAIL,
      taraftarPuani: 0,
      gunlukGirisSayisi: 0,
      sonGirisTarihi: "",
      minmatEkSure: 0,
      tahminGuncellemeHakki: 0,
      yardimTiklandi: false,
      hakkindaTiklandi: false,
      mevcutPeriyotPuani: 0,
      genelTahminHakkiKullanildi: false,
      minmatOyunSayisiBugun: 0,
      lastClerkLoginAt: null,
      activeSecondsInPeriod: 0,
      periyotOdulMinmatSaniyeSeviye: 0,
      periyotOdulMinmatPuanSeviye: 0,
      periyotOdulCupmatGlobalPuan: 0,
      periyotOdulGecerliBitis: '',
      cupMatRewardSeconds: 0,
      cupMatRewardPoints: 0,
      minmatMaxLevels: { add: 1, sub: 1, mul: 1, div: 1, mix: 1 },
      minmatUnlockedModes: { sub: false, mul: false, div: false, mix: false },
      minmatGamesPlayedCount: { add: 0, sub: 0, mul: 0, div: 0, mix: 0 },
      lastPageStayClaimAt: "",
      pageStayClaimsTodayCount: 0,
      pageStayHistory: {}
    };
  }

  const getLatestDate = (d1?: string | null, d2?: string | null) => {
    if (!d1) return d2 || "";
    if (!d2) return d1 || "";
    return new Date(d1) > new Date(d2) ? d1 : d2;
  };

  if (u1) {
    console.log("Found source user stats:", {
      displayName: u1.displayName,
      taraftarPuani: u1.taraftarPuani,
      mevcutPeriyotPuani: u1.mevcutPeriyotPuani,
      minmatEkSure: u1.minmatEkSure,
      minmatMaxLevels: u1.minmatMaxLevels
    });

    const mergedUser = {
      ...u2,
      displayName: TARGET_DISPLAY_NAME,
      email: TARGET_EMAIL,
      taraftarPuani: (u2.taraftarPuani || 0) + (u1.taraftarPuani || 0),
      gunlukGirisSayisi: Math.max(u2.gunlukGirisSayisi || 0, u1.gunlukGirisSayisi || 0),
      sonGirisTarihi: getLatestDate(u2.sonGirisTarihi, u1.sonGirisTarihi),
      minmatEkSure: (u2.minmatEkSure || 0) + (u1.minmatEkSure || 0),
      tahminGuncellemeHakki: (u2.tahminGuncellemeHakki || 0) + (u1.tahminGuncellemeHakki || 0),
      yardimTiklandi: u2.yardimTiklandi || u1.yardimTiklandi,
      hakkindaTiklandi: u2.hakkindaTiklandi || u1.hakkindaTiklandi,
      mevcutPeriyotPuani: (u2.mevcutPeriyotPuani || 0) + (u1.mevcutPeriyotPuani || 0),
      genelTahminHakkiKullanildi: u2.genelTahminHakkiKullanildi || u1.genelTahminHakkiKullanildi,
      minmatOyunSayisiBugun: (u2.minmatOyunSayisiBugun || 0) + (u1.minmatOyunSayisiBugun || 0),
      lastClerkLoginAt: getLatestDate(u2.lastClerkLoginAt, u1.lastClerkLoginAt),
      activeSecondsInPeriod: (u2.activeSecondsInPeriod || 0) + (u1.activeSecondsInPeriod || 0),
      periyotOdulMinmatSaniyeSeviye: Math.max(u2.periyotOdulMinmatSaniyeSeviye || 0, u1.periyotOdulMinmatSaniyeSeviye || 0),
      periyotOdulMinmatPuanSeviye: Math.max(u2.periyotOdulMinmatPuanSeviye || 0, u1.periyotOdulMinmatPuanSeviye || 0),
      periyotOdulCupmatGlobalPuan: (u2.periyotOdulCupmatGlobalPuan || 0) + (u1.periyotOdulCupmatGlobalPuan || 0),
      periyotOdulGecerliBitis: u2.periyotOdulGecerliBitis || u1.periyotOdulGecerliBitis,
      minmatMaxLevels: {
        add: Math.max((u2.minmatMaxLevels?.add || 1), (u1.minmatMaxLevels?.add || 1)),
        sub: Math.max((u2.minmatMaxLevels?.sub || 1), (u1.minmatMaxLevels?.sub || 1)),
        mul: Math.max((u2.minmatMaxLevels?.mul || 1), (u1.minmatMaxLevels?.mul || 1)),
        div: Math.max((u2.minmatMaxLevels?.div || 1), (u1.minmatMaxLevels?.div || 1)),
        mix: Math.max((u2.minmatMaxLevels?.mix || 1), (u1.minmatMaxLevels?.mix || 1)),
      },
      minmatUnlockedModes: {
        sub: u2.minmatUnlockedModes?.sub || u1.minmatUnlockedModes?.sub || false,
        mul: u2.minmatUnlockedModes?.mul || u1.minmatUnlockedModes?.mul || false,
        div: u2.minmatUnlockedModes?.div || u1.minmatUnlockedModes?.div || false,
        mix: u2.minmatUnlockedModes?.mix || u1.minmatUnlockedModes?.mix || false,
      },
      minmatGamesPlayedCount: {
        add: (u2.minmatGamesPlayedCount?.add || 0) + (u1.minmatGamesPlayedCount?.add || 0),
        sub: (u2.minmatGamesPlayedCount?.sub || 0) + (u1.minmatGamesPlayedCount?.sub || 0),
        mul: (u2.minmatGamesPlayedCount?.mul || 0) + (u1.minmatGamesPlayedCount?.mul || 0),
        div: (u2.minmatGamesPlayedCount?.div || 0) + (u1.minmatGamesPlayedCount?.div || 0),
        mix: (u2.minmatGamesPlayedCount?.mix || 0) + (u1.minmatGamesPlayedCount?.mix || 0),
      },
      lastPageStayClaimAt: getLatestDate(u2.lastPageStayClaimAt, u1.lastPageStayClaimAt),
      pageStayClaimsTodayCount: Math.max(u2.pageStayClaimsTodayCount || 0, u1.pageStayClaimsTodayCount || 0),
      pageStayHistory: { ...(u2.pageStayHistory || {}), ...(u1.pageStayHistory || {}) }
    };

    console.log("Merged target stats:", mergedUser);

    // Update arrays in gamificationStore
    if (u2Index >= 0) {
      gamificationStore.userActivities[u2Index] = mergedUser;
    } else {
      gamificationStore.userActivities.push(mergedUser);
    }

    // Remove source user
    gamificationStore.userActivities.splice(u1Index, 1);
    console.log(`Source user removed from userActivities.`);

    // Rename past champions user ID if exists
    if (gamificationStore.gecmisSampiyonlar) {
      let renamedCount = 0;
      gamificationStore.gecmisSampiyonlar.forEach((c: any) => {
        if (c.userId === SOURCE_USER_ID) {
          c.userId = TARGET_USER_ID;
          c.displayName = TARGET_DISPLAY_NAME;
          renamedCount++;
        }
      });
      if (renamedCount > 0) {
        console.log(`Renamed ${renamedCount} past champions entries from source to target.`);
      }
    }

    if (isLive) {
      await redis.set(gamificationKey, gamificationStore);
      console.log("✅ Successfully saved gamification_store changes to Redis!");
    } else {
      console.log("⏳ [DRY-RUN] Redis gamification_store write skipped.");
    }
  } else {
    console.log("No changes needed in Redis gamification_store since source user was not found.");
    // In case target displayName is not updated to ismail_toptas in Redis, let's update it!
    if (u2Index >= 0 && gamificationStore.userActivities[u2Index].displayName !== TARGET_DISPLAY_NAME) {
      gamificationStore.userActivities[u2Index].displayName = TARGET_DISPLAY_NAME;
      if (isLive) {
        await redis.set(gamificationKey, gamificationStore);
        console.log("✅ Successfully updated target user displayName to ismail_toptas in Redis!");
      } else {
        console.log(`⏳ [DRY-RUN] Would update target user displayName in Redis to: ${TARGET_DISPLAY_NAME}`);
      }
    }
  }

  // 2. REDIS: cupmat_leaderboard (Predictions)
  console.log("\n[2/4] Processing Redis cupmat_leaderboard...");
  const leaderboardKey = "cupmat_leaderboard";
  const leaderboardStore = await redis.get(leaderboardKey) as any[];

  if (leaderboardStore && Array.isArray(leaderboardStore)) {
    const l1Index = leaderboardStore.findIndex((s) => s.userId === SOURCE_USER_ID);
    const l2Index = leaderboardStore.findIndex((s) => s.userId === TARGET_USER_ID);

    const l1 = l1Index >= 0 ? leaderboardStore[l1Index] : null;
    const l2 = l2Index >= 0 ? leaderboardStore[l2Index] : null;

    if (l1) {
      console.log("Found source user tournament submission in leaderboardStore:", {
        points: l1.points,
        predictionsCount: Object.keys(l1.matchPredictions || {}).length,
        submittedAt: l1.submittedAt
      });

      if (l2) {
        console.log("Found target user tournament submission in leaderboardStore:", {
          points: l2.points,
          predictionsCount: Object.keys(l2.matchPredictions || {}).length,
          submittedAt: l2.submittedAt
        });

        // Merge match predictions
        const mergedPredictions = {
          ...(l2.matchPredictions || {}),
          ...(l1.matchPredictions || {})
        };

        const mergedSubmission = {
          ...l2,
          displayName: TARGET_DISPLAY_NAME,
          matchPredictions: mergedPredictions,
          points: Math.max(l2.points || 0, l1.points || 0),
          groupsComplete: l2.groupsComplete || l1.groupsComplete,
          submittedAt: getLatestDate(l2.submittedAt, l1.submittedAt)
        };

        leaderboardStore[l2Index] = mergedSubmission;
        console.log("Merged predictions count:", Object.keys(mergedPredictions).length);
      } else {
        // Change source to target
        const movedSubmission = {
          ...l1,
          userId: TARGET_USER_ID,
          displayName: TARGET_DISPLAY_NAME
        };
        leaderboardStore.push(movedSubmission);
        console.log(`Moved prediction submission from source ID to target ID.`);
      }

      // Remove source submission
      leaderboardStore.splice(l1Index, 1);

      if (isLive) {
        await redis.set(leaderboardKey, leaderboardStore);
        console.log("✅ Successfully saved cupmat_leaderboard changes to Redis!");
      } else {
        console.log("⏳ [DRY-RUN] Redis cupmat_leaderboard write skipped.");
      }
    } else {
      console.log("No predictions found for source user.");
      // Just make sure target gets their displayName updated if they exist
      if (l2 && l2.displayName !== TARGET_DISPLAY_NAME) {
        l2.displayName = TARGET_DISPLAY_NAME;
        if (isLive) {
          await redis.set(leaderboardKey, leaderboardStore);
          console.log("✅ Successfully updated target user displayName in cupmat_leaderboard.");
        } else {
          console.log(`⏳ [DRY-RUN] Would update target user displayName in cupmat_leaderboard to: ${TARGET_DISPLAY_NAME}`);
        }
      }
    }
  } else {
    console.log("No tournament submissions found in cupmat_leaderboard.");
  }

  // 3. SUPABASE: profiles
  console.log("\n[3/4] Processing Supabase profiles...");
  const { data: profiles, error: pError } = await supabaseAdmin.from("profiles").select("*");
  if (pError) {
    console.error("❌ Error fetching profiles:", pError);
  } else {
    const p1 = profiles?.find(p => p.user_id === SOURCE_USER_ID);
    const p2 = profiles?.find(p => p.user_id === TARGET_USER_ID);

    if (p2) {
      console.log("Found target user profile, updating nickname and email:", p2);
      const updatedTarget = {
        nickname: TARGET_DISPLAY_NAME,
        email: TARGET_EMAIL
      };

      if (isLive) {
        const { error: uError } = await supabaseAdmin
          .from("profiles")
          .update(updatedTarget)
          .eq("user_id", TARGET_USER_ID);
        if (uError) {
          console.error("❌ Error updating target profile:", uError);
        } else {
          console.log("✅ Target profile updated.");
        }
      } else {
        console.log(`⏳ [DRY-RUN] Would update target profile fields to:`, updatedTarget);
      }

      if (p1) {
        if (isLive) {
          const { error: dError } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("user_id", SOURCE_USER_ID);
          if (dError) {
            console.error("❌ Error deleting source profile:", dError);
          } else {
            console.log("✅ Source profile deleted.");
          }
        } else {
          console.log(`⏳ [DRY-RUN] Would delete source profile: ${SOURCE_USER_ID}`);
        }
      }
    } else {
      if (p1) {
        console.log("Target profile not found but source profile found. Moving source profile to target...");
        if (isLive) {
          const { error: uError } = await supabaseAdmin
            .from("profiles")
            .update({ user_id: TARGET_USER_ID, email: TARGET_EMAIL, nickname: TARGET_DISPLAY_NAME })
            .eq("user_id", SOURCE_USER_ID);
          if (uError) {
            console.error("❌ Error moving profile user_id:", uError);
          } else {
            console.log("✅ Moved profile from source user_id to target user_id.");
          }
        } else {
          console.log(`⏳ [DRY-RUN] Would update source profile user_id, email, and nickname to target's.`);
        }
      } else {
        console.log("Neither source nor target profile found in Supabase profiles. Creating new profile for target user...");
        if (isLive) {
          const { error: iError } = await supabaseAdmin
            .from("profiles")
            .insert({
              user_id: TARGET_USER_ID,
              email: TARGET_EMAIL,
              nickname: TARGET_DISPLAY_NAME
            });
          if (iError) {
            console.error("❌ Error creating target profile:", iError);
          } else {
            console.log("✅ Target profile created.");
          }
        } else {
          console.log(`⏳ [DRY-RUN] Would create new target profile: ${TARGET_USER_ID} / ${TARGET_DISPLAY_NAME}`);
        }
      }
    }
  }

  // 4. SUPABASE: minmat_leaderboard
  console.log("\n[4/4] Processing Supabase minmat_leaderboard scores...");
  const { data: scores, error: scError } = await supabaseAdmin.from("minmat_leaderboard").select("*");
  if (scError) {
    console.error("❌ Error fetching minmat leaderboard:", scError);
  } else {
    // Find all rows where email or name matches source
    const matchingScores = scores?.filter(s => 
      (SOURCE_EMAIL && s.email === SOURCE_EMAIL) || 
      s.name === SOURCE_DISPLAY_NAME
    ) || [];
    console.log(`Found ${matchingScores.length} matching score rows for source user.`);

    if (matchingScores.length > 0) {
      if (isLive) {
        let successCount = 0;
        for (const row of matchingScores) {
          const { error: updError } = await supabaseAdmin
            .from("minmat_leaderboard")
            .update({
              email: TARGET_EMAIL,
              name: TARGET_DISPLAY_NAME
            })
            .eq("id", row.id);
          
          if (updError) {
            console.error(`❌ Error updating score row ID ${row.id}:`, updError);
          } else {
            successCount++;
          }
        }
        console.log(`✅ Successfully updated ${successCount}/${matchingScores.length} Minmat scores to target user.`);
      } else {
        console.log(`⏳ [DRY-RUN] Would update ${matchingScores.length} minmat_leaderboard rows with target email and name.`);
      }
    }
  }

  console.log("\n-----------------------------------------");
  console.log(`=== ACCOUNT MERGE PROCESS COMPLETED (${isLive ? "LIVE SUCCESS" : "DRY-RUN COMPLETE"}) ===`);
}

main().catch(console.error);
