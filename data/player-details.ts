import { getTeamById } from "@/data/teams";

export interface PlayerDetail {
  bio: Record<string, string>;
  stats: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    passes: number;
    tackles: number;
    rating: number;
  };
}

// Special hand-crafted details for tournament star players
const starPlayerDetails: Record<string, PlayerDetail> = {
  // South Korea - Son Heung-min (typically mapped as kor-p24 or similar, we'll map by lowercase name key or id)
  "son-heung-min": {
    bio: {
      tr: "Son Heung-min, Kore futbolunun gelmiş geçmiş en büyük efsanesidir. Tottenham Hotspur formasıyla Premier Lig gol kralı olmuş, hızı, bitiriciliği ve liderliğiyle ülkesini 2026 Dünya Kupası'nda zafere taşımayı hedeflemektedir.",
      en: "Son Heung-min is arguably the greatest legend in Korean football history. A Premier League Golden Boot winner with Tottenham Hotspur, his blistering pace, clinical finishing, and leading presence steer Korea in the 2026 World Cup.",
      es: "Son Heung-min es posiblemente la mayor leyenda de la historia del fútbol coreano. Ganador de la Bota de Oro con el Tottenham, su velocidad y su liderazgo guían a Corea en este Mundial.",
      fr: "Son Heung-min est sans conteste la plus grande légende du football coréen. Meilleur buteur de Premier League avec Tottenham, sa vitesse et son leadership guident l'équipe nationale.",
      de: "Son Heung-min ist die größte Legende des südkoreanischen Fußballs. Der Premier-League-Torschützenkönig führt sein Land mit Schnelligkeit und Abschlussstärke in die WM 2026."
    },
    stats: { matchesPlayed: 112, goals: 48, assists: 24, passes: 3120, tackles: 42, rating: 8.8 }
  },
  // Mexico - Guillermo Ochoa
  "guillermo-ochoa": {
    bio: {
      tr: "Guillermo Ochoa, Dünya Kupası tarihinin en ikonik kalecilerinden biridir. Özellikle turnuvalarda gösterdiği inanılmaz refleksler ve devleşen performansıyla tanınır. Meksika kalesinin aşılmaz duvarıdır.",
      en: "Guillermo Ochoa is one of the most iconic goalkeepers in World Cup history. Famous for his mind-blowing reflexes and spectacular big-stage tournament saves, he remains Mexico's ultimate wall.",
      es: "Guillermo Ochoa es uno de los porteros más icónicos del Mundial. Célebre por sus reflejos felinos y atajadas espectaculares, sigue siendo la muralla de México.",
      fr: "Guillermo Ochoa est l'un des gardiens les plus emblématiques de la Coupe du Monde. Célèbre pour ses réflexes incroyables sur la ligne, il est le rempart ultime du Mexique.",
      de: "Guillermo Ochoa ist einer der kultigsten Torhüter der WM-Geschichte. Bekannt für seine unglaublichen Reflexe bei großen Turnieren ist er der Fels in der Brandung Mexikos."
    },
    stats: { matchesPlayed: 135, goals: 0, assists: 1, passes: 2100, tackles: 5, rating: 8.5 }
  }
};

// Generates dynamic, realistic mock bios and statistics for any player based on position and team
export function getPlayerDetail(
  playerId: string,
  playerName: string,
  playerPosition: string,
  teamId: string
): PlayerDetail {
  const key = playerName.toLowerCase().replace(/\s+/g, "-");
  if (starPlayerDetails[key]) {
    return starPlayerDetails[key];
  }

  // Consistent hash based on player name for determinism
  let hash = 0;
  for (let i = 0; i < playerName.length; i++) {
    hash = (hash << 5) - hash + playerName.charCodeAt(i);
  }
  hash = Math.abs(hash);

  const team = getTeamById(teamId);
  const teamNameTr = team ? team.nameTr : "Ülkesi";
  const teamNameEn = team ? team.nameEn : "Country";

  // Build a highly realistic bio in 5 languages
  const bio: Record<string, string> = {
    tr: `${playerName}, kulüp düzeyindeki başarılı performansıyla göze batan ve ${teamNameTr} milli takım kadrosunun vazgeçilmez bir parçası haline gelen elit bir sporcudur. ${playerPosition} mevkiindeki üstün taktik bilinciyle 2026 FIFA Dünya Kupası finallerinde ülkesini başarıyla temsil etmektedir.`,
    en: `${playerName} is an elite athlete who has established himself as a vital piece of the ${teamNameEn} national squad through consistent club performances. Exhibiting exceptional tactical maturity in the ${playerPosition} position, he proudly represents his country in the 2026 FIFA World Cup.`,
    es: `${playerName} es un atleta de élite y pieza clave del seleccionado de ${teamNameEn} gracias a su regularidad a nivel de clubes. Con gran disciplina en la posición de ${playerPosition}, representa a su país en este Mundial.`,
    fr: `${playerName} est un athlète d'élite devenu un rouage essentiel de la sélection de ${teamNameEn}. Fort d'une grande rigueur tactique au poste de ${playerPosition}, il défend avec fierté ses couleurs en Coupe du Monde.`,
    de: `${playerName} ist ein erstklassiger Athlet, der sich durch starke Vereinsleistungen fest im Kader von ${teamNameEn} etabliert hat. Mit hoher taktischer Reife auf der Position ${playerPosition} vertritt er sein Land stolz bei dieser WM.`
  };

  // Generate realistic statistics based on position
  let matchesPlayed = 15 + (hash % 30);
  let goals = 0;
  let assists = 0;
  let passes = 300 + (hash % 1200);
  let tackles = 20 + (hash % 180);
  let rating = Number((7.0 + (hash % 20) / 10).toFixed(1));

  if (playerPosition.toUpperCase() === "FW") {
    goals = 2 + (hash % 12);
    assists = 1 + (hash % 8);
    tackles = 5 + (hash % 20);
  } else if (playerPosition.toUpperCase() === "MF") {
    goals = 1 + (hash % 5);
    assists = 2 + (hash % 10);
    tackles = 15 + (hash % 80);
  } else if (playerPosition.toUpperCase() === "DF") {
    goals = hash % 5 === 0 ? 1 : 0;
    assists = hash % 8 === 0 ? 1 : 0;
    tackles = 40 + (hash % 120);
  } else if (playerPosition.toUpperCase() === "GK") {
    goals = 0;
    assists = 0;
    tackles = 1;
  }

  return {
    bio,
    stats: {
      matchesPlayed,
      goals,
      assists,
      passes,
      tackles,
      rating
    }
  };
}
