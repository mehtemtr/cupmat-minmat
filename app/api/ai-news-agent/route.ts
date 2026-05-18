import { NextResponse } from "next/server";
import { updatePlayerStatus } from "@/lib/store/player-status-store";
import { invalidateAiAnalysis } from "@/lib/store/ai-analysis-store";
import { generateGroupFixtures } from "@/lib/fixtures";

// Simulated Scraped World Cup Spor Haberleri
const mockScrapedNews = [
  {
    source: "ESPN Sports",
    headline: "BREAKING: South Korea striker Son Heung-min has sustained a right ankle sprain in training. LAFC forward ruled out for at least 10 days, missing the opening group stage matches!",
    playerKey: "son-heung-min",
    teamId: "kor",
    durum: "sakat" as const,
    detay: {
      tr: "Sağ ayak bileğinde burkulma tespit edildi. En az 10 gün sahalardan uzak kalacak.",
      en: "Diagnosed with a mild right ankle sprain. Ruled out of matches for at least 10 days.",
      de: "Diagnostizierte leichte Verstauchung des rechten Knöchels. Fällt mindestens 10 Tage aus.",
      fr: "Entorse légère de la cheville droite diagnostiquée. Indisponible pour au moins 10 jours.",
      es: "Esguince leve de tobillo derecho diagnosticado. Baja médica por al menos 10 días."
    }
  },
  {
    source: "Marca",
    headline: "MEXICO UPDATE: Guillermo Ochoa is fully fit and ready to go! Refutes any knee scare in standard training, solidifying Mexico's goalkeeping options.",
    playerKey: "guillermo-ochoa",
    teamId: "mex",
    durum: "hazir" as const,
    detay: {
      tr: "Ufak diz ağrısı şikayeti tamamen geçti. Grup maçlarında kaleyi korumaya hazır durumda.",
      en: "Minor knee soreness completely resolved. Fully fit to start group matches.",
      de: "Leichte Kniebeschwerden vollständig abgeklungen. Voll einsatzbereit für die Gruppenphase.",
      fr: "Légère douleur au genou complètement résorbée. Prêt à débuter la phase de groupes.",
      es: "Molestias leves en la rodilla totalmente resueltas. Completamente apto para el torneo."
    }
  },
  {
    source: "Kicker",
    headline: "CZECHIA BLOW: Star striker Patrik Schick ruled out for the first match due to yellow card accumulation in late-stage qualification rounds.",
    playerKey: "patrik-schick",
    teamId: "cze",
    durum: "cezali" as const,
    detay: {
      tr: "Elemelerdeki kart cezası nedeniyle grubun açılış maçında cezalı durumdadır.",
      en: "Suspended for the group opening match due to card accumulation during qualifiers.",
      de: "Für das erste Gruppenspiel wegen Gelbsperre aus der Qualifikationsphase gesperrt.",
      fr: "Suspendu pour le premier match de poule en raison d'une accumulation de cartons en qualifications.",
      es: "Suspendido para el primer partido del grupo debido a acumulación de tarjetas en eliminatorias."
    }
  }
];

export async function GET(request: Request) {
  return handleNewsAgent();
}

export async function POST(request: Request) {
  return handleNewsAgent();
}

async function handleNewsAgent() {
  try {
    const parsedUpdates = [];
    const invalidatedMatches: string[] = [];

    // Simulate news scraper looping over news feeds and parsing via LLM analyser.
    // Analyser Prompt: "Sana verilen spor haberlerini incele... JSON formatında döndür..."
    for (const item of mockScrapedNews) {
      const extracted = {
        futbolcuId: item.playerKey,
        durum: item.durum,
        detay: item.detay.tr, // Store detailed updates in active DB
      };

      // 1. Update player status record dynamically
      updatePlayerStatus(extracted.futbolcuId, extracted.durum, extracted.detay);
      parsedUpdates.push(extracted);

      // 2. Map player to their national team and invalidate upcoming matches to trigger recalculations
      const fixtures = generateGroupFixtures();
      const teamMatches = fixtures.filter(
        (m) => m.homeTeamId === item.teamId || m.awayTeamId === item.teamId
      );

      teamMatches.forEach((m) => {
        invalidateAiAnalysis(m.id);
        if (!invalidatedMatches.includes(m.id)) {
          invalidatedMatches.push(m.id);
        }
      });
    }

    return NextResponse.json({
      success: true,
      newsAgentScrapedCount: mockScrapedNews.length,
      newsHeadlines: mockScrapedNews.map((n) => `[${n.source}] ${n.headline}`),
      parsedUpdates,
      invalidatedMatches,
      message:
        "AI Haber Ajanı haber taramasını tamamladı, futbolcu durumları güncellendi ve AI Tahmin köprüleri otomatik tetiklendi!",
    });
  } catch (error) {
    console.error("AI News Agent error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
