const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const redisUrl = getEnv('KV_REST_API_URL');
const redisToken = getEnv('KV_REST_API_TOKEN');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function getPeriodStart(periodEndStr) {
  const end = new Date(periodEndStr);
  const start = new Date(end.getTime() - 72 * 60 * 60 * 1000);
  return start;
}

function isEmailEligible(user) {
  return user.userId.startsWith("user_");
}

async function run() {
  try {
    const resStore = await fetch(`${redisUrl}/get/gamification_store`, {
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const result = await resStore.json();
    const store = JSON.parse(result.result);

    const compareStart = getPeriodStart(store.periodEnd);
    console.log(`Compare Start: ${compareStart.toISOString()} (${compareStart.toLocaleString('tr-TR')})`);

    const eligible = store.userActivities.filter(isEmailEligible);

    const userNickMap = new Map();
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");
    if (profiles) {
      profiles.forEach(p => {
        if (p.user_id && p.nickname) {
          userNickMap.set(p.user_id, p.nickname);
        }
      });
    }

    const { data: minMatScores, error: scoresError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .gte("timestamp", compareStart.getTime());

    if (scoresError) {
      console.error("Error fetching minmat scores:", scoresError);
      return;
    }

    console.log(`Fetched ${minMatScores.length} raw scores since period start.`);

    const minMatMaxByUser = {};

    function mapCategoryDisplay(newCat) {
      const map = {
        "topla": "toplama", "cikar": "çıkarma", "carp": "çarpma", "bol": "bölme", "karisik": "karışık",
        "add": "toplama", "sub": "çıkarma", "mul": "çarpma", "div": "bölme", "mix": "karışık"
      };
      return map[newCat] || newCat;
    }

    for (const s of minMatScores) {
      const emailKey = s.email?.toLowerCase().trim() || "";
      const nameKey = s.name?.toLowerCase().trim() || "";

      // Find if this score belongs to one of our eligible users
      const matchingUser = eligible.find((u) => 
        (emailKey && u.email?.toLowerCase().trim() === emailKey) || 
        (nameKey && u.displayName.toLowerCase().trim() === nameKey)
      );

      if (matchingUser) {
        const score = s.score || 0;
        const userKey = matchingUser.userId;
        const current = minMatMaxByUser[userKey];
        const finalNick = userNickMap.get(matchingUser.userId) || matchingUser.displayName;
        
        if (!current || score > current.score) {
          minMatMaxByUser[userKey] = {
            score,
            level: s.level || 1,
            mode: mapCategoryDisplay(s.mode),
            displayName: finalNick,
            matchingUserEmail: matchingUser.email,
            matchingUserNick: matchingUser.displayName
          };
        }
      } else {
        // Log who is NOT matching
        // console.log(`Unmatched score: ${s.name} (${s.email})`);
      }
    }

    const minMatSorted = Object.entries(minMatMaxByUser)
      .sort(([, a], [, b]) => b.score - a.score)
      .map(([, stats]) => stats);

    console.log("\nComputed minMatRewards Podium (slice 0, 3):");
    console.log("-------------------------------------------");
    minMatSorted.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. Nick: ${item.displayName} | Score: ${item.score} | Lvl: ${item.level} | Mode: ${item.mode} | Matches User: ${item.matchingUserNick} (${item.matchingUserEmail})`);
    });
    console.log("-------------------------------------------");

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
