export interface SimEvent {
  minute: number;
  type: "start" | "half" | "goal" | "card" | "sub" | "end" | "commentary";
  textTr: string;
  textEn: string;
  scoreAfter?: { home: number; away: number };
}

export function generateSimulation(match: any, homePlayers: any[], awayPlayers: any[]): SimEvent[] {
  if (match.id === "A-1") {
    return [
      {
        minute: 1,
        type: "start",
        textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
        textEn: "🏁 The referee blows the whistle and the match begins!",
        scoreAfter: { home: 0, away: 0 }
      },
      {
        minute: 9,
        type: "goal",
        textTr: "⚽ GOL! Meksika öne geçiyor! Ceza sahası sağ çaprazından Julián Quiñones şık bir vuruşla topu ağlara yolluyor. Golü atan oyuncu: Julián Quiñones!",
        textEn: "⚽ GOAL! Mexico takes the lead! Julián Quiñones sends the ball into the net with a beautiful shot from the right side of the box. Goal by Julián Quiñones!",
        scoreAfter: { home: 1, away: 0 }
      },
      {
        minute: 45,
        type: "half",
        textTr: "⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: 1 - 0",
        textEn: "⏸️ Halftime. Teams head to the dressing room. Score: 1 - 0",
        scoreAfter: { home: 1, away: 0 }
      },
      {
        minute: 46,
        type: "start",
        textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
        textEn: "🏁 Second half kicked off. Good luck to both teams!"
      },
      {
        minute: 49,
        type: "card",
        textTr: "🟥 Kırmızı Kart! Güney Afrika takımında Yaya Sithole doğrudan kırmızı kart görerek oyun dışı kalıyor! Kırmızı Kart gören oyuncu: Yaya Sithole.",
        textEn: "🟥 Red Card! Yaya Sithole from South Africa is shown a straight red card and is sent off! Red Card for Yaya Sithole.",
        isRedCard: true
      } as any,
      {
        minute: 66,
        type: "goal",
        textTr: "⚽ GOL! Meksika farkı ikiye çıkarıyor! Raúl Jiménez ceza sahası içindeki karambolde düzgün bir vuruşla golü atıyor! Golü atan oyuncu: Raúl Jiménez!",
        textEn: "⚽ GOAL! Mexico doubles their lead! Raúl Jiménez scores with a clean strike after a scramble in the box! Goal by Raúl Jiménez!",
        scoreAfter: { home: 2, away: 0 }
      },
      {
        minute: 83,
        type: "card",
        textTr: "🟥 Kırmızı Kart! Güney Afrika'da Themba Zwane rakibine arkadan yaptığı sert müdahale nedeniyle ikinci sarı karttan kırmızı kartla oyun dışı kalıyor! Kırmızı Kart gören oyuncu: Themba Zwane.",
        textEn: "🟥 Red Card! Themba Zwane from South Africa is sent off after receiving a second yellow card! Red Card for Themba Zwane.",
        isRedCard: true
      } as any,
      {
        minute: 90,
        type: "commentary",
        textTr: "⏱️ Maçın sonuna en az 4 uzatma dakikası eklendi.",
        textEn: "⏱️ A minimum of 4 minutes of added time announced."
      },
      {
        minute: 93,
        type: "card",
        textTr: "🟥 Kırmızı Kart! Meksika'da César Montes rakibiyle girdiği tartışma sonrası doğrudan kırmızı kartla cezalandırılıyor! Kırmızı Kart gören oyuncu: César Montes.",
        textEn: "🟥 Red Card! César Montes from Mexico is sent off with a straight red card following an altercation! Red Card for César Montes.",
        isRedCard: true
      } as any,
      {
        minute: 94,
        type: "end",
        textTr: "🔚 Son düdük çaldı! Maç bitti. Skor: 2 - 0",
        textEn: "🔚 Full-time! The match is over. Final Score: 2 - 0",
        scoreAfter: { home: 2, away: 0 }
      }
    ];
  }

  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = hashString(match.id);
  
  const rand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const events: SimEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  const getDeterministicPlayer = (isHome: boolean, s: number) => {
    const list = isHome ? homePlayers : awayPlayers;
    if (!list || list.length === 0) return isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu";
    const idx = Math.floor(rand(s) * list.length);
    const p = list[idx];
    return p.player_name || p.name || (isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu");
  };

  events.push({
    minute: 1,
    type: "start",
    textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
    textEn: "🏁 The referee blows the whistle and the match begins!",
    scoreAfter: { home: 0, away: 0 }
  });

  const g1Min = Math.floor(rand(seed + 1) * 25) + 10;
  const g1Home = rand(seed + 2) > 0.5;
  if (g1Home) homeScore++; else awayScore++;
  const scorer1 = getDeterministicPlayer(g1Home, seed + 3);
  events.push({
    minute: g1Min,
    type: "goal",
    textTr: `⚽ GOL! ${g1Home ? "Ev sahibi" : "Deplasman"} ekip golü buluyor! Golü atan oyuncu: ${scorer1}!`,
    textEn: `⚽ GOAL! The ${g1Home ? "home" : "away"} side scores! Goal by ${scorer1}!`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  const c1Min = Math.floor(rand(seed + 4) * 20) + 20;
  const c1Home = rand(seed + 5) > 0.5;
  const playerCard1 = getDeterministicPlayer(c1Home, seed + 6);
  events.push({
    minute: c1Min,
    type: "card",
    textTr: `🟨 Sarı Kart: ${playerCard1} rakibine yaptığı sert müdahale sonrası sarı kart görüyor.`,
    textEn: `🟨 Yellow Card: ${playerCard1} receives a yellow card for a hard tackle.`,
  });

  events.push({
    minute: 45,
    type: "half",
    textTr: `⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: ${homeScore} - ${awayScore}`,
    textEn: `⏸️ Halftime. Teams head to the dressing room. Score: ${homeScore} - ${awayScore}`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  events.push({
    minute: 46,
    type: "start",
    textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
    textEn: "🏁 Second half kicked off. Good luck to both teams!",
  });

  const subMin = Math.floor(rand(seed + 7) * 15) + 50;
  const subHome = rand(seed + 8) > 0.5;
  const subOut = getDeterministicPlayer(subHome, seed + 9);
  const subIn = getDeterministicPlayer(subHome, seed + 10);
  if (subOut !== subIn) {
    events.push({
      minute: subMin,
      type: "sub",
      textTr: `🔄 Oyuncu Değişikliği: ${subHome ? "Ev sahibi" : "Deplasman"} takımda oyuncu değişikliği. ${subOut} kenara gelirken ${subIn} oyuna dahil oluyor.`,
      textEn: `🔄 Substitution: For the ${subHome ? "home" : "away"} team, ${subIn} comes on to replace ${subOut}.`,
    });
  }

  const g2Min = Math.floor(rand(seed + 11) * 20) + 65;
  const g2Home = rand(seed + 12) > 0.5;
  if (g2Home) homeScore++; else awayScore++;
  const scorer2 = getDeterministicPlayer(g2Home, seed + 13);
  events.push({
    minute: g2Min,
    type: "goal",
    textTr: `⚽ GOL! Maçta heyecan dorukta! ${scorer2} topu ağlara gönderiyor!`,
    textEn: `⚽ GOAL! The excitement is high! ${scorer2} sends the ball into the back of the net!`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  const c2Min = Math.floor(rand(seed + 14) * 19) + 70;
  const c2Home = rand(seed + 15) > 0.5;
  const playerCard2 = getDeterministicPlayer(c2Home, seed + 16);
  events.push({
    minute: c2Min,
    type: "card",
    textTr: `🟨 Sarı Kart: ${playerCard2} hakeme yaptığı itirazlar sonrası sarı kartla cezalandırılıyor.`,
    textEn: `🟨 Yellow Card: ${playerCard2} is booked for protesting.`,
  });

  events.push({
    minute: 90,
    type: "commentary",
    textTr: "⏱️ Maçın sonuna en az 4 uzatma dakikası eklendi.",
    textEn: "⏱️ A minimum of 4 minutes of added time announced.",
  });

  events.push({
    minute: 94,
    type: "end",
    textTr: `🔚 Son düdük çaldı! Maç bitti. Skor: ${homeScore} - ${awayScore}`,
    textEn: `🔚 Full-time! The match is over. Final Score: ${homeScore} - ${awayScore}`,
    scoreAfter: { home: homeScore, away: awayScore }
  });

  return events.sort((a, b) => a.minute - b.minute);
}
