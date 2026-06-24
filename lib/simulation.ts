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
        textTr: "⚽ GOL! Meksika öne geçiyor! Ceza sahası sağ çaprazından Julián Quiñones şık bir vuruşla topu ağlara yolluyor. Golü atan oyuncu: Julián Quiñones, Asisti yapan oyuncu: Érik Lira!",
        textEn: "⚽ GOAL! Mexico takes the lead! Julián Quiñones sends the ball into the net with a beautiful shot from the right side of the box. Goal by Julián Quiñones, Assist by Érik Lira!",
        scoreAfter: { home: 1, away: 0 }
      },
      {
        minute: 34,
        type: "card",
        textTr: "🟨 Sarı Kart: Nkosinathi Sibisi rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Nkosinathi Sibisi receives a yellow card for a hard tackle."
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
        textTr: "🟥 Kırmızı Kart! Güney Afrika takımında Sphephelo Sithole doğrudan kırmızı kart görerek oyun dışı kalıyor! Kırmızı Kart gören oyuncu: Sphephelo Sithole.",
        textEn: "🟥 Red Card! Sphephelo Sithole from South Africa is shown a straight red card and is sent off! Red Card for Sphephelo Sithole.",
        isRedCard: true
      } as any,
      {
        minute: 58,
        type: "card",
        textTr: "🟨 Sarı Kart: Teboho Mokoena rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Teboho Mokoena receives a yellow card for a hard tackle."
      },
      {
        minute: 66,
        type: "goal",
        textTr: "⚽ GOL! Meksika farkı ikiye çıkarıyor! Raúl Jiménez ceza sahası içindeki karambolde düzgün bir vuruşla golü atıyor! Golü atan oyuncu: Raúl Jiménez, Asisti yapan oyuncu: Roberto Alvarado!",
        textEn: "⚽ GOAL! Mexico doubles their lead! Raúl Jiménez scores with a clean strike after a scramble in the box! Goal by Raúl Jiménez, Assist by Roberto Alvarado!",
        scoreAfter: { home: 2, away: 0 }
      },
      {
        minute: 75,
        type: "card",
        textTr: "🟨 Sarı Kart: Brian Gutiérrez rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Brian Gutiérrez receives a yellow card for a hard tackle."
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
        textTr: "⚽ GOL! Çekya öne geçiyor! Ceza sahasındaki kafa vuruşuyla Ladislav Krejčí topu ağlara gönderiyor. Golü atan oyuncu: Ladislav Krejčí, Asisti yapan oyuncu: Vladimír Coufal!",
        textEn: "⚽ GOAL! Czechia takes the lead! Ladislav Krejčí heads the ball into the net. Goal by Ladislav Krejčí, Assist by Vladimír Coufal!",
        scoreAfter: { home: 0, away: 1 }
      },
      {
        minute: 67,
        type: "goal",
        textTr: "⚽ GOL! Güney Kore eşitliği yakalıyor! Ceza sahası dışından Hwang In-beom harika bir vuruşla topu ağlara yolluyor. Golü atan oyuncu: Hwang In-beom, Asisti yapan oyuncu: Lee Kang-in!",
        textEn: "⚽ GOAL! South Korea equalizes! Hwang In-beom sends a superb strike into the net from outside the box. Goal by Hwang In-beom, Assist by Lee Kang-in!",
        scoreAfter: { home: 1, away: 1 }
      },
      {
        minute: 80,
        type: "goal",
        textTr: "⚽ GOL! Güney Kore galibiyet golünü buluyor! Oh Hyeon-gyu altıpas üzerinden yaptığı düzgün vuruşla takımını öne geçiriyor! Golü atan oyuncu: Oh Hyeon-gyu, Asisti yapan oyuncu: Hwang In-beom!",
        textEn: "⚽ GOAL! South Korea scores the winner! Oh Hyeon-gyu slots it home from close range to put his side ahead! Goal by Oh Hyeon-gyu, Assist by Hwang In-beom!",
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

  if (match.id === "B-1") {
    return [
      {
        minute: 1,
        type: "start",
        textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
        textEn: "🏁 The referee blows the whistle and the match begins!",
        scoreAfter: { home: 0, away: 0 }
      },
      {
        minute: 21,
        type: "goal",
        textTr: "⚽ GOL! Bosna-Hersek öne geçiyor! Jovo Lukić ceza sahasında topla buluşup düzgün bir vuruşla topu ağlara yolluyor. Golü atan oyuncu: Jovo Lukić, Asisti yapan oyuncu: Sead Kolašinac!",
        textEn: "⚽ GOAL! Bosnia and Herzegovina take the lead! Jovo Lukić finds the ball in the box and slots it home. Goal by Jovo Lukić, Assist by Sead Kolašinac!",
        scoreAfter: { home: 0, away: 1 }
      },
      {
        minute: 33,
        type: "card",
        textTr: "🟨 Sarı Kart: Alistair Johnston rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Alistair Johnston receives a yellow card for a hard tackle."
      },
      {
        minute: 41,
        type: "card",
        textTr: "🟨 Sarı Kart: Ermedin Demirović rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Ermedin Demirović receives a yellow card for a hard tackle."
      },
      {
        minute: 45,
        type: "half",
        textTr: "⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: 0 - 1",
        textEn: "⏸️ Halftime. Teams head to the dressing room. Score: 0 - 1",
        scoreAfter: { home: 0, away: 1 }
      },
      {
        minute: 46,
        type: "start",
        textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
        textEn: "🏁 Second half kicked off. Good luck to both teams!"
      },
      {
        minute: 55,
        type: "card",
        textTr: "🟨 Sarı Kart: Jovo Lukić rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Jovo Lukić receives a yellow card for a hard tackle."
      },
      {
        minute: 64,
        type: "card",
        textTr: "🟨 Sarı Kart: Luc de Fougerolles rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Luc de Fougerolles receives a yellow card for a hard tackle."
      },
      {
        minute: 76,
        type: "sub",
        textTr: "🔄 Oyuncu Değişikliği: Kanada takımında oyuncu değişikliği. Cyle Larin oyuna dahil oluyor.",
        textEn: "🔄 Substitution: For Canada, Cyle Larin comes on.",
      },
      {
        minute: 78,
        type: "goal",
        textTr: "⚽ GOL! Kanada eşitliği yakalıyor! Cyle Larin oyuna girdikten iki dakika sonra ceza sahası dışından harika bir vuruşla golü atıyor! Golü atan oyuncu: Cyle Larin, Asisti yapan oyuncu: Promise David!",
        textEn: "⚽ GOAL! Canada equalizes! Cyle Larin scores with a fantastic strike from outside the box just two minutes after coming on! Goal by Cyle Larin, Assist by Promise David!",
        scoreAfter: { home: 1, away: 1 }
      },
      {
        minute: 88,
        type: "card",
        textTr: "🟨 Sarı Kart: Nikola Katić rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Nikola Katić receives a yellow card for a hard tackle."
      },
      {
        minute: 90,
        type: "commentary",
        textTr: "⏱️ Maçın sonuna en az 4 uzatma dakikası eklendi.",
        textEn: "⏱️ A minimum of 4 minutes of added time announced."
      },
      {
        minute: 94,
        type: "end",
        textTr: "🔚 Son düdük çaldı! Maç bitti. Skor: 1 - 1",
        textEn: "🔚 Full-time! The match is over. Final Score: 1 - 1",
        scoreAfter: { home: 1, away: 1 }
      }
    ];
  }

  if (match.id === "D-1") {
    return [
      {
        minute: 1,
        type: "start",
        textTr: "🏁 Hakem düdüğünü çaldı ve maç başladı!",
        textEn: "🏁 The referee blows the whistle and the match begins!",
        scoreAfter: { home: 0, away: 0 }
      },
      {
        minute: 7,
        type: "goal",
        textTr: "⚽ GOL! ABD öne geçiyor! Damián Bobadilla kendi kalesine gol atıyor! kendi kalesine gol atan oyuncu: Damián Bobadilla!",
        textEn: "⚽ GOAL! USA takes the lead! Damián Bobadilla scores an own goal! own goal by Damián Bobadilla!",
        scoreAfter: { home: 1, away: 0 },
        isHomeGoal: true
      } as any,
      {
        minute: 12,
        type: "card",
        textTr: "🟨 Sarı Kart: Tyler Adams rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Tyler Adams receives a yellow card for a hard tackle."
      },
      {
        minute: 22,
        type: "card",
        textTr: "🟨 Sarı Kart: Diego Gómez rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Diego Gómez receives a yellow card for a hard tackle."
      },
      {
        minute: 31,
        type: "goal",
        textTr: "⚽ GOL! ABD farkı ikiye çıkarıyor! Folarin Balogun ceza sahası dışından sert vuruyor ve golü atıyor! Golü atan oyuncu: Folarin Balogun, Asisti yapan oyuncu: Christian Pulišić!",
        textEn: "⚽ GOAL! USA doubles their lead! Folarin Balogun strikes hard from outside the box and scores! Goal by Folarin Balogun, Assist by Christian Pulišić!",
        scoreAfter: { home: 2, away: 0 },
        isHomeGoal: true
      } as any,
      {
        minute: 44,
        type: "goal",
        textTr: "⚽ GOL! İlk yarının son anlarında Balogun bir kez daha sahnede! Ceza sahasındaki düzgün vuruşu ağlarla buluşuyor! Golü atan oyuncu: Folarin Balogun, Asisti yapan oyuncu: Malik Tillman!",
        textEn: "⚽ GOAL! Balogun on the stage once more at the end of the first half! His neat finish in the box finds the net! Goal by Folarin Balogun, Assist by Malik Tillman!",
        scoreAfter: { home: 3, away: 0 },
        isHomeGoal: true
      } as any,
      {
        minute: 45,
        type: "half",
        textTr: "⏸️ İlk yarı sona erdi. Takımlar soyunma odasına gidiyor. Skor: 3 - 0",
        textEn: "⏸️ Halftime. Teams head to the dressing room. Score: 3 - 0",
        scoreAfter: { home: 3, away: 0 }
      },
      {
        minute: 46,
        type: "start",
        textTr: "🏁 İkinci yarı başladı. İki takıma da başarılar!",
        textEn: "🏁 Second half kicked off. Good luck to both teams!"
      },
      {
        minute: 52,
        type: "card",
        textTr: "🟨 Sarı Kart: Álex Arce rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Álex Arce receives a yellow card for a hard tackle."
      },
      {
        minute: 60,
        type: "card",
        textTr: "🟨 Sarı Kart: Juan José Cáceres rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Juan José Cáceres receives a yellow card for a hard tackle."
      },
      {
        minute: 73,
        type: "goal",
        textTr: "⚽ GOL! Paraguay farkı ikiye indiriyor! Oyuna sonradan giren Maurício ceza sahasında topla buluşup şık bir gol atıyor! Golü atan oyuncu: Maurício, Asisti yapan oyuncu: Julio César Enciso!",
        textEn: "⚽ GOAL! Paraguay reduces the deficit! Substitute Maurício gets the ball in the box and scores a lovely goal! Goal by Maurício, Assist by Julio César Enciso!",
        scoreAfter: { home: 3, away: 1 },
        isHomeGoal: false
      } as any,
      {
        minute: 78,
        type: "card",
        textTr: "🟨 Sarı Kart: Júnior Alonso rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Júnior Alonso receives a yellow card for a hard tackle."
      },
      {
        minute: 84,
        type: "card",
        textTr: "🟨 Sarı Kart: Miguel Almirón rakibine yaptığı sert müdahale sonrası sarı kart görüyor.",
        textEn: "🟨 Yellow Card: Miguel Almirón receives a yellow card for a hard tackle."
      },
      {
        minute: 90,
        type: "goal",
        textTr: "⚽ GOL! ABD son sözü söylüyor! Giovanni Reyna harika bir kontra atak sonrası golü buluyor! Golü atan oyuncu: Giovanni Reyna, Asisti yapan oyuncu: Alex Freeman!",
        textEn: "⚽ GOAL! USA has the final say! Giovanni Reyna scores after a great counter-attack! Goal by Giovanni Reyna, Assist by Alex Freeman!",
        scoreAfter: { home: 4, away: 1 },
        isHomeGoal: true
      } as any,
      {
        minute: 94,
        type: "end",
        textTr: "🔚 Son düdük çaldı! Maç bitti. Skor: 4 - 1",
        textEn: "🔚 Full-time! The match is over. Final Score: 4 - 1",
        scoreAfter: { home: 4, away: 1 }
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

  const getDeterministicPlayer = (isHome: boolean, s: number, type: "goal" | "assist" | "card" = "goal") => {
    const list = isHome ? homePlayers : awayPlayers;
    if (!list || list.length === 0) return isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu";

    const getGeneralPositionLocal = (pos: string): "GK" | "DEF" | "MID" | "FWD" => {
      const p = pos?.toLowerCase() || "";
      if (p.includes("kaleci") || p.includes("gk")) return "GK";
      if (p.includes("defans") || p.includes("bek") || p.includes("stoper") || p.includes("df")) return "DEF";
      if (p.includes("orta saha") || p.includes("libero") || p.includes("midfielder") || p.includes("mf") || p.includes("açık")) return "MID";
      if (p.includes("forvet") || p.includes("fw")) return "FWD";
      return "FWD";
    };

    const playersWithWeights = list.map((p) => {
      const pos = getGeneralPositionLocal(p.player_position || p.position || "MID");
      let weight = 1;
      const name = (p.player_name || p.name || "").toLowerCase();

      if (type === "goal") {
        if (pos === "GK") weight = 0.001;
        else if (pos === "DEF") weight = 1;
        else if (pos === "MID") weight = 4;
        else if (pos === "FWD") weight = 15;

        // Boost world-class goalscoring superstars
        if (
          name.includes("messi") ||
          name.includes("mbappe") ||
          name.includes("haaland") ||
          name.includes("kane") ||
          name.includes("ronaldo") ||
          name.includes("vinicius") ||
          name.includes("yamal") ||
          name.includes("lewandowski") ||
          name.includes("salah") ||
          name.includes("griezmann") ||
          name.includes("bellingham") ||
          name.includes("alvarez") ||
          name.includes("martinez")
        ) {
          weight *= 4;
        }
      } else if (type === "assist") {
        if (pos === "GK") weight = 0.01;
        else if (pos === "DEF") weight = 2;
        else if (pos === "MID") weight = 10;
        else if (pos === "FWD") weight = 6;

        // Boost world-class playmaking superstars
        if (
          name.includes("messi") ||
          name.includes("mbappe") ||
          name.includes("de bruyne") ||
          name.includes("neymar") ||
          name.includes("wirtz") ||
          name.includes("musiala") ||
          name.includes("bellingham") ||
          name.includes("kroos") ||
          name.includes("pedri") ||
          name.includes("yamal") ||
          name.includes("fernandes") ||
          name.includes("saka") ||
          name.includes("foden")
        ) {
          weight *= 4;
        }
      } else if (type === "card") {
        if (pos === "GK") weight = 0.5;
        else if (pos === "DEF") weight = 5;
        else if (pos === "MID") weight = 4;
        else if (pos === "FWD") weight = 2;
      }
      return { player: p, weight };
    });

    const totalWeight = playersWithWeights.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight === 0) {
      const idx = Math.floor(rand(s) * list.length);
      const p = list[idx];
      return p.player_name || p.name || (isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu");
    }

    let r = rand(s) * totalWeight;
    for (const item of playersWithWeights) {
      r -= item.weight;
      if (r <= 0) {
        return item.player.player_name || item.player.name || (isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu");
      }
    }
    const p = list[list.length - 1];
    return p.player_name || p.name || (isHome ? "Ev Sahibi Oyuncu" : "Deplasman Oyuncu");
  };

  const hasRealScore = match && typeof match.homeScore === "number" && typeof match.awayScore === "number";
  const targetHomeGoals = hasRealScore ? match.homeScore : (rand(seed + 2) > 0.5 ? 1 : 0) + (rand(seed + 12) > 0.5 ? 1 : 0);
  const targetAwayGoals = hasRealScore ? match.awayScore : (2 - targetHomeGoals);

  const gameEvents: SimEvent[] = [];

  for (let i = 0; i < targetHomeGoals; i++) {
    const min = Math.floor(rand(seed + 100 + i) * 80) + 5;
    const scorer = getDeterministicPlayer(true, seed + 110 + i, "goal");
    const hasAssist = rand(seed + 115 + i) > 0.3;
    let assister = "";
    if (hasAssist) {
      let tries = 0;
      while (tries < 5) {
        const potential = getDeterministicPlayer(true, seed + 120 + i + tries, "assist");
        if (potential !== scorer) {
          assister = potential;
          break;
        }
        tries++;
      }
    }

    const textTr = assister
      ? `⚽ GOL! Ev sahibi ekip golü buluyor! Golü atan oyuncu: ${scorer}, Asisti yapan oyuncu: ${assister}!`
      : `⚽ GOL! Ev sahibi ekip golü buluyor! Golü atan oyuncu: ${scorer}!`;

    const textEn = assister
      ? `⚽ GOAL! The home side scores! Goal by ${scorer}, Assist by ${assister}!`
      : `⚽ GOAL! The home side scores! Goal by ${scorer}!`;

    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "goal",
      textTr,
      textEn,
      isHomeGoal: true
    } as any);
  }

  for (let i = 0; i < targetAwayGoals; i++) {
    const min = Math.floor(rand(seed + 200 + i) * 80) + 5;
    const scorer = getDeterministicPlayer(false, seed + 220 + i, "goal");
    const hasAssist = rand(seed + 225 + i) > 0.3;
    let assister = "";
    if (hasAssist) {
      let tries = 0;
      while (tries < 5) {
        const potential = getDeterministicPlayer(false, seed + 230 + i + tries, "assist");
        if (potential !== scorer) {
          assister = potential;
          break;
        }
        tries++;
      }
    }

    const textTr = assister
      ? `⚽ GOL! Deplasman ekibi golü buluyor! Golü atan oyuncu: ${scorer}, Asisti yapan oyuncu: ${assister}!`
      : `⚽ GOL! Deplasman ekibi golü buluyor! Golü atan oyuncu: ${scorer}!`;

    const textEn = assister
      ? `⚽ GOAL! The away side scores! Goal by ${scorer}, Assist by ${assister}!`
      : `⚽ GOAL! The away side scores! Goal by ${scorer}!`;

    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "goal",
      textTr,
      textEn,
      isHomeGoal: false
    } as any);
  }

  const cardCount = Math.floor(rand(seed + 300) * 3) + 1;
  for (let i = 0; i < cardCount; i++) {
    const min = Math.floor(rand(seed + 310 + i) * 80) + 5;
    const isHomeCard = rand(seed + 320 + i) > 0.5;
    const playerCard = getDeterministicPlayer(isHomeCard, seed + 330 + i, "card");
    gameEvents.push({
      minute: min === 45 ? 44 : min,
      type: "card",
      textTr: `🟨 Sarı Kart: ${playerCard} rakibine yaptığı sert müdahale sonrası sarı kart görüyor.`,
      textEn: `🟨 Yellow Card: ${playerCard} receives a yellow card for a hard tackle.`,
    });
  }

  const subMin = Math.floor(rand(seed + 400) * 20) + 55;
  const subHome = rand(seed + 410) > 0.5;
  const subOut = getDeterministicPlayer(subHome, seed + 420, "card");
  const subIn = getDeterministicPlayer(subHome, seed + 430, "card");
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
