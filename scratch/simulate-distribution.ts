import { TEAMS } from "../data/teams";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getRealisticClubByTeam(teamId: string, seedNum: number): string {
  const clubMap: Record<string, string[]> = {
    tur: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Başakşehir", "Samsunspor", "Kasımpaşa", "Antalyaspor", "Konyaspor", "Göztepe", "Rizespor"],
    mex: ["Club América", "Guadalajara", "Monterrey", "Tigres UANL", "Cruz Azul", "Pumas UNAM", "Toluca", "Pachuca", "Santos Laguna", "León", "Tijuana"],
    usa: ["Inter Miami", "LA Galaxy", "LAFC", "Seattle Sounders", "Columbus Crew", "New York City FC", "Atlanta United", "Orlando City", "FC Cincinnati", "Philadelphia Union"],
    can: ["Toronto FC", "CF Montréal", "Vancouver Whitecaps", "Forge FC", "Pacific FC", "Halifax Wanderers"],
    bra: ["Flamengo", "Palmeiras", "São Paulo", "Corinthians", "Fluminense", "Grêmio", "Santos", "Atlético Mineiro", "Botafogo", "Internacional", "Cruzeiro"],
    arg: ["River Plate", "Boca Juniors", "Racing Club", "Independiente", "San Lorenzo", "Estudiantes", "Vélez Sarsfield", "Talleres", "Lanús", "Newell's Old Boys"],
    eng: ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United", "Tottenham Hotspur", "Aston Villa", "Newcastle United", "West Ham", "Brighton", "Everton"],
    ger: ["Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig", "VfB Stuttgart", "Eintracht Frankfurt", "Wolfsburg", "Borussia Mönchengladbach", "Freiburg"],
    fra: ["Paris Saint-Germain", "Marseille", "Lyon", "Monaco", "Lille", "Rennes", "Nice", "Lens", "Reims", "Strasbourg"],
    esp: ["Madrid", "Barcelona", "Atlético Madrid", "Real Sociedad", "Real Betis", "Villarreal", "Sevilla", "Athletic Bilbao", "Getafe", "Girona", "Valencia"],
    jpn: ["Vissel Kobe", "Yokohama F. Marinos", "Kawasaki Frontale", "Urawa Reds", "Sanfrecce Hiroshima", "Nagoya Grampus", "Kashima Antlers", "Cerezo Osaka"],
    kor: ["Ulsan HD", "Jeonbuk Hyundai Motors", "FC Seoul", "Pohang Steelers", "Gwangju FC", "Daegu FC", "Incheon United", "Daejeon Hana Citizen"],
    ned: ["Ajax", "PSV Eindhoven", "Feyenoord", "AZ Alkmaar", "FC Utrecht", "FC Twente", "Heerenveen", "Vitesse"],
    por: ["Benfica", "Sporting CP", "FC Porto", "Braga", "Vitória de Guimarães", "Boavista", "Famalicão", "Estoril"],
    uru: ["Peñarol", "Nacional", "Defensor Sporting", "Danubio", "Liverpool FC (Montevideo)", "Montevideo Wanderers", "Cerro Largo"],
    sen: ["ASC Diaraf", "Teungueth FC", "Generation Foot", "Casa Sports", "Jaraaf", "Pikine"],
    mar: ["Wydad AC", "Raja CA", "AS FAR", "RS Berkane", "FUS Rabat", "Ittihad Tanger", "MAS Fes"],
    cro: ["Dinamo Zagreb", "Hajduk Split", "Rijeka", "Osijek", "Lokomotiva Zagreb", "Gorica", "Slaven Belupo"],
    ita: ["Inter Milan", "AC Milan", "Juventus", "Roma", "Napoli", "Lazio", "Atalanta", "Fiorentina", "Torino", "Bologna", "Monza"]
  };

  const hasClub = seedNum % 6 !== 0; // %16'sı Serbest
  if (!hasClub) return "Serbest";

  const domesticClubs = clubMap[teamId];
  const topEuropeanClubs = ["Real Madrid", "Barcelona", "Bayern Munich", "Borussia Dortmund", "Manchester City", "Liverpool", "Arsenal", "Chelsea", "Manchester United", "Paris Saint-Germain", "Inter Milan", "AC Milan", "Juventus", "Benfica", "Ajax", "Atlético Madrid", "Napoli", "Sporting CP", "Feyenoord", "Aston Villa", "Bayer Leverkusen"];

  // Tanımlı yerel ligi olan ülkeler için (Türkiye, İngiltere, Brezilya vb.)
  if (domesticClubs && domesticClubs.length > 0) {
    // %75'i kendi yerel liginde oynuyor
    const playsDomestic = seedNum % 4 !== 0;
    if (playsDomestic) {
      return domesticClubs[seedNum % domesticClubs.length];
    }
    // %25'i Avrupa devlerinde oynuyor (Lejyoner)
    return topEuropeanClubs[seedNum % topEuropeanClubs.length];
  }

  // Yerel ligi tanımlı olmayan ülkeler için (Ekvador, Kolombiya vb.)
  // %30'u Avrupa devlerinde oynuyor
  const playsInEurope = seedNum % 10 < 3;
  if (playsInEurope) {
    return topEuropeanClubs[seedNum % topEuropeanClubs.length];
  }

  // %70'i kendi ülkesindeki bölgesel/uydurma kulüplerde oynuyor
  const prefixes = ["FC", "Sporting", "United", "Athletic", "Club", "Deportivo", "Real", "City"];
  const prefix = prefixes[seedNum % prefixes.length];
  const nameMap: Record<string, string> = {
    ecu: "Quito", col: "Bogota", aus: "Sydney", egy: "Cairo", ksa: "Riyadh",
    civ: "Abidjan", rsa: "Johannesburg", bih: "Sarajevo", qat: "Doha", swe: "Stockholm",
    sco: "Glasgow", tun: "Tunis", bel: "Brussels", hti: "Port-au-Prince", par: "Asuncion",
    irn: "Tehran", cur: "Willemstad", cze: "Prague", nzl: "Auckland", pan: "Panama", gha: "Accra"
  };
  const cityName = nameMap[teamId] || (teamId.toUpperCase() + " City");
  
  if (seedNum % 2 === 0) {
    return `${cityName} ${prefix}`;
  } else {
    return `${prefix} ${cityName}`;
  }
}

function simulate() {
  const clubCounts: Record<string, number> = {};
  
  for (const team of TEAMS) {
    for (let i = 1; i <= 26; i++) {
      const name = `${team.nameTr} Oyuncu ${i}`;
      const seed = hashString(name);
      const club = getRealisticClubByTeam(team.id, seed);
      clubCounts[club] = (clubCounts[club] || 0) + 1;
    }
  }

  const sorted = Object.entries(clubCounts).sort((a, b) => b[1] - a[1]);
  console.log("TOP CLUBS SIMULATION:");
  console.log(sorted.slice(0, 30));
}

simulate();
