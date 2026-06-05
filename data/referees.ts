import { LocalizedText } from "./country-details";

export interface Referee {
  id: string;
  name: string;
  age: number;
  image: string; // Unsplash action photo
  yellowCardsAvg: number;
  redCardsAvg: number;
  country: LocalizedText;
  bio: LocalizedText;
  importantMatches: {
    tr: string[];
    en: string[];
    es: string[];
    fr: string[];
    de: string[];
  };
}

export const REFEREES: Referee[] = [
  {
    id: "marciniak",
    name: "Szymon Marciniak",
    age: 45,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80",
    yellowCardsAvg: 4.35,
    redCardsAvg: 0.18,
    country: {
      tr: "Polonya",
      en: "Poland",
      es: "Polonia",
      fr: "Pologne",
      de: "Polen"
    },
    bio: {
      tr: "Szymon Marciniak, dünyanın en prestijli hakemlerinden biridir. Atletik yapısı, oyuncularla kurduğu net iletişim ve baskı anlarında sergilediği sakinlikle tanınır. 2022 FIFA Dünya Kupası finalini yöneterek tarihe geçmiştir.",
      en: "Szymon Marciniak is one of the most prestigious referees in the world. He is known for his athletic build, clear communication with players, and calm composure under extreme pressure. He made history by officiating the 2022 FIFA World Cup Final.",
      es: "Szymon Marciniak es uno de los árbitros más prestigiosos del mundo. Es conocido por su constitución atlética, su comunicación clara con los jugadores y su calma bajo una presión extrema. Hizo historia al arbitrar la final de la Copa del Mundo 2022.",
      fr: "Szymon Marciniak est l'un des arbitres les plus prestigieux au monde. Il est réputé pour sa condition athlétique, son dialogue clair avec les joueurs et son calme olympien sous la pression. Il a arbitré la finale de la Coupe du Monde 2022.",
      de: "Szymon Marciniak ist einer der renommiertesten Schiedsrichter weltweit. Er ist bekannt für seine Athletik, klare Kommunikation mit den Spielern und eiserne Ruhe unter Druck. Er leitete das legendäre WM-Finale 2022."
    },
    importantMatches: {
      tr: [
        "2022 FIFA Dünya Kupası Finali (Arjantin - Fransa)",
        "2023 UEFA Şampiyonlar Ligi Finali (Man. City - Inter)",
        "2018 UEFA Süper Kupası (Real Madrid - Atlético)"
      ],
      en: [
        "2022 FIFA World Cup Final (Argentina vs France)",
        "2023 UEFA Champions League Final (Man. City vs Inter)",
        "2018 UEFA Super Cup (Real Madrid vs Atlético)"
      ],
      es: [
        "Final de la Copa Mundial FIFA 2022 (Argentina vs Francia)",
        "Final de la UEFA Champions League 2023 (Man. City vs Inter)",
        "Supercopa de la UEFA 2018 (Real Madrid vs Atlético)"
      ],
      fr: [
        "Finale de la Coupe du Monde de la FIFA 2022 (Argentine vs France)",
        "Finale de la Ligue des Champions de l'UEFA 2023 (Man. City vs Inter)",
        "Supercoupe de l'UEFA 2018 (Real Madrid vs Atlético)"
      ],
      de: [
        "FIFA WM-Finale 2022 (Argentinien - Frankreich)",
        "UEFA Champions League Finale 2023 (Man. City - Inter)",
        "UEFA Super Cup 2018 (Real Madrid - Atlético)"
      ]
    }
  },
  {
    id: "zwayer",
    name: "Felix Zwayer",
    age: 45,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80",
    yellowCardsAvg: 4.12,
    redCardsAvg: 0.14,
    country: {
      tr: "Almanya",
      en: "Germany",
      es: "Alemania",
      fr: "Allemagne",
      de: "Deutschland"
    },
    bio: {
      tr: "Felix Zwayer, Almanya'nın en tecrübeli Bundesliga ve UEFA elit kategori hakemlerinden biridir. Sahadaki kararlı yönetimi, taktiksel oyun anlayışı ve sakinliği ile tanınır. 2023 UEFA Uluslar Ligi finali de dahil olmak üzere birçok üst düzey kulüp ve milli takım müsabakasını yönetmiştir.",
      en: "Felix Zwayer is one of Germany's most experienced Bundesliga and UEFA Elite category referees. He is known for his decisive management on the pitch, tactical game understanding, and composure. He has refereed many top-level club and national team matches, including the 2023 UEFA Nations League Final.",
      es: "Felix Zwayer es uno de los árbitros de la Bundesliga y de la categoría Elite de la UEFA más experimentados de Alemania. Destaca por su arbitraje firme, su comprensión táctica del juego y su templanza.",
      fr: "Felix Zwayer est l'un des arbitres de Bundesliga et de la catégorie UEFA Elite les plus expérimentés d'Allemagne. Il est réputé pour son autorité sur le terrain, sa lecture tactique et son calme.",
      de: "Felix Zwayer ist einer der erfahrensten Bundesliga- und UEFA-Elite-Schiedsrichter Deutschlands. Er ist bekannt für seine konsequente Spielleitung, sein taktisches Verständnis und seine Gelassenheit. Er leitete unter anderem das UEFA Nations League Finale 2023."
    },
    importantMatches: {
      tr: [
        "2023 UEFA Uluslar Ligi Finali (Hırvatistan - İspanya)",
        "2024 UEFA Euro Yarı Finali (Hollanda - İngiltere)",
        "Çok sayıda UEFA Şampiyonlar Ligi ve Bundesliga Derbisi"
      ],
      en: [
        "2023 UEFA Nations League Final (Croatia vs Spain)",
        "2024 UEFA Euro Semi-Final (Netherlands vs England)",
        "Numerous UEFA Champions League and Bundesliga Derbies"
      ],
      es: [
        "Final de la UEFA Nations League 2023 (Croacia vs España)",
        "Semifinal de la UEFA Euro 2024 (Países Bajos vs Inglaterra)",
        "Numerosos partidos de UEFA Champions League y derbis de la Bundesliga"
      ],
      fr: [
        "Finale de la Ligue des Nations de l'UEFA 2023 (Croatie vs Espagne)",
        "Demi-finale de l'UEFA Euro 2024 (Pays-Bas vs Angleterre)",
        "Nombreux matchs de Ligue des Champions et derbys de Bundesliga"
      ],
      de: [
        "UEFA Nations League Finale 2023 (Kroatien - Spanien)",
        "UEFA Euro Halbfinale 2024 (Niederlande - England)",
        "Zahlreiche UEFA Champions League und Bundesliga Derbys"
      ]
    }
  },
  {
    id: "turpin",
    name: "Clément Turpin",
    age: 43,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80",
    yellowCardsAvg: 3.85,
    redCardsAvg: 0.21,
    country: {
      tr: "Fransa",
      en: "France",
      es: "Francia",
      fr: "France",
      de: "Frankreich"
    },
    bio: {
      tr: "Fransız futbolunun en güvendiği isim olan Clément Turpin, sahada otoriter duruşu ve soğukkanlılığıyla tanınır. UEFA organizasyonlarında en yüksek puanlı hakemlerden biri olup, 2022 Şampiyonlar Ligi finalini yönetmiştir.",
      en: "Clément Turpin, the most trusted name in French refereeing, is known for his authoritative stance on the field and calm demeanor. He is one of the highest-rated referees in UEFA competitions.",
      es: "Clément Turpin, el árbitro más confiable de Francia, es conocido por su postura autoritaria en el campo y su comportamiento tranquilo. Es uno de los mejor valorados en las competiciones de la UEFA.",
      fr: "Clément Turpin, figure de proue de l'arbitrage français, est réputé pour son autorité naturelle et son calme. Il figure parmi les arbitres les mieux notés des compétitions de l'UEFA.",
      de: "Clément Turpin ist der profilierteste französische Schiedsrichter. Er ist bekannt für seine natürliche Autorität auf dem Platz und seine Gelassenheit. Er leitete unter anderem das Champions League Finale 2022."
    },
    importantMatches: {
      tr: [
        "2022 UEFA Şampiyonlar Ligi Finali (Liverpool - Real Madrid)",
        "2021 UEFA Avrupa Ligi Finali (Villarreal - Man. United)",
        "2018 FIFA Dünya Kupası Grup Müsabakaları"
      ],
      en: [
        "2022 UEFA Champions League Final (Liverpool vs Real Madrid)",
        "2021 UEFA Europa League Final (Villarreal vs Man. United)",
        "2018 FIFA World Cup Group Matches"
      ],
      es: [
        "Final de la UEFA Champions League 2022 (Liverpool vs Real Madrid)",
        "Final de la UEFA Europa League 2021 (Villarreal vs Man. United)",
        "Partidos de la fase de grupos de la Copa Mundial FIFA 2018"
      ],
      fr: [
        "Finale de la Ligue des Champions 2022 (Liverpool vs Real Madrid)",
        "Finale de la Ligue Europa 2021 (Villarreal vs Man. United)",
        "Matchs de poule de la Coupe du Monde de la FIFA 2018"
      ],
      de: [
        "UEFA Champions League Finale 2022 (Liverpool - Real Madrid)",
        "UEFA Europa League Finale 2021 (Villarreal - Man. United)",
        "FIFA WM 2018 Gruppenspiele"
      ]
    }
  },
  {
    id: "taylor",
    name: "Anthony Taylor",
    age: 47,
    image: "https://images.unsplash.com/photo-1508344928928-7137b29de216?auto=format&fit=crop&w=400&q=80",
    yellowCardsAvg: 4.12,
    redCardsAvg: 0.15,
    country: {
      tr: "İngiltere",
      en: "England",
      es: "Inglaterra",
      fr: "Angleterre",
      de: "England"
    },
    bio: {
      tr: "Anthony Taylor, Premier Lig'in en tecrübeli hakemlerindendir. Hızlı tempodaki İngiliz futbolunda kazandığı tecrübeyle ikili mücadelelerde oyunun devam etmesini desteklemesiyle ve kartlarına dengeli başvurmasıyla bilinir.",
      en: "Anthony Taylor is one of the most experienced referees in the Premier League. With experience gained in fast-paced English football, he is known for letting the game flow and using cards effectively.",
      es: "Anthony Taylor es uno de los árbitros más experimentados de la Premier League. Con su experiencia en el rápido fútbol inglés, destaca por dejar jugar y sancionar de manera equilibrada.",
      fr: "Anthony Taylor est l'un des arbitres les plus expérimentés de la Premier League. Rompu au rythme effréné du football anglais, il favorise la fluidité du jeu et utilise ses cartons avec parcimonie.",
      de: "Anthony Taylor gehört zu den erfahrensten Premier-League-Schiedsrichtern. Durch seine Erfahrung im schnellen englischen Fußball lässt er das Spiel gerne laufen und behält stets die Kontrolle."
    },
    importantMatches: {
      tr: [
        "2023 UEFA Avrupa Ligi Finali (Sevilla - Roma)",
        "2021 UEFA Uluslar Ligi Finali (İspanya - Fransa)",
        "2020 UEFA Süper Kupası (Bayern Münih - Sevilla)"
      ],
      en: [
        "2023 UEFA Europa League Final (Sevilla vs Roma)",
        "2021 UEFA Nations League Final (Spain vs France)",
        "2020 UEFA Super Cup (Bayern Munich vs Sevilla)"
      ],
      es: [
        "Final de la UEFA Europa League 2023 (Sevilla vs Roma)",
        "Final de la UEFA Nations League 2021 (España vs Francia)",
        "Supercopa de la UEFA 2020 (Bayern de Múnich vs Sevilla)"
      ],
      fr: [
        "Finale de la Ligue Europa 2023 (Séville vs Roma)",
        "Finale de la Ligue des Nations 2021 (Espagne vs France)",
        "Supercoupe de l'UEFA 2020 (Bayern Munich vs Séville)"
      ],
      de: [
        "UEFA Europa League Finale 2023 (Sevilla - Roma)",
        "UEFA Nations League Finale 2021 (Spanien - Frankreich)",
        "UEFA Super Cup 2020 (Bayern München - Sevilla)"
      ]
    }
  }
];

export function getRefereeById(id: string): Referee | undefined {
  return REFEREES.find((r) => r.id === id.toLowerCase());
}
