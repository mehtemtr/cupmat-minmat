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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    console.log("Fetching all scores from minmat_leaderboard...");
    const { data: scores, error } = await supabase
      .from('minmat_leaderboard')
      .select('*');

    if (error) {
      console.error("Error fetching scores:", error);
      return;
    }

    console.log(`Successfully fetched ${scores.length} scores total.`);

    // 1. Find Max level and score
    let maxLevelItem = null;
    let maxScoreItem = null;
    scores.forEach(item => {
      if (!maxLevelItem || item.level > maxLevelItem.level) maxLevelItem = item;
      if (!maxScoreItem || item.score > maxScoreItem.score) maxScoreItem = item;
    });

    console.log("\nRecord Holders:");
    console.log("--------------------------------------------------");
    if (maxLevelItem) {
      console.log(`Highest Level Achieved: Level ${maxLevelItem.level} by ${maxLevelItem.name} (${maxLevelItem.email}) with Score: ${maxLevelItem.score} on ${maxLevelItem.date}`);
    }
    if (maxScoreItem) {
      console.log(`Highest Score Achieved: Score ${maxScoreItem.score} by ${maxScoreItem.name} (${maxScoreItem.email}) at Level ${maxScoreItem.level} on ${maxScoreItem.date}`);
    }
    console.log("--------------------------------------------------");

    // 2. Level distributions
    const distribution = {
      level1_4: 0,
      level5_7: 0,
      level8_9: 0,
      level10_12: 0,
      level13_15: 0,
      level16_plus: 0
    };

    scores.forEach(item => {
      const lvl = item.level || 1;
      if (lvl <= 4) distribution.level1_4++;
      else if (lvl <= 7) distribution.level5_7++;
      else if (lvl <= 9) distribution.level8_9++;
      else if (lvl <= 12) distribution.level10_12++;
      else if (lvl <= 15) distribution.level13_15++;
      else distribution.level16_plus++;
    });

    console.log("\nLevel Distribution of All Games:");
    console.log(`Level 1-4:   ${distribution.level1_4} games`);
    console.log(`Level 5-7:   ${distribution.level5_7} games (Normal high performance)`);
    console.log(`Level 8-9:   ${distribution.level8_9} games (Highly skilled)`);
    console.log(`Level 10-12: ${distribution.level10_12} games (Suspicious / Exploit candidate)`);
    console.log(`Level 13-15: ${distribution.level13_15} games (Likely Exploit)`);
    console.log(`Level 16+:   ${distribution.level16_plus} games (Definitely Exploit)`);
    console.log("--------------------------------------------------");

    // 3. User Aggregated Analysis
    // We group by user (email) to see their maximum level and score achieved.
    const userMax = {};
    scores.forEach(item => {
      const email = item.email || 'unknown';
      if (!userMax[email]) {
        userMax[email] = {
          name: item.name,
          email: item.email,
          maxScore: 0,
          maxLevel: 0,
          totalGames: 0
        };
      }
      userMax[email].totalGames++;
      if (item.score > userMax[email].maxScore) userMax[email].maxScore = item.score;
      if (item.level > userMax[email].maxLevel) userMax[email].maxLevel = item.level;
    });

    const userList = Object.values(userMax).sort((a, b) => b.maxLevel - a.maxLevel);

    console.log("\nTop Users (Sorted by Max Level Achieved):");
    console.log("--------------------------------------------------------------------------------");
    console.log("Index | Nickname (Email) | Max Level | Max Score | Total Games Played");
    console.log("--------------------------------------------------------------------------------");
    userList.forEach((user, index) => {
      // Highlight users with maxLevel >= 8
      const isSuspicious = user.maxLevel >= 8 ? "⚠️ " : "   ";
      console.log(`${isSuspicious}${index + 1}. ${user.name} (${user.email}) | Lvl: ${user.maxLevel} | Score: ${user.maxScore} | Games: ${user.totalGames}`);
    });
    console.log("--------------------------------------------------------------------------------");

  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
