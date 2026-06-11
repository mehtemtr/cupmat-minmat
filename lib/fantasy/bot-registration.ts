import { supabaseAdmin } from "../supabase";

export interface BotProfile {
  userId: string;
  email: string;
  nickname: string;
  teamName: string;
  country: string;
  formation: string;
}

export const STAGE_START_DATES: Record<string, string> = {
  matchday_1: "2026-06-08T19:23:00+03:00",
  matchday_2: "2026-06-13T19:00:00+03:00",
  matchday_3: "2026-06-18T19:00:00+03:00",
  round_of_32: "2026-06-23T19:00:00+03:00",
  round_of_16: "2026-06-27T19:00:00+03:00",
  quarter_finals: "2026-07-01T19:00:00+03:00",
  semi_finals: "2026-07-05T19:00:00+03:00",
  finals: "2026-07-09T19:00:00+03:00",
};

export const BOT_POOL: BotProfile[] = [
  // --- REALISTIC TURKISH BOTS ---
  {
    userId: "bot_user_tr_1",
    email: "kaan.y@cupmat.com",
    nickname: "KaanYalcin",
    teamName: "Boğazın Kaplanları",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_2",
    email: "serkan.k@cupmat.com",
    nickname: "SerkanKartal",
    teamName: "Kadıköy Rüzgarı",
    country: "tur",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_tr_3",
    email: "yasin.a@cupmat.com",
    nickname: "YasinAslan",
    teamName: "Aslan Yuvası",
    country: "tur",
    formation: "3-5-2"
  },
  {
    userId: "bot_user_tr_4",
    email: "mert.f@cupmat.com",
    nickname: "MertFener",
    teamName: "Sarı Kanaryalar",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_5",
    email: "cemil.f@cupmat.com",
    nickname: "CemilFirtina",
    teamName: "Trabzon Gücü",
    country: "tur",
    formation: "4-2-3-1"
  },
  {
    userId: "bot_user_tr_6",
    email: "yigit.s@cupmat.com",
    nickname: "YigitSelcuk",
    teamName: "Anadolu Kartalları",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_7",
    email: "hakan.d@cupmat.com",
    nickname: "HakanDeha",
    teamName: "Taktik United",
    country: "tur",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_tr_8",
    email: "alperen.e@cupmat.com",
    nickname: "AlperenEfsane",
    teamName: "Karadeniz Fırtınası",
    country: "tur",
    formation: "3-5-2"
  },
  {
    userId: "bot_user_tr_9",
    email: "burak.y@cupmat.com",
    nickname: "BurakYilmaz99",
    teamName: "Liman Spor",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_10",
    email: "umut.b@cupmat.com",
    nickname: "UmutBulut",
    teamName: "Ankara Gücü",
    country: "tur",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_tr_11",
    email: "omer.c@cupmat.com",
    nickname: "OmerCelik",
    teamName: "Zirve Yolcuları",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_12",
    email: "selim.a@cupmat.com",
    nickname: "SelimAksoy",
    teamName: "Ege Fırtınası",
    country: "tur",
    formation: "4-2-3-1"
  },
  {
    userId: "bot_user_tr_13",
    email: "tolgahan.a@cupmat.com",
    nickname: "TolgahanAslan",
    teamName: "Toros Kaplanları",
    country: "tur",
    formation: "3-4-3"
  },

  // --- OBVIOUS BOT PROFILES (3-5 bots) ---
  {
    userId: "bot_user_ai_1",
    email: "ai.taktik@cupmat.com",
    nickname: "TaktikBot_AI",
    teamName: "Robo Coach FC",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_ai_2",
    email: "ai.cupmat@cupmat.com",
    nickname: "CUPMAT_Algoritma",
    teamName: "Binary Striker FC",
    country: "usa",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_ai_3",
    email: "ai.coach@cupmat.com",
    nickname: "AI_Coach_2026",
    teamName: "Neural Network Athletic",
    country: "ger",
    formation: "3-5-2"
  },
  {
    userId: "bot_user_ai_4",
    email: "ai.robo@cupmat.com",
    nickname: "RoboTrainer_Cup",
    teamName: "Deep Learning United",
    country: "fra",
    formation: "4-2-3-1"
  },

  // --- INTERNATIONAL BOTS ---
  {
    userId: "bot_user_usa_1",
    email: "john.smith@cupmat.com",
    nickname: "JohnSmith",
    teamName: "Liberty FC",
    country: "usa",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_fra_1",
    email: "pierre.dupont@cupmat.com",
    nickname: "PierreDupont",
    teamName: "Étoile de Paris",
    country: "fra",
    formation: "4-2-3-1"
  },
  {
    userId: "bot_user_esp_1",
    email: "carlos.gomez@cupmat.com",
    nickname: "CarlosGomez",
    teamName: "Furia Roja FC",
    country: "esp",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_por_1",
    email: "joao.silva@cupmat.com",
    nickname: "JoaoSilva",
    teamName: "Os Navegadores",
    country: "por",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_mex_1",
    email: "javier.h@cupmat.com",
    nickname: "JavierHernandez",
    teamName: "Azteca Warriors",
    country: "mex",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_bra_1",
    email: "thiago.s@cupmat.com",
    nickname: "ThiagoSilva",
    teamName: "Samba Boys",
    country: "bra",
    formation: "4-2-3-1"
  },
  {
    userId: "bot_user_arg_1",
    email: "lucas.m@cupmat.com",
    nickname: "LucasMartinez",
    teamName: "Pampa Stars",
    country: "arg",
    formation: "4-3-3"
  },
  {
    userId: "bot_user_eng_1",
    email: "harry.w@cupmat.com",
    nickname: "HarryWright",
    teamName: "Three Lions FC",
    country: "eng",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_ger_1",
    email: "hans.m@cupmat.com",
    nickname: "HansMueller",
    teamName: "Munich Eagle FC",
    country: "ger",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_ita_1",
    email: "giovanni.r@cupmat.com",
    nickname: "GiovanniRossi",
    teamName: "Milano Gladiators",
    country: "ita",
    formation: "3-5-2"
  }
];

function getGeneralPosition(pos: string): "GK" | "DEF" | "MID" | "FWD" {
  const p = pos?.toLowerCase() || "";
  if (p.includes("kaleci") || p.includes("gk")) return "GK";
  if (p.includes("defans") || p.includes("bek") || p.includes("stoper") || p.includes("df")) return "DEF";
  if (p.includes("orta saha") || p.includes("libero") || p.includes("midfielder") || p.includes("mf") || p.includes("açık")) return "MID";
  if (p.includes("forvet") || p.includes("fw")) return "FWD";
  return "FWD";
}

export async function ensureTimeSpacedBots(stage: string, forceAll = false): Promise<void> {
  try {
    // 1. Fetch current rosters for this stage
    const { data: rosters, error: rostersError } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("id, user_id, team_name")
      .eq("stage", stage);

    if (rostersError) throw rostersError;

    // Filter real rosters
    const realRosters = (rosters || []).filter(
      (r) => r.user_id && !r.user_id.startsWith("bot_") && r.user_id !== "statmatik_bot"
    );

    // 2. Calculate bots needed to reach 16 and keep count even
    const targetCount = 16;
    let maxBotsNeeded = 0;
    if (realRosters.length < targetCount) {
      maxBotsNeeded = targetCount - realRosters.length;
    }
    if ((realRosters.length + maxBotsNeeded) % 2 !== 0) {
      maxBotsNeeded += 1;
    }

    if (maxBotsNeeded <= 0) {
      console.log(`No bots needed for ${stage}. Real rosters count: ${realRosters.length}`);
      return;
    }

    // 3. Determine how many bots are allowed to register based on time
    let botsAllowed = maxBotsNeeded;

    if (!forceAll) {
      const startTimeStr = STAGE_START_DATES[stage] || "2026-06-08T19:23:00+03:00";
      const startTime = new Date(startTimeStr);
      const elapsedMs = Date.now() - startTime.getTime();
      const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (15 * 60 * 1000)));

      // 1 bot per 15 minutes, starting with 4 bots initially
      botsAllowed = Math.min(maxBotsNeeded, elapsedMinutes + 4);
    }

    if (botsAllowed <= 0) return;

    // 4. Check existing bots for this stage
    const existingBots = (rosters || []).filter(
      (r) => r.user_id && (r.user_id.startsWith("bot_") || r.user_id === "statmatik_bot")
    );
    const existingBotIds = new Set(existingBots.map((r) => r.user_id));

    if (existingBots.length >= botsAllowed) {
      console.log(`Time-spaced bots are up to date for ${stage}: ${existingBots.length}/${botsAllowed}`);
      return;
    }

    console.log(`Registering bots for ${stage}. Allowed: ${botsAllowed}, Existing: ${existingBots.length}`);

    // Load all players into memory to perform fast queries
    const { data: allPlayers } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_position, team_id");

    if (!allPlayers || allPlayers.length === 0) {
      console.error("No players found in team_rosters table!");
      return;
    }

    // Shuffle helper
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    // Loop through needed bots
    for (let i = 0; i < botsAllowed; i++) {
      const bot = BOT_POOL[i % BOT_POOL.length];
      if (existingBotIds.has(bot.userId)) continue;

      console.log(`Creating bot team: ${bot.teamName} (${bot.nickname})`);

      // 5. Ensure profile exists in 'profiles'
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, nickname")
        .eq("user_id", bot.userId)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.nickname !== bot.nickname) {
          await supabaseAdmin
            .from("profiles")
            .update({ nickname: bot.nickname })
            .eq("user_id", bot.userId);
        }
      } else {
        await supabaseAdmin
          .from("profiles")
          .insert({
            user_id: bot.userId,
            email: bot.email,
            nickname: bot.nickname,
          });
      }

      // 6. Generate roster matching formation
      const parts = bot.formation.split("-").map(Number);
      let defReq = 4;
      let midReq = 4;
      let fwdReq = 2;

      if (parts.length === 3) {
        defReq = parts[0];
        midReq = parts[1];
        fwdReq = parts[2];
      } else if (parts.length === 4) {
        // e.g. 4-2-3-1 -> def: 4, mid: 2+3 = 5, fwd: 1
        defReq = parts[0];
        midReq = parts[1] + parts[2];
        fwdReq = parts[3];
      }

      // Filter players
      const nativePlayers = allPlayers.filter(
        (p) => p.team_id.toLowerCase() === bot.country.toLowerCase()
      );
      const otherPlayers = allPlayers.filter(
        (p) => p.team_id.toLowerCase() !== bot.country.toLowerCase()
      );

      const filterByPos = (arr: any[], pos: "GK" | "DEF" | "MID" | "FWD") =>
        arr.filter((p) => getGeneralPosition(p.player_position) === pos);

      const shufNativeGKs = shuffle(filterByPos(nativePlayers, "GK"));
      const shufNativeDEFs = shuffle(filterByPos(nativePlayers, "DEF"));
      const shufNativeMIDs = shuffle(filterByPos(nativePlayers, "MID"));
      const shufNativeFWDs = shuffle(filterByPos(nativePlayers, "FWD"));

      const shufOtherGKs = shuffle(filterByPos(otherPlayers, "GK"));
      const shufOtherDEFs = shuffle(filterByPos(otherPlayers, "DEF"));
      const shufOtherMIDs = shuffle(filterByPos(otherPlayers, "MID"));
      const shufOtherFWDs = shuffle(filterByPos(otherPlayers, "FWD"));

      const starters: string[] = [];

      // GK: 1 (60% native, 40% other)
      if (Math.random() < 0.6 && shufNativeGKs.length > 0) {
        starters.push(shufNativeGKs[0].id);
      } else if (shufOtherGKs.length > 0) {
        starters.push(shufOtherGKs[0].id);
      } else if (shufNativeGKs.length > 0) {
        starters.push(shufNativeGKs[0].id);
      }

      // Helper to pick mixed positions
      const pickPosition = (nativePool: any[], otherPool: any[], count: number) => {
        const nativeCount = Math.min(
          Math.round(count * 0.6) + (Math.random() > 0.5 ? 1 : 0),
          nativePool.length
        );
        const picked: string[] = [];

        // Pick native
        for (let j = 0; j < nativeCount; j++) {
          picked.push(nativePool[j].id);
        }

        // Fill other
        let otherIdx = 0;
        while (picked.length < count && otherIdx < otherPool.length) {
          const id = otherPool[otherIdx].id;
          if (!picked.includes(id)) {
            picked.push(id);
          }
          otherIdx++;
        }

        // Native fallback
        let nativeIdx = nativeCount;
        while (picked.length < count && nativeIdx < nativePool.length) {
          const id = nativePool[nativeIdx].id;
          if (!picked.includes(id)) {
            picked.push(id);
          }
          nativeIdx++;
        }

        return picked;
      };

      starters.push(...pickPosition(shufNativeDEFs, shufOtherDEFs, defReq));
      starters.push(...pickPosition(shufNativeMIDs, shufOtherMIDs, midReq));
      starters.push(...pickPosition(shufNativeFWDs, shufOtherFWDs, fwdReq));

      // 7. Insert Roster
      await supabaseAdmin.from("fantasy_rosters").upsert(
        {
          user_id: bot.userId,
          team_name: bot.teamName,
          stage,
          formation: bot.formation,
          starters,
          bench: [],
          manager_id: bot.country,
          points: 0,
          team_index: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, stage, team_index" }
      );
    }
  } catch (error) {
    console.error("ensureTimeSpacedBots error:", error);
  }
}
