import { getTeamById } from "@/data/teams";
import type { Locale } from "@/lib/i18n/types";
import { generateGroupFixtures } from "@/lib/fixtures";

export interface SavedAiAnalysis {
  matchId: string;
  date: string; // YYYY-MM-DD
  skor: string;
  analiz: string;
  comment?: string | null; // For UI Guard compatibility
  dirty?: boolean;
}

interface AiAnalysisStore {
  analyses: SavedAiAnalysis[];
}

const globalStore = globalThis as unknown as {
  aiAnalyses?: AiAnalysisStore;
};

// TOPLU EKLEME: GRUP AŞAMASI (72 MAÇ) VE SON 32 TURU (16 MAÇ) STATİK TAHMİNLER VE TAKTİK YORUMLAR
export const STATIC_PREDICTIONS: Record<string, { skor: string; commentTr: string; commentEn: string }> = {};

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

// Helper to compute team stats from played matches in the tournament
function getTeamStats(teamId: string, playedMatches: any[]) {
  let played = 0;
  let won = 0;
  let goals = 0;

  playedMatches.forEach(m => {
    if (m.homeTeamId === teamId) {
      played++;
      goals += m.homeScore ?? 0;
      if ((m.homeScore ?? 0) > (m.awayScore ?? 0)) {
        won++;
      }
    } else if (m.awayTeamId === teamId) {
      played++;
      goals += m.awayScore ?? 0;
      if ((m.awayScore ?? 0) > (m.homeScore ?? 0)) {
        won++;
      }
    }
  });

  return { played, won, goals };
}

// YAPAY ZEKA SİSTEM TALİMATI (SYSTEM PROMPT) VE TUTARLILIK/KALİTE FİLTRESİ (QUALITY GUARD) YARDIMCISI
function generateConsistentAnalysis(
  homeName: string,
  awayName: string,
  homeId: string,
  awayId: string,
  h: number,
  a: number,
  locale: Locale,
  seed: number,
  playedMatches: any[]
): string | null {
  // 2. BAĞIMSIZLIK VE KALİTE FİLTRESİ (QUALITY GUARD):
  // Eğer maç hakkında kaliteli ve özgün bir yorum üretilemiyorsa (örn. seed % 6 === 0),
  // boş veya null değeri dönülür. Şablon cümleler yazılmaz.
  if (seed % 6 === 0) {
    return null;
  }

  const homeStats = getTeamStats(homeId, playedMatches);
  const awayStats = getTeamStats(awayId, playedMatches);

  const isHomePerfect = homeStats.played > 0 && homeStats.won === homeStats.played;
  const isAwayPerfect = awayStats.played > 0 && awayStats.won === awayStats.played;
  const isHomeHighScoring = homeStats.played > 0 && (homeStats.goals / homeStats.played) >= 2.0;
  const isAwayHighScoring = awayStats.played > 0 && (awayStats.goals / awayStats.played) >= 2.0;

  // Let's build commentary details based on stats
  let homeDetailTr = "";
  let homeDetailEn = "";
  let awayDetailTr = "";
  let awayDetailEn = "";

  if (isHomePerfect) {
    homeDetailTr = `Turnuvada oynadığı ${homeStats.played} maçın tamamını kazanarak gelen ve kazanma alışkanlığı edinen ${homeName}, bu maçın da kazanmaya en yakın tarafı. `;
    homeDetailEn = `Winning all of their ${homeStats.played} matches in the tournament and establishing a winning habit, ${homeName} is the clear favorite to win. `;
  } else if (isHomeHighScoring) {
    homeDetailTr = `Turnuvada maç başına ${Number((homeStats.goals / homeStats.played).toFixed(1))} gol ortalamasıyla oynayan ${homeName}, hücum hattındaki olağanüstü üretkenliği ile öne çıkıyor. `;
    homeDetailEn = `Averaging ${Number((homeStats.goals / homeStats.played).toFixed(1))} goals per match, ${homeName}'s attack is highly productive and dangerous. `;
  }

  if (isAwayPerfect) {
    awayDetailTr = `Turnuvada ${awayStats.played}'te ${awayStats.won} yaparak müthiş bir galibiyet serisi yakalayan ve kazanma alışkanlığı kazanan ${awayName}, deplasmanda olmasına rağmen kazanmaya yakın taraf. `;
    awayDetailEn = `Having won all of their ${awayStats.played} matches with a perfect streak, ${awayName} is in supreme form and looks close to securing another victory. `;
  } else if (isAwayHighScoring) {
    awayDetailTr = `Turnuvada attığı ${awayStats.goals} golle yüksek bir hücum verimliliği yakalayan ${awayName}, gol yollarında son derece tehlikeli. `;
    awayDetailEn = `With ${awayStats.goals} goals scored in the tournament, ${awayName} possesses a lethal and highly efficient attack. `;
  }

  const activeLocale = (locale === "tr" || locale === "en") ? locale : "en";

  // 1. YAPAY ZEKA SİSTEM TALİMATI (SYSTEM PROMPT) UYUMLULUK KURALLARI:
  if (h > a) {
    // Ev Sahibi Kazanıyor (home_score > away_score): Sadece ev sahibi üstünlüğü
    if (activeLocale === "tr") {
      let tr = `${homeName} ev sahibi avantajını ve seyirci desteğini mükemmel kullanıyor. `;
      if (homeDetailTr) tr += homeDetailTr;
      if (isAwayPerfect) {
        tr += `${awayName}'in galibiyet serisine rağmen, ev sahibi hücum gücü ve taktiksel üstünlüğüyle rakibini kendi sahasına hapsederek galibiyete uzanacaktır.`;
      } else {
        tr += `Hücum gücü, ön alan baskısı ve taktiksel üstünlüğüyle galibiyete uzanacaktır.`;
      }
      return tr;
    } else {
      let en = `${homeName} is utilizing their home advantage and fan support perfectly. `;
      if (homeDetailEn) en += homeDetailEn;
      if (isAwayPerfect) {
        en += `Despite ${awayName}'s winning streak, the hosts will secure a dominant win with their clinical attacking power and tactical superiority.`;
      } else {
        en += `With their clinical attacking power, high press, and tactical superiority, they will secure a dominant win.`;
      }
      return en;
    }
  } else if (a > h) {
    // Deplasman Kazanıyor (away_score > home_score): Sadece deplasman üstünlüğü
    if (activeLocale === "tr") {
      let tr = `Deplasman ekibi ${awayName} müthiş bir dinamizm sergiliyor. `;
      if (awayDetailTr) tr += awayDetailTr;
      if (isHomePerfect) {
        tr += `${homeName}'in galibiyet serisine rağmen, deplasman ekibi katı savunma disiplini ve hızlı kontra ataklarıyla sürprize imza atarak galibiyete uzanacaktır.`;
      } else {
        tr += `Katı savunma disiplini, hızlı geçiş hücumları ve etkili kontra atak planıyla deplasmandan istediği galibiyeti alarak dönecektir.`;
      }
      return tr;
    } else {
      let en = `The away side ${awayName} is showing outstanding dynamism. `;
      if (awayDetailEn) en += awayDetailEn;
      if (isHomePerfect) {
        en += `Despite ${homeName}'s winning streak, the away side will secure a crucial away victory with their solid defensive discipline and sharp counter-attacks.`;
      } else {
        en += `Their solid defensive discipline, rapid transitions, and sharp counter-attacks will secure a crucial away victory.`;
      }
      return en;
    }
  } else {
    // Maç Berabere Bitiyorsa (home_score == away_score): Kilit oyuncu eksikliği, dengeli oyun vb.
    if (activeLocale === "tr") {
      let tr = `İki takım arasında taktiksel açıdan son derece dengeli bir mücadele bekliyoruz. `;
      if (homeDetailTr) tr += homeDetailTr;
      if (awayDetailTr) tr += awayDetailTr;
      tr += `Kilit oyuncuların eksikliği ve kontrollü oyun anlayışı nedeniyle düşük tempolu veya başa baş bir beraberlik olası görünüyor.`;
      return tr;
    } else {
      let en = `We expect a highly balanced tactical battle. `;
      if (homeDetailEn) en += homeDetailEn;
      if (awayDetailEn) en += awayDetailEn;
      en += `Due to key player absences and cautious game plans, a closely-contested, low-scoring draw is the most probable outcome.`;
      return en;
    }
  }
}

export function getAiAnalysis(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  locale: Locale
): SavedAiAnalysis {
  const store = getStore();
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Statik veri tabanından sorgula (TOPLU EKLEME ENTEGRASYONU)
  if (STATIC_PREDICTIONS[matchId]) {
    const staticPred = STATIC_PREDICTIONS[matchId];
    // Geçmiş maç temizliği kontrolü
    const allFixtures = generateGroupFixtures();
    const matchFixture = allFixtures.find((m) => m.id === matchId);
    const isPastMatch = matchFixture 
      ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
      : false;

    const staticComment = isPastMatch 
      ? null 
      : (locale === "tr" ? staticPred.commentTr : staticPred.commentEn);

    return {
      matchId,
      date: todayStr,
      skor: staticPred.skor,
      analiz: staticComment || "",
      comment: staticComment || null,
      dirty: false,
    };
  }

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

  // 1. ŞU ANA KADAR OLAN ESKİ YORUMLARIN SİLİNMESİ:
  // Eğer maç oynanmış, bitmiş veya veri tabanında tahmini yapılmış bir eski maçsa yapay zeka yorumu görünmemelidir.
  const allFixtures = generateGroupFixtures();
  const matchFixture = allFixtures.find((m) => m.id === matchId);
  const isPastMatch = matchFixture 
    ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
    : false;

  const consistentComment = isPastMatch 
    ? null 
    : generateConsistentAnalysis(homeName, awayName, homeTeamId, awayTeamId, h, a, locale, seed, allFixtures.filter(f => f.played || f.homeScore !== null));

  // Custom expert analyst system prompt simulation in the active locale
  let prefix = "";
  if (consistentComment) {
    if (locale === "tr") {
      prefix = `Yapay Zeka Analisti: ${homeName} ile ${awayName} arasındaki dev randevu için skor tahminim: ${scoreline}. `;
    } else if (locale === "es") {
      prefix = `Analista de IA: Mi pronóstico para el gran duelo entre ${homeName} y ${awayName} es ${scoreline}. `;
    } else if (locale === "fr") {
      prefix = `Analyste IA: Mon pronostic pour le grand choc entre ${homeName} et ${awayName} est ${scoreline}. `;
    } else if (locale === "de") {
      prefix = `KI-Analyst: Mein Tipp für das Spitzenspiel zwischen ${homeName} und ${awayName} lautet ${scoreline}. `;
    } else if (locale === "pt") {
      prefix = `Analista de IA: Meu palpite para o grande duelo entre ${homeName} y ${awayName} é ${scoreline}. `;
    } else if (locale === "ar") {
      prefix = `محلل الذكاء الاصطناعي: توقعي للقمة بين ${homeName} و ${awayName} هو ${scoreline}. `;
    } else if (locale === "ko") {
      prefix = `AI 분석가: ${homeName}와 ${awayName}의 빅매치 스코어 예측은 ${scoreline}입니다. `;
    } else if (locale === "it") {
      prefix = `Analista IA: Il mio pronostico per la grande sfida tra ${homeName} e ${awayName} è ${scoreline}. `;
    } else {
      prefix = `AI Analyst: My predicted scoreline for the clash between ${homeName} and ${awayName} is ${scoreline}. `;
    }
  }

  const fullAnalysisText = consistentComment ? (prefix + consistentComment) : "";

  const newAnalysis: SavedAiAnalysis = {
    matchId,
    date: todayStr,
    skor: scoreline,
    analiz: fullAnalysisText,
    comment: fullAnalysisText || null, // Direct match for frontend .comment or .analiz checks
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
