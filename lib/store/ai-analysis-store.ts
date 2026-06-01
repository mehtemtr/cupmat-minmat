import { getTeamById } from "@/data/teams";
import type { Locale } from "@/lib/i18n/types";

export interface SavedAiAnalysis {
  matchId: string;
  date: string; // YYYY-MM-DD
  skor: string;
  analiz: string;
  dirty?: boolean;
}

interface AiAnalysisStore {
  analyses: SavedAiAnalysis[];
}

const globalStore = globalThis as unknown as {
  aiAnalyses?: AiAnalysisStore;
};

function getStore(): AiAnalysisStore {
  if (!globalStore.aiAnalyses) {
    globalStore.aiAnalyses = {
      analyses: [],
    };
  }
  return globalStore.aiAnalyses;
}

// Deterministic mock generation based on seed hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const dynamicNews = [
  {
    tr: "Ev sahibi takımın forveti oldukça formda, deplasman takımında ise kritik bir stoper sakat olduğu için ev sahibi maçı zor da olsa kazanacaktır.",
    en: "The home team's striker is in great form, while the away team has a critical defender injured, so the hosts will secure a narrow win.",
    es: "El delantero local está en gran forma, mientras que el visitante tiene lesionado a un defensa clave, por lo que el local logrará ganar con lo justo.",
    fr: "L'attaquant de l'équipe locale est en grande forme, tandis que l'équipe visiteuse a un défenseur central blessé, les locaux l'emporteront de justesse.",
    de: "Der Stürmer der Heimmannschaft ist in Topform, während bei den Gästen ein wichtiger Innenverteidiger verletzt ausfällt. Ein knapper Heimsieg zeichnet sich ab.",
    pt: "O atacante do time da casa está em ótima forma, enquanto o time visitante tem um zagueiro crucial lesionado, então os donos da casa garantirão uma vitória apertada.",
    ar: "مهاجم صاحب الأرض في حالة ممتازة، بينما يعاني الفريق الضيف من إصابة مدافع محوري، لذلك سيحقق أصحاب الأرض فوزاً ضيقاً.",
    ko: "홈 팀의 공격수가 매우 좋은 폼을 보여주고 있는 반면, 원정 팀은 핵심 수비수가 부상을 당해 홈 팀이 간신히 승리를 거둘 것입니다.",
    it: "L'attaccante della squadra di casa è in ottima forma, mentre la squadra ospite ha un difensore centrale cruciale infortunato, quindi i padroni di casa otterranno una vittoria di misura."
  },
  {
    tr: "İki takımın da defansif kurgusu çok güçlü. Kilit oyuncuların cezalı olması nedeniyle tempolu ama az gollü bir beraberlik bekliyorum.",
    en: "Both teams have solid defensive structures. Due to key players being suspended, we expect a high-tempo but low-scoring draw.",
    es: "Ambos equipos tienen sólidas estructuras defensivas. Con jugadores clave suspendidos, prevemos un empate intenso pero con pocos goles.",
    fr: "Les deux équipes ont de solides structures défensives. En raison de suspensions de joueurs cadres, nous prévoyons un match nul intense.",
    de: "Beide Teams stehen defensiv sehr kompakt. Da wichtige Akteure gesperrt sind, erwarten wir ein intensives, aber torarmes Unentschieden.",
    pt: "Ambas as equipes têm estruturas defensivas sólidas. Devido à suspensão de jogadores importantes, esperamos um empate em ritmo acelerado, mas com poucos gols.",
    ar: "يمتلك كلا الفريقين هيكلاً دفاعياً صلباً. وبسبب إيقاف لاعبين رئيسيين، نتوقع تعادلاً سريع الرتم وقليل الأهداف.",
    ko: "두 팀 모두 탄탄한 수비 조직력을 갖추고 있습니다. 핵심 선수들의 징계로 인해 템포는 빠르지만 득점이 적은 무승부가 예상됩니다.",
    it: "Entrambe le squadre hanno una solida struttura difensiva. A causa della squalifica di giocatori chiave, ci aspettiamo un pareggio a ritmi alti ma con pochi gol."
  },
  {
    tr: "Deplasman ekibinin orta saha dinamizmi rakibini sürklase edecek düzeyde. Ev sahibinin yorgun forvet hattı gol yollarında etkisiz kalacaktır.",
    en: "The away side's midfield dynamism is set to overwhelm the hosts. The home team's fatigued attack will struggle to create clear chances.",
    es: "El dinamismo del mediocampo visitante superará al local. La fatigada delantera local tendrá dificultades para crear oportunidades claras.",
    fr: "Le dinamisme du milieu de terrain visiteur va submerger les hôtes. L'attaque fatiguée des locaux aura du mal à se créer des occasions.",
    de: "Die Dynamik im Mittelfeld der Gäste wird das Heimteam dominieren. Die müde Offensive des Gastgebers wird Probleme haben, Chancen zu kreieren.",
    pt: "O dinamismo do meio-campo do time visitante deve dominar os donos da casa. O ataque cansado do time da casa terá dificuldades para criar chances claras.",
    ar: "ديناميكية خط وسط الفريق الضيف ستكتسح أصحاب الأرض. سيعاني هجوم أصحاب الأرض المرهق لصناعة فرص واضحة.",
    ko: "원정 팀의 역동적인 미드필더진이 홈 팀을 압도할 것으로 보입니다. 홈 팀의 지친 공격진은 확실한 기회를 만드는 데 어려움을 겪을 것입니다.",
    it: "Il dinamismo del centrocampo della squadra ospite sommergerà i padroni di casa. L'attacco affaticato della squadra di casa faticherà a creare occasioni nitide."
  }
];

export function getAiAnalysis(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  locale: Locale
): SavedAiAnalysis {
  const store = getStore();
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check if an active non-dirty analysis exists for today
  const existing = store.analyses.find(
    (a) => a.matchId === matchId && a.date === todayStr && !a.dirty
  );
  if (existing) {
    return existing;
  }

  // 2. Otherwise generate a new dynamic and realistic prediction
  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const seed = hashString(matchId + todayStr);

  const homeName = home ? (locale === "tr" ? home.nameTr : home.nameEn) : "Home";
  const awayName = away ? (locale === "tr" ? away.nameTr : away.nameEn) : "Away";

  const rankDiff = (away?.fifaRank || 50) - (home?.fifaRank || 50);
  let h = 1;
  let a = 1;

  if (rankDiff > 20) {
    h = 2 + (seed % 2);
    a = seed % 2;
  } else if (rankDiff < -20) {
    h = seed % 2;
    a = 2 + (seed % 2);
  } else {
    h = 1 + (seed % 2);
    a = 1 + ((seed >> 1) % 2);
    if (seed % 3 === 0) {
      h = 1;
      a = 1;
    }
  }

  const scoreline = `${h}-${a}`;
  const newsIndex = seed % dynamicNews.length;
  const rawNews = dynamicNews[newsIndex];
  
  // Custom expert analyst system prompt simulation in the active locale
  let prefix = "";
  if (locale === "tr") {
    prefix = `Yapay Zeka Analisti: ${homeName} ile ${awayName} arasındaki dev randevu için skor tahminim: ${scoreline}. `;
  } else if (locale === "es") {
    prefix = `Analista de IA: Mi pronóstico para el gran duelo entre ${homeName} y ${awayName} es ${scoreline}. `;
  } else if (locale === "fr") {
    prefix = `Analyste IA: Mon pronostic pour le grand choc entre ${homeName} et ${awayName} est ${scoreline}. `;
  } else if (locale === "de") {
    prefix = `KI-Analyst: Mein Tipp für das Spitzenspiel zwischen ${homeName} und ${awayName} lautet ${scoreline}. `;
  } else if (locale === "pt") {
    prefix = `Analista de IA: Meu palpite para o grande duelo entre ${homeName} e ${awayName} é ${scoreline}. `;
  } else if (locale === "ar") {
    prefix = `محلل الذكاء الاصطناعي: توقعي للقمة بين ${homeName} و ${awayName} هو ${scoreline}. `;
  } else if (locale === "ko") {
    prefix = `AI 분석가: ${homeName}와 ${awayName}의 빅매치 스코어 예측은 ${scoreline}입니다. `;
  } else if (locale === "it") {
    prefix = `Analista IA: Il mio pronostico per la grande sfida tra ${homeName} e ${awayName} è ${scoreline}. `;
  } else {
    prefix = `AI Analyst: My predicted scoreline for the clash between ${homeName} and ${awayName} is ${scoreline}. `;
  }

  const fullAnalysisText = prefix + (rawNews[locale] || rawNews.en);

  const newAnalysis: SavedAiAnalysis = {
    matchId,
    date: todayStr,
    skor: scoreline,
    analiz: fullAnalysisText,
    dirty: false,
  };

  // Remove any stale analysis for this match
  store.analyses = store.analyses.filter((a) => a.matchId !== matchId);
  store.analyses.push(newAnalysis);

  return newAnalysis;
}

// Invalidate predictions (e.g. when fresh news arrives) to auto-recalculate
export function invalidateAiAnalysis(matchId: string): void {
  const store = getStore();
  const found = store.analyses.find((a) => a.matchId === matchId);
  if (found) {
    found.dirty = true;
  }
}
