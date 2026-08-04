import { NextResponse } from "next/server";
import { LanguageCode, MinlanCard } from "@/lib/minlan/types";
import dataset from "@/lib/minlan/data/minlan_full_dataset.json";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || "cat-1";
    const nativeLang = (searchParams.get("nativeLang") || "tr") as LanguageCode;
    const targetLang = (searchParams.get("targetLang") || "en") as LanguageCode;
    const pairCount = parseInt(searchParams.get("pairCount") || "3", 10);
    const roundLevel = parseInt(searchParams.get("roundLevel") || "1", 10);

    const nativeKey = `lang_${nativeLang}` as keyof (typeof dataset.words)[0];
    const targetKey = `lang_${targetLang}` as keyof (typeof dataset.words)[0];

    // Filter words belonging to current category (or all words if master mode)
    let categoryWords = dataset.words.filter(
      (w) => categoryId === "cat-9" || categoryId === "master-karisik" || w.category_id === categoryId
    );

    if (categoryWords.length === 0) {
      categoryWords = dataset.words;
    }

    // Sort words by frequency ranking / word_order
    categoryWords.sort((a, b) => a.word_order - b.word_order);

    // Dynamic pool expansion per round rule:
    // Tur 1: first 20 words
    // Tur 2: first 30 words
    // ...
    // Tur 9: first 100 words
    // Tur 10+: All words
    const poolLimit = roundLevel <= 9 ? 20 + (roundLevel - 1) * 10 : categoryWords.length;
    const availablePool = categoryWords.slice(0, Math.min(poolLimit, categoryWords.length));

    // Pick top pairs up to pairCount from available pool
    const selectedWords = shuffleArray(availablePool).slice(0, pairCount);

    const cards: MinlanCard[] = [];

    selectedWords.forEach((wordObj) => {
      const nativeText = (wordObj[nativeKey] as string) || wordObj.lang_tr;
      const targetText = (wordObj[targetKey] as string) || wordObj.lang_en;

      // Native Card
      cards.push({
        id: `card-${wordObj.id}-native`,
        wordPairId: wordObj.id,
        text: nativeText,
        language: nativeLang,
        isFlipped: false,
        isMatched: false,
      });

      // Target Card
      cards.push({
        id: `card-${wordObj.id}-target`,
        wordPairId: wordObj.id,
        text: targetText,
        language: targetLang,
        isFlipped: false,
        isMatched: false,
      });
    });

    return NextResponse.json({
      success: true,
      cards: shuffleArray(cards),
      pairCount: selectedWords.length,
      roundLevel,
      poolLimit,
      totalPoolAvailable: availablePool.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch cards", details: err.message },
      { status: 500 }
    );
  }
}
