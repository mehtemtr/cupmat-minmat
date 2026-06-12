export interface SimEvent {
  minute: number;
  type: "start" | "half" | "goal" | "card" | "sub" | "end" | "commentary";
  textTr: string;
  textEn: string;
  scoreAfter?: { home: number; away: number };
  isRedCard?: boolean;
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

  if (match.id === "A-6") {
    return [
      {
        minute: 1,
        type: "start",
        textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
        textEn: "🏁 The referee blows the whistle and the match begins!",
        scoreAfter: { home: 0, away: 0 }
      },
      {
        minute: 45,
        type: "half",
        textTr: "⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: 0 - 0",
        textEn: "⏸️ Halftime. Teams head to the dressing room. Score: 0 - 0",
        scoreAfter: { home: 0, away: 0 }
      },
      {
        minute: 46,
        type: "start",
        textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
        textEn: "🏁 Second half kicked off. Good luck to both teams!"
      },
      {
        minute: 59,
        type: "goal",
        textTr: "⚽ GOL! Çekya öne geçiyor! Ceza sahasındaki kafa vuruşuyla Ladislav Krejčí topu ağlara gönderiyor. Golü atan oyuncu: Ladislav Krejčí!",
        textEn: "⚽ GOAL! Czechia takes the lead! Ladislav Krejčí heads the ball into the net. Goal by Ladislav Krejčí!",
        scoreAfter: { home: 0, away: 1 }
      },
      {
        minute: 67,
        type: "goal",
        textTr: "⚽ GOL! Güney Kore eşitliği yakalıyor! Ceza sahası dışından Hwang In-beom harika bir vuruşla topu ağlara yolluyor. Golü atan oyuncu: Hwang In-beom!",
        textEn: "⚽ GOAL! South Korea equalizes! Hwang In-beom sends a superb strike into the net from outside the box. Goal by Hwang In-beom!",
        scoreAfter: { home: 1, away: 1 }
      },
      {
        minute: 80,
        type: "goal",
        textTr: "⚽ GOL! Güney Kore galibiyet golünü buluyor! Oh Hyeon-gyu altıpas üzerinden yaptığı düzgün vuruşla takımını öne geçiriyor! Golü atan oyuncu: Oh Hyeon-gyu!",
        textEn: "⚽ GOAL! South Korea scores the winner! Oh Hyeon-gyu slots it home from close range to put his side ahead! Goal by Oh Hyeon-gyu!",
        scoreAfter: { home: 2, away: 1 }
      },
      {
        minute: 90,
        type: "commentary",
        textTr: "⏱️ Maçın sonuna en az 6 uzatma dakikası eklendi.",
        textEn: "⏱️ A minimum of 6 minutes of added time announced."
      },
      {
        minute: 92,
        type: "card",
        textTr: "🟨 Sarı Kart: Lee Gihyuk rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Lee Gihyuk receives a yellow card for a hard tackle.",
      } as any,
      {
        minute: 94,
        type: "end",
        textTr: "🔚 Son düdük çaldı! Maç bitti. Skor: 2 - 1",
        textEn: "🔚 Full-time! The match is over. Final Score: 2 - 1",
        scoreAfter: { home: 2, away: 1 }
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

  const getDeterministicPlayer = (isHome: boolean, s: number) => {
    const list = isHome ? homePlayers : awayPlayers;
    if (!list || list.length === 0) return isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu";
    const idx = Math.floor(rand(s) * list.length);
    const p = list[idx];
    return p.player_name || p.name || (isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu");
  };

  const hasRealScore = match && typeof match.homeScore === "number" && typeof match.awayScore === "number";
  const targetHomeGoals = hasRealScore ? match.homeScore : (rand(seed + 2) > 0.5 ? 1 : 0) + (rand(seed + 12) > 0.5 ? 1 : 0);
  const targetAwayGoals = hasRealScore ? match.awayScore : (2 - targetHomeGoals);

  const gameEvents: SimEvent[] = [];

  for (let i = 0; i < targetHomeGoals; i++) {
    const min = Math.floor(rand(seed + 100 + i) * 80) + 5;
    const scorer = getDeterministicPlayer(true, seed + 110 + i);
    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "goal",
      textTr: `⚽ GOL! Ev sahibi ekip golü buluyor! Golü atan oyuncu: ${scorer}!`,
      textEn: `⚽ GOAL! The home side scores! Goal by ${scorer}!`,
      isHomeGoal: true
    } as any);
  }

  for (let i = 0; i < targetAwayGoals; i++) {
    const min = Math.floor(rand(seed + 200 + i) * 80) + 5;
    const scorer = getDeterministicPlayer(false, seed + 220 + i);
    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "goal",
      textTr: `⚽ GOL! Deplasman ekibi golü buluyor! Golü atan oyuncu: ${scorer}!`,
      textEn: `⚽ GOAL! The away side scores! Goal by ${scorer}!`,
      isHomeGoal: false
    } as any);
  }

  const cardCount = Math.floor(rand(seed + 300) * 3) + 1;
  for (let i = 0; i < cardCount; i++) {
    const min = Math.floor(rand(seed + 310 + i) * 80) + 5;
    const isHomeCard = rand(seed + 320 + i) > 0.5;
    const playerCard = getDeterministicPlayer(isHomeCard, seed + 330 + i);
    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "card",
      textTr: `🟨 Sarı Kart: ${playerCard} rakibine yaptığı sert müdahale sonrası sarı kart görüyor.`,
      textEn: `🟨 Yellow Card: ${playerCard} receives a yellow card for a hard tackle.`,
    });
  }

  const subMin = Math.floor(rand(seed + 400) * 20) + 55;
  const subHome = rand(seed + 410) > 0.5;
  const subOut = getDeterministicPlayer(subHome, seed + 420);
  const subIn = getDeterministicPlayer(subHome, seed + 430);
  if (subOut !== subIn) {
    gameEvents.push({
      minute: subMin,
      type: "sub",
      textTr: `🔄 Oyuncu Değişikliği: ${subHome ? "Ev sahibi" : "Deplasman"} takımda oyuncu değişikliği. ${subOut} kenara gelirken ${subIn} oyuna dahil oluyor.`,
      textEn: `🔄 Substitution: For the ${subHome ? "home" : "away"} team, ${subIn} comes on to replace ${subOut}.`,
    });
  }

  gameEvents.sort((a, b) => a.minute - b.minute);

  let hScore = 0;
  let aScore = 0;
  const processedEvents: SimEvent[] = [];

  processedEvents.push({
    minute: 1,
    type: "start",
    textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
    textEn: "🏁 The referee blows the whistle and the match begins!",
    scoreAfter: { home: 0, away: 0 }
  });

  let halftimeAdded = false;

  gameEvents.forEach((ev) => {
    if (ev.minute > 45 && !halftimeAdded) {
      processedEvents.push({
        minute: 45,
        type: "half",
        textTr: `⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: ${hScore} - ${aScore}`,
        textEn: `⏸️ Halftime. Teams head to the dressing room. Score: ${hScore} - ${aScore}`,
        scoreAfter: { home: hScore, away: aScore }
      });
      processedEvents.push({
        minute: 46,
        type: "start",
        textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
        textEn: "🏁 Second half kicked off. Good luck to both teams!",
      });
      halftimeAdded = true;
    }

    if (ev.type === "goal") {
      const isHomeGoal = (ev as any).isHomeGoal;
      if (isHomeGoal) hScore++; else aScore++;
      ev.scoreAfter = { home: hScore, away: aScore };
    }

    processedEvents.push(ev);
  });

  if (!halftimeAdded) {
    processedEvents.push({
      minute: 45,
      type: "half",
      textTr: `⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: ${hScore} - ${aScore}`,
      textEn: `⏸️ Halftime. Teams head to the dressing room. Score: ${hScore} - ${aScore}`,
      scoreAfter: { home: hScore, away: aScore }
    });
    processedEvents.push({
      minute: 46,
      type: "start",
      textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
      textEn: "🏁 Second half kicked off. Good luck to both teams!",
    });
  }

  processedEvents.push({
    minute: 90,
    type: "commentary",
    textTr: "⏱️ Maçın sonuna en az 4 uzatma dakikası eklendi.",
    textEn: "⏱️ A minimum of 4 minutes of added time announced.",
  });

  processedEvents.push({
    minute: 94,
    type: "end",
    textTr: `🔚 Son düdük çaldı! Maç bitti. Skor: ${hScore} - ${aScore}`,
    textEn: `🔚 Full-time! The match is over. Final Score: ${hScore} - ${aScore}`,
    scoreAfter: { home: hScore, away: aScore }
  });

  return processedEvents;
}
