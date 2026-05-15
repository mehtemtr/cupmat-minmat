import type { AiAnalysis } from "@/lib/types/tournament";
import type { Locale } from "@/lib/i18n/types";
import { getTeamById } from "@/data/teams";

// Basit bir deterministik pseudo-random fonksiyonu
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateAiPredictions(
  matches: { id: string; homeTeamId: string | null; awayTeamId: string | null }[],
  locale: Locale,
): {
  predictions: Record<string, { home: number; away: number }>;
  analyses: AiAnalysis[];
} {
  const predictions: Record<string, { home: number; away: number }> = {};
  const analyses: AiAnalysis[] = [];

  matches.forEach((match) => {
    if (!match.homeTeamId || !match.awayTeamId) return;

    const home = getTeamById(match.homeTeamId);
    const away = getTeamById(match.awayTeamId);

    const homeName = home
      ? locale === "tr"
        ? home.nameTr
        : home.nameEn
      : "Home";
    const awayName = away
      ? locale === "tr"
        ? away.nameTr
        : away.nameEn
      : "Away";

    const rankDiff = (away?.fifaRank || 50) - (home?.fifaRank || 50);
    const seed = hashString(match.id);

    let h = 0;
    let a = 0;
    let conf = 0.6 + (Math.abs(rankDiff) / 100) * 0.3;
    if (conf > 0.95) conf = 0.95;

    if (rankDiff > 15) {
      h = 1 + (seed % 3);
      a = (seed % 2) === 0 ? 0 : 1;
    } else if (rankDiff < -15) {
      h = (seed % 2) === 0 ? 0 : 1;
      a = 1 + (seed % 3);
    } else {
      h = seed % 3;
      a = (seed >> 1) % 3;
      if (h === 0 && a === 0 && seed % 5 === 0) h = 1;
    }

    predictions[match.id] = { home: h, away: a };

    const trFav = [
      "topa sahip olma oyunu ve set hücumlarıyla",
      "ön alanda yoğun pres ve hızlı kanat organizasyonlarıyla",
      "merkezi kalabalık tutup araya atılan kilit paslarla",
      "beklerin hücuma katılımı ve geniş alan kullanımıyla"
    ];
    const enFav = [
      "possession-based play and structured attacks",
      "high pressing and rapid wide combinations",
      "overloading the midfield and executing through balls",
      "attacking fullbacks and utilizing horizontal spaces"
    ];

    const trUnd = [
      "derin savunma kurgusu ve kontra atak fırsatları arayarak",
      "katı bir defansif blok ve duran toplardan gol bularak",
      "geçiş oyunlarında direkt uzun toplarla tehlike yaratarak",
      "rakibi kendi yarı alanında karşılayıp merkezden hızlı çıkarak"
    ];
    const enUnd = [
      "a deep defensive block aiming for counter-attacks",
      "a solid defensive structure hoping to capitalize on set-pieces",
      "creating danger via direct long balls in transitions",
      "sitting deep and launching rapid central counters"
    ];

    const trBal = [
      "orta saha mücadelesi ve taktiksel disiplinle",
      "tempolu karşılıklı ataklar ve bireysel yeteneklerle",
      "kanat bindirmeleri ve dinamik bir oyun anlayışıyla",
      "taktiksel esneklik ve hızlı yön değiştirmelerle"
    ];
    const enBal = [
      "midfield battles and strict tactical discipline",
      "end-to-end action and individual brilliance",
      "overlapping runs and a dynamic approach",
      "tactical flexibility and rapid switches of play"
    ];

    let summary = "";
    let keyFactors: string[] = [];

    const isFav = rankDiff > 15;
    const isUnd = rankDiff < -15;

    if (isFav) {
      summary = locale === "tr"
        ? `GPT-5.4 Analizi: Kağıt üstünde daha güçlü olan ${homeName}, ${trFav[seed % 4]} üstünlük kurmayı hedefliyor. ${awayName} ise ${trUnd[(seed >> 1) % 4]} direnmeye çalışacak.`
        : `GPT-5.4 Consensus: As the stronger side, ${homeName} aims to dominate via ${enFav[seed % 4]}. ${awayName} will attempt to resist using ${enUnd[(seed >> 1) % 4]}.`;

      keyFactors = locale === "tr" ? [
        `${homeName} topa sahip olma oranı`,
        `${awayName} savunma direnci`,
        "Duran top organizasyonları"
      ] : [
        `${homeName} possession percentage`,
        `${awayName} defensive resilience`,
        "Set-piece executions"
      ];
    } else if (isUnd) {
      summary = locale === "tr"
        ? `GPT-5.4 Analizi: Net favori ${awayName}, ${trFav[seed % 4]} sonuca gitmeyi planlarken; ${homeName} ${trUnd[(seed >> 1) % 4]} sürpriz arayacak.`
        : `GPT-5.4 Consensus: Clear favorites ${awayName} plan to secure the win through ${enFav[seed % 4]}; while ${homeName} seek an upset relying on ${enUnd[(seed >> 1) % 4]}.`;

      keyFactors = locale === "tr" ? [
        `${awayName} bitiricilik yüzdesi`,
        `${homeName} kaleci performansı`,
        "Hızlı geçiş hücumları"
      ] : [
        `${awayName} clinical finishing`,
        `${homeName} goalkeeper performance`,
        "Rapid transition attacks"
      ];
    } else {
      summary = locale === "tr"
        ? `GPT-5.4 Analizi: Denk güçlerin mücadelesinde ${homeName} ve ${awayName}, ${trBal[seed % 4]} oyuna hükmetmeye çalışacak. Zorlu bir taktik savaşı bekleniyor.`
        : `GPT-5.4 Consensus: An evenly matched clash where ${homeName} and ${awayName} will fight for control through ${enBal[seed % 4]}. A tense tactical battle is expected.`;

      keyFactors = locale === "tr" ? [
        "Orta sahadaki ikili mücadeleler",
        "İkinci top kazanımları",
        "Bireysel hata ihtimalleri"
      ] : [
        "Midfield duels won",
        "Second ball recovery",
        "Probability of individual errors"
      ];
    }

    analyses.push({
      matchId: match.id,
      locale,
      summary,
      keyFactors,
      predictedScoreline: `${h}-${a}`,
      confidence: Number(conf.toFixed(2))
    });
  });

  return { predictions, analyses };
}
