import { MinmatCard, MinmatMode } from "./types";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMinmatCards(mode: MinmatMode, level: number): MinmatCard[] {
  const pairCount = Math.min(18, level + 2); // Max 18 pairs (36 cards)
  const cards: MinmatCard[] = [];
  const usedAnswers = new Set<number>();

  for (let i = 0; i < pairCount; i++) {
    let currentMode = mode;
    if (mode === "mix") {
      const modes: ("add" | "sub" | "mul" | "div")[] = ["add", "sub", "mul", "div"];
      currentMode = modes[Math.floor(Math.random() * modes.length)];
    }

    let a = 0;
    let b = 0;
    let question = "";
    let answer = 0;
    let tries = 0;

    do {
      if (currentMode === "add") {
        let max = level * 5;
        if (max > 50) max = 50;
        a = rand(1, max);
        b = rand(1, max);
        question = `${a} + ${b}`;
        answer = a + b;
      } else if (currentMode === "sub") {
        // Asla negatif sayı çıkmayacak: a < b ise yer değiştir
        a = rand(1, level * 5);
        b = rand(1, level * 5);
        if (a < b) {
          const t = a;
          a = b;
          b = t;
        }
        question = `${a} - ${b}`;
        answer = a - b;
      } else if (currentMode === "mul") {
        const mulMax = Math.min(3 + level * 2, 12);
        a = rand(1, mulMax);
        b = rand(1, mulMax);
        question = `${a} × ${b}`;
        answer = a * b;
      } else if (currentMode === "div") {
        const divMax = Math.min(3 + level, 12);
        answer = rand(1, divMax);
        b = rand(1, divMax);
        a = answer * b;
        question = `${a} / ${b}`;
      }
      tries++;
    } while (usedAnswers.has(answer) && tries < 50);

    usedAnswers.add(answer);
    const pairId = `pair_${level}_${i}_${answer}`;

    cards.push({
      id: `card_${pairId}_q`,
      pairId,
      text: question,
      isQuestion: true,
      isFlipped: false,
      isMatched: false,
    });

    cards.push({
      id: `card_${pairId}_a`,
      pairId,
      text: String(answer),
      isQuestion: false,
      isFlipped: false,
      isMatched: false,
    });
  }

  return cards.sort(() => 0.5 - Math.random());
}
