import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Load env
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
  } catch (e) {}
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const samplePolls = [
  {
    question_tr: "2022 Dünya Kupası şampiyonu hangi ülkedir?",
    question_en: "Which country is the champion of the 2022 World Cup?",
    question_es: "¿Qué país es el campeón de la Copa del Mundo 2022?",
    question_fr: "Quel pays est le champion de la Coupe du Monde 2022?",
    question_de: "Welches Land ist der Weltmeister der Weltmeisterschaft 2022?",
    question_pt: "Qual país é o campeão da Copa do Mundo de 2022?",
    question_it: "Quale paese è il campione della Coppa del Mondo 2022?",
    question_ko: "2022년 월드컵 우승국은 어디입니까?",
    question_ar: "أي بلد هو بطل كأس العالم 2022؟",
    options: [
      { tr: "Arjantin", en: "Argentina", es: "Argentina", fr: "Argentine", de: "Argentinien", pt: "Argentina", it: "Argentina", ko: "아르헨티나", ar: "الأرجنتين" },
      { tr: "Fransa", en: "France", es: "Francia", fr: "France", de: "Frankreich", pt: "França", it: "Francia", ko: "프랑스", ar: "فرنسا" },
      { tr: "Hırvatistan", en: "Croatia", es: "Croacia", fr: "Croatie", de: "Kroatien", pt: "Croácia", it: "Croazia", ko: "크로아티아", ar: "كرواتيا" },
      { tr: "Fas", en: "Morocco", es: "Marruecos", fr: "Maroc", de: "Marokko", pt: "Marrocos", it: "Marocco", ko: "모로코", ar: "المغرب" }
    ],
    correct_option_index: 0,
    points_reward: 15,
    active_until: null
  },
  {
    question_tr: "Hangi ülke 2026 Dünya Kupası'na ev sahipliği yapmamaktadır?",
    question_en: "Which country is NOT hosting the 2026 World Cup?",
    question_es: "¿Qué país NO es anfitrión de la Copa del Mundo 2026?",
    question_fr: "Quel pays n'est PAS l'hôte de la Coupe du Monde 2026?",
    question_de: "Welches Land ist KEIN Gastgeber der Weltmeisterschaft 2026?",
    question_pt: "Qual país NÃO é anfitrião da Copa do Mundo de 2026?",
    question_it: "Quale paese NON ospita la Coppa del Mondo 2026?",
    question_ko: "어느 나라가 2026년 월드컵을 개최하지 않습니까?",
    question_ar: "أي بلد لا يستضيف كأس العالم 2026؟",
    options: [
      { tr: "Amerika Birleşik Devletleri", en: "United States", es: "Estados Unidos", fr: "États-Unis", de: "Vereinigte Staaten", pt: "Estados Unidos", it: "Stati Uniti", ko: "미국", ar: "الولايات المتحدة" },
      { tr: "Meksika", en: "Mexico", es: "México", fr: "Mexique", de: "Mexiko", pt: "México", it: "Messico", ko: "멕시코", ar: "المكسيك" },
      { tr: "Kanada", en: "Canada", es: "Canadá", fr: "Canada", de: "Kanada", pt: "Canadá", it: "Canada", ko: "캐나다", ar: "كندا" },
      { tr: "Brezilya", en: "Brazil", es: "Brazil", fr: "Brésil", de: "Brasilien", pt: "Brasil", it: "Brasile", ko: "브라질", ar: "البرازيل" }
    ],
    correct_option_index: 3,
    points_reward: 10,
    active_until: null
  },
  {
    question_tr: "Sizce 2026 Dünya Kupası'nı hangi kıtadan bir takım kazanır?",
    question_en: "From which continent do you think the 2026 World Cup champion will come?",
    question_es: "¿De qué continente crees que vendrá el campeón de la Copa del Mundo 2026?",
    question_fr: "De quel continent pensez-vous que viendra le champion de la Coupe du Monde 2026?",
    question_de: "Aus welchem Kontinent wird der Weltmeister der Weltmeisterschaft 2026 eurer Meinung nach kommen?",
    question_pt: "De qual continente você acha que virá o campeão da Copa do Mundo de 2026?",
    question_it: "Da quale continente pensi che verrà il campione della Coppa del Mondo 2026?",
    question_ko: "2026년 월드컵 우승국은 어느 대륙에서 나올 것으로 예상하십니까?",
    question_ar: "من أي قارة تعتقد أن بطل كأس العالم 2026 سيأتي؟",
    options: [
      { tr: "Avrupa (UEFA)", en: "Europe (UEFA)", es: "Europa (UEFA)", fr: "Europe (UEFA)", de: "Europa (UEFA)", pt: "Europa (UEFA)", it: "Europa (UEFA)", ko: "유럽 (UEFA)", ar: "أوروبا (UEFA)" },
      { tr: "Güney Amerika (CONMEBOL)", en: "South America (CONMEBOL)", es: "Sudamérica (CONMEBOL)", fr: "Amérique du Sud (CONMEBOL)", de: "Südamerika (CONMEBOL)", pt: "América do Sul (CONMEBOL)", it: "Sud America (CONMEBOL)", ko: "남미 (CONMEBOL)", ar: "أمريكا الجنوبية (CONMEBOL)" },
      { tr: "Kuzey/Orta Amerika (CONCACAF)", en: "North/Central America (CONCACAF)", es: "Norte/Centroamérica (CONCACAF)", fr: "Amérique du Nord/Centrale (CONCACAF)", de: "Nord-/Mittelamerika (CONCACAF)", pt: "América do Norte/Central (CONCACAF)", it: "Nord/Centro America (CONCACAF)", ko: "북중미 (CONCACAF)", ar: "أمريكا الشمالية/الوسطى (CONCACAF)" },
      { tr: "Afrika (CAF) / Asya (AFC)", en: "Africa (CAF) / Asia (AFC)", es: "África (CAF) / Asia (AFC)", fr: "Afrique (CAF) / Asie (AFC)", de: "Afrika (CAF) / Asien (AFC)", pt: "África (CAF) / Ásia (AFC)", it: "Africa (CAF) / Asia (AFC)", ko: "아프리카 (CAF) / 아시아 (AFC)", ar: "أفريقيا (CAF) / آسيا (AFC)" }
    ],
    correct_option_index: -1, // Opinion poll
    points_reward: 10,
    active_until: null
  }
];

async function seed() {
  console.log("Seeding sample polls/questions into public.polls...");
  
  // Clean up any existing polls with same questions to avoid spamming
  const { error: deleteErr } = await supabaseAdmin
    .from("polls")
    .delete()
    .in("question_tr", samplePolls.map(p => p.question_tr));

  if (deleteErr) {
    console.error("Warning cleaning up existing polls:", deleteErr.message);
  }

  const { data, error } = await supabaseAdmin
    .from("polls")
    .insert(samplePolls)
    .select("id, question_tr");

  if (error) {
    console.error("❌ Seeding failed:", error.message);
  } else {
    console.log("✅ Seeding completed successfully! Inserted polls:");
    data.forEach(p => console.log(`- [${p.id}] ${p.question_tr}`));
  }
}

seed();
