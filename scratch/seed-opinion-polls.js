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

const opinionPolls = [
  {
    question_tr: "Sizce 2026 Dünya Kupası'nı hangi kıta takımı kazanır?",
    question_en: "Which continent do you think will win the 2026 World Cup?",
    options: [
      { tr: "Avrupa (UEFA)", en: "Europe (UEFA)" },
      { tr: "Güney Amerika (CONMEBOL)", en: "South America (CONMEBOL)" },
      { tr: "Afrika (CAF)", en: "Africa (CAF)" },
      { tr: "Asya veya Kuzey/Orta Amerika", en: "Asia or North/Central America" }
    ],
    correct_option_index: -1,
    points_reward: 10,
    category: "current_wc"
  },
  {
    question_tr: "Dünya Kupası tarihinin en unutulmaz maçı hangisidir?",
    question_en: "What is the most memorable match in World Cup history?",
    options: [
      { tr: "1970 Brezilya - İtalya (4-1)", en: "1970 Brazil - Italy (4-1)" },
      { tr: "1986 Arjantin - İngiltere (2-1)", en: "1986 Argentina - England (2-1)" },
      { tr: "2014 Brezilya - Almanya (1-7)", en: "2014 Brazil - Germany (1-7)" },
      { tr: "2022 Arjantin - Fransa (3-3, Pen. 4-2)", en: "2022 Argentina - France (3-3, Pen. 4-2)" }
    ],
    correct_option_index: -1,
    points_reward: 10,
    category: "past_wc"
  },
  {
    question_tr: "VAR (Video Yardımcı Hakem) sistemi futbolu genel olarak daha iyi hale getirdi mi?",
    question_en: "Has the VAR (Video Assistant Referee) system generally made football better?",
    options: [
      { tr: "Evet, kesinlikle daha adil hale getirdi", en: "Yes, it definitely made it fairer" },
      { tr: "Hayır, oyunun heyecanını ve ruhunu öldürdü", en: "No, it killed the excitement and spirit of the game" },
      { tr: "Kısmen, ama kurallar ve kararlar hala çok tutarsız", en: "Partially, but rules and decisions are still inconsistent" }
    ],
    correct_option_index: -1,
    points_reward: 10,
    category: "site"
  },
  {
    question_tr: "Önümüzdeki 10 yılda futbol dünyasını domine edecek yeni süperstar sizce kim olacak?",
    question_en: "Who do you think will be the new superstar dominating world football in the next 10 years?",
    options: [
      { tr: "Kylian Mbappé", en: "Kylian Mbappé" },
      { tr: "Erling Haaland", en: "Erling Haaland" },
      { tr: "Jude Bellingham", en: "Jude Bellingham" },
      { tr: "Lamine Yamal", en: "Lamine Yamal" },
      { tr: "Bir başkası / Diğer", en: "Someone else / Other" }
    ],
    correct_option_index: -1,
    points_reward: 10,
    category: "past_wc"
  }
];

async function main() {
  console.log("Seeding opinion polls...");
  const { data, error } = await supabaseAdmin
    .from('polls')
    .insert(opinionPolls)
    .select();

  if (error) {
    console.error("Error inserting opinion polls:", error);
  } else {
    console.log(`Successfully seeded ${data.length} opinion polls!`);
  }
}

main();
