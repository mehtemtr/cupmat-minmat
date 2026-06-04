import { supabaseAdmin } from "./supabase";
import { getTeamById, TEAMS } from "@/data/teams";
import { STADIUMS } from "@/data/stadiums";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// TÜRLER (TYPES)
// ============================================================

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  precipitationChance: number;
}

export interface PlayerStatusData {
  playerName: string;
  teamId: string;
  status: "fit" | "injured" | "suspended";
  injuryType?: string;
  expectedReturn?: Date;
  suspensionReason?: string;
  suspensionMatches?: number;
}

export interface MatchPrediction {
  matchId: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  predictedScoreline: string;
  confidence: number;
}

export interface AiCommentary {
  tr: string;
  en: string;
  es: string;
  fr: string;
  de: string;
}

// ============================================================
// YARDIMCI FONKSİYONLAR (HELPERS)
// ============================================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ============================================================
// 1. KADRO GÜNCELLEYİCİ (ROSTER UPDATER)
// ============================================================

export async function updateTeamRosters(force = false): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let updatedCount = 0;

  try {
    const teams = TEAMS;
    
    // En fazla 12 oyuncu limitini korumak için kulüp sayaçlarını tutuyoruz.
    const clubCounts: Record<string, number> = {};
    if (!force) {
      // Eğer sıfırdan doldurmuyorsak, mevcut veritabanındaki oyuncuların kulüp sayılarını yükleyelim
      const { data: existingPlayers } = await supabaseAdmin
        .from("team_rosters")
        .select("club");
      if (existingPlayers) {
        existingPlayers.forEach(p => {
          if (p.club) {
            clubCounts[p.club] = (clubCounts[p.club] || 0) + 1;
          }
        });
      }
    }
    
    for (const team of teams) {
      try {
        // Mevcut kadro sayısını kontrol et
        const { count, error: countError } = await supabaseAdmin
          .from("team_rosters")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id);

        if (countError) {
          errors.push(`Takım ${team.id} kadro sayısı çekilemedi: ${countError.message}`);
          continue;
        }

        const isRealRoster = team.players && team.players.length >= 24;

        // Eğer kadro eksikse veya gerçek bir kadroya sahipsek ve güncellenmesi gerekiyorsa (db ile eşitlemek için zorla)
        if (force || !count || count < 24 || isRealRoster) {
          console.log(`Takım ${team.nameTr} kadrosu güncelleniyor (mevcut: ${count || 0})`);
          
          if (force || isRealRoster) {
            // Eski kadroyu silerek temiz bir kurulum yapalım (çakışma ve eski yer tutucuların kalmasını önler)
            const { error: deleteError } = await supabaseAdmin
              .from("team_rosters")
              .delete()
              .eq("team_id", team.id);
            
            if (deleteError) {
              errors.push(`Takım ${team.id} eski kadrosu silinemedi: ${deleteError.message}`);
            }
          }

          // Örnek oyuncu listesi (gerçek FIFA entegrasyonu buraya gelecek)
          const samplePlayers = generateSampleRoster(team, clubCounts);
          
          for (const player of samplePlayers) {
            const { error } = await supabaseAdmin
              .from("team_rosters")
              .upsert({
                team_id: team.id,
                player_name: player.name,
                player_position: player.position,
                player_number: player.number,
                is_captain: player.isCaptain,
                club: player.club,
                date_of_birth: player.dateOfBirth,
                height: player.height,
                weight: player.weight,
                league: player.league,
                birth_place: player.birthPlace,
                goals: player.goals ?? 0,
                assists: player.assists ?? 0,
                yellow_cards: player.yellowCards ?? 0,
                red_cards: player.redCards ?? 0,
              }, {
                onConflict: "team_id, player_name"
              });

            if (error && error.code !== "23505") {
              errors.push(`Oyuncu ${player.name} eklenemedi: ${error.message}`);
            }
          }
          
          updatedCount++;
        }
      } catch (teamError) {
        errors.push(`Takım ${team.id} işlenirken hata: ${teamError}`);
      }
    }

    // Log kaydı
    await logAgentActivity("roster_updater", "roster_update", errors.length > 0 ? "partial" : "success", updatedCount, errors);

  } catch (error) {
    await logAgentActivity("roster_updater", "roster_update", "failed", 0, [String(error)]);
    errors.push(String(error));
  }

  return {
    success: errors.length === 0,
    updated: updatedCount,
    errors
  };
}

// Doğum yeri belirleme yardımcısı (ülkelere göre gerçekçi şehirler)
function getBirthPlaceByTeam(teamId: string, playerName: string): string {
  const cityMap: Record<string, string[]> = {
    tur: ["İstanbul", "Ankara", "İzmir", "Bursa", "Trabzon", "Adana", "Antalya", "Konya", "Samsun", "Gaziantep", "Kocaeli", "Diyarbakır", "Kayseri", "Rize", "Eskişehir", "Trabzon", "Sivas", "Malatya", "Mersin", "Hatay"],
    mex: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "San Luis Potosí", "Querétaro", "Aguascalientes", "Hermosillo"],
    usa: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Seattle", "Boston", "Miami", "Atlanta", "Chicago", "San Francisco"],
    can: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Halifax", "Hamilton", "London", "Victoria"],
    bra: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Porto Alegre", "Salvador", "Brasília", "Fortaleza", "Recife", "Curitiba", "Manaus", "Santos", "Campinas"],
    arg: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Salta", "Santa Fe", "Mar del Plata", "Bahía Blanca", "Neuquén"],
    eng: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Newcastle", "Bristol", "Leicester", "Nottingham", "Southampton", "Leeds"],
    ger: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Hannover", "Nuremberg"],
    fra: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims"],
    esp: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao", "Las Palmas", "Vigo", "Alicante"],
    jpn: ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Kobe", "Fukuoka", "Kyoto", "Kawasaki", "Saitama", "Hiroshima", "Sendai"],
    kor: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Seongnam", "Jeonju", "Cheonan"],
    ned: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Almere", "Breda", "Nijmegen", "Enschede", "Haarlem"],
    por: ["Lisbon", "Porto", "Braga", "Coimbra", "Funchal", "Faro", "Setúbal", "Aveiro", "Évora", "Guimarães"],
    uru: ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó", "Melo", "Artigas"],
    sen: ["Dakar", "Thiès", "Kaolack", "Ziguinchor", "Saint-Louis", "M'bour", "Rufisque", "Diourbel"],
    mar: ["Casablanca", "Rabat", "Fes", "Marrakech", "Tangier", "Agadir", "Meknes", "Oujda", "Tetouan", "Safi"],
    cro: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod", "Pula", "Karlovac", "Varaždin"]
  };

  const cities = cityMap[teamId];
  const hash = hashString(playerName);
  
  if (cities && cities.length > 0) {
    return cities[hash % cities.length];
  }

  // Genel bölgesel şehir isimleri
  const fallbackCities = ["Capital City", "Port City", "Highlands", "Metropolis", "Valley City", "Coastal Town", "River Town"];
  return fallbackCities[hash % fallbackCities.length];
}

function getRealisticClubByTeam(teamId: string, seedNum: number, clubCounts: Record<string, number> = {}): string {
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

  const CLUB_LIMIT = 12;

  // Helper to check if a club is full
  const isFull = (clubName: string) => {
    if (clubName === "Serbest") return false;
    return (clubCounts[clubName] || 0) >= CLUB_LIMIT;
  };

  // Tanımlı yerel ligi olan ülkeler için (Türkiye, İngiltere, Brezilya vb.)
  if (domesticClubs && domesticClubs.length > 0) {
    const playsDomestic = seedNum % 4 !== 0; // %75'i kendi yerel liginde oynuyor
    if (playsDomestic) {
      for (let attempt = 0; attempt < domesticClubs.length; attempt++) {
        const candidate = domesticClubs[(seedNum + attempt) % domesticClubs.length];
        if (!isFull(candidate)) {
          return candidate;
        }
      }
    }
    
    // %25'i veya yerel kulüpler dolmuşsa Avrupa devlerinde oynuyor (Lejyoner)
    for (let attempt = 0; attempt < topEuropeanClubs.length; attempt++) {
      const candidate = topEuropeanClubs[(seedNum + attempt) % topEuropeanClubs.length];
      if (!isFull(candidate)) {
        return candidate;
      }
    }

    return "Serbest";
  }

  // Yerel ligi tanımlı olmayan ülkeler için (Ekvador, Kolombiya vb.)
  const playsInEurope = seedNum % 10 < 3; // %30'u Avrupa devlerinde oynuyor
  if (playsInEurope) {
    for (let attempt = 0; attempt < topEuropeanClubs.length; attempt++) {
      const candidate = topEuropeanClubs[(seedNum + attempt) % topEuropeanClubs.length];
      if (!isFull(candidate)) {
        return candidate;
      }
    }
  }

  // %70'i veya Avrupa kulüpleri dolmuşsa kendi ülkesindeki bölgesel/uydurma kulüplerde oynuyor
  const prefixes = ["FC", "Sporting", "United", "Athletic", "Club", "Deportivo", "Real", "City"];
  const prefix = prefixes[seedNum % prefixes.length];
  const nameMap: Record<string, string> = {
    ecu: "Quito", col: "Bogota", aus: "Sydney", egy: "Cairo", ksa: "Riyadh",
    civ: "Abidjan", rsa: "Johannesburg", bih: "Sarajevo", qat: "Doha", swe: "Stockholm",
    sco: "Glasgow", tun: "Tunis", bel: "Brussels", hti: "Port-au-Prince", par: "Asuncion",
    irn: "Tehran", cur: "Willemstad", cze: "Prague", nzl: "Auckland", pan: "Panama", gha: "Accra"
  };
  const cityName = nameMap[teamId] || (teamId.toUpperCase() + " City");
  
  const fictionalClub = seedNum % 2 === 0 ? `${cityName} ${prefix}` : `${prefix} ${cityName}`;
  return fictionalClub;
}

function getPlayerPriority(player: any): number {
  const name = (player.name || "").toLowerCase();
  const club = (player.club || "").toLowerCase();
  
  // Custom list of absolute stars who must always be included
  const superstars = [
    "arda güler", "arda guler", "kenan yıldız", "kenan yildiz", "hakan çalhanoğlu", "hakan calhanoglu",
    "semih kılıçsoy", "semih kilicsoy", "mustafa hekimoğlu", "mustafa hekimoglu", "cenk tosun",
    "ernest muçi", "ernest muci", "milot rashica", "gedson fernandes", "rafa silva",
    "altay bayındır", "altay bayindir", "mert günok", "mert gunok", "uğurcan çakır", "ugurcan cakir",
    "abdülkerim bardakcı", "abdulkerim bardakci", "çağlar söyüncü", "caglar soyuncu", "eren elmalı", "eren elmali",
    "ferdi kadıoğlu", "ferdi kadioglu", "merih demiral", "mert müldür", "mert muldur", "ozan kabak",
    "samet akaydin", "zeki çelik", "zeki celik", "ismail yüksek", "ismail yuksek", "kaan ayhan",
    "orkun kökçü", "orkun kokcu", "salih özcan", "salih ozcan", "barış alper yılmaz", "baris alper yilmaz",
    "can uzun", "deniz gül", "deniz gul", "irfan can kahveci", "kerem aktürkoğlu", "kerem akturkoglu",
    "oğuz aydın", "oguz aydin", "yunus akgün", "yunus akgun"
  ];
  if (superstars.some(star => name.includes(star))) {
    return 1000;
  }
  
  // Clubs priority
  if (club.includes("real madrid") || club.includes("juventus") || club.includes("bayern munich") || club.includes("barcelona") || club.includes("manchester city") || club.includes("liverpool") || club.includes("inter milan") || club.includes("ac milan") || club.includes("paris saint-germain") || club.includes("arsenal") || club.includes("chelsea") || club.includes("tottenham") || club.includes("benfica") || club.includes("sporting") || club.includes("porto") || club.includes("ajax") || club.includes("feyenoord") || club.includes("roma") || club.includes("lazio") || club.includes("atalanta") || club.includes("brighton") || club.includes("west ham") || club.includes("bayer leverkusen") || club.includes("dortmund") || club.includes("stuttgart")) {
    return 500;
  }
  
  // Major Turkish clubs
  if (club.includes("beşiktaş") || club.includes("besiktas") || club.includes("bjk")) {
    return 400; // Beşiktaş players high priority
  }
  if (club.includes("fenerbahçe") || club.includes("fenerbahce") || club.includes("galatasaray") || club.includes("trabzonspor")) {
    return 300;
  }
  
  // Other clubs
  if (club === "serbest" || club === "") {
    return 0; // free agents lowest
  }
  
  return 100;
}

// Örnek kadro üretici (gerçek API entegrasyonu veya tanımlı kadro eşleştirici)
function generateSampleRoster(team: any, clubCounts: Record<string, number> = {}) {
  const leagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Süper Lig", "MLS", "Eredivisie"];
  
  const getHeightByPosition = (pos: string, seedNum: number) => {
    const pUpper = pos.toUpperCase();
    if (pUpper.includes("KALECI") || pUpper.includes("GK") || pUpper.includes("STOPER")) {
      return 185 + (seedNum % 14); // 185 - 198 cm
    }
    if (pUpper.includes("FORVET") || pUpper.includes("FW")) {
      return 178 + (seedNum % 15); // 178 - 192 cm
    }
    if (pUpper.includes("MIDFIELDER") || pUpper.includes("MF") || pUpper.includes("LIBERO") || pUpper.includes("SAHA")) {
      return 175 + (seedNum % 14); // 175 - 188 cm
    }
    return 170 + (seedNum % 13); // 170 - 182 cm
  };

  const getWeightByHeight = (h: number, seedNum: number) => {
    return h - 105 + (seedNum % 11 - 5); // height - 105 +/- 5 kg
  };

  const getLeagueByClub = (club: string, seedNum: number) => {
    if (!club || club === "Kulüp Yok" || club === "Serbest") return "Serbest";
    const cUpper = club.toUpperCase();
    if (cUpper.includes("MANCHESTER") || cUpper.includes("WEST HAM") || cUpper.includes("LIVERPOOL") || cUpper.includes("ARSENAL") || cUpper.includes("CHELSEA") || cUpper.includes("HULL CITY") || cUpper.includes("STOKE") || cUpper.includes("SWANSEA") || cUpper.includes("CRYSTAL PALACE") || cUpper.includes("BOURNEMOUTH") || cUpper.includes("BRENTFORD") || cUpper.includes("LEICESTER") || cUpper.includes("LEEDS") || cUpper.includes("ASTON VILLA") || cUpper.includes("TOTTENHAM") || cUpper.includes("CELTIC") || cUpper.includes("BIRMINGHAM")) {
      return "Premier League";
    }
    if (cUpper.includes("REAL MADRID") || cUpper.includes("BARCELONA") || cUpper.includes("SEVILLA") || cUpper.includes("MALLORCA") || cUpper.includes("ATHLETIC BILBAO") || cUpper.includes("VALENCIA") || cUpper.includes("VILLARREAL") || cUpper.includes("ATLETICO")) {
      return "La Liga";
    }
    if (cUpper.includes("INTER MILAN") || cUpper.includes("AC MILAN") || cUpper.includes("JUVENTUS") || cUpper.includes("ROMA") || cUpper.includes("ATALANTA") || cUpper.includes("FIORENTINA") || cUpper.includes("SASSUOLO") || cUpper.includes("SAMPDORIA") || cUpper.includes("SALERNITANA")) {
      return "Serie A";
    }
    if (cUpper.includes("BAYERN") || cUpper.includes("BEYER") || cUpper.includes("LEVERKUSEN") || cUpper.includes("DORTMUND") || cUpper.includes("STUTTGART") || cUpper.includes("MAINZ") || cUpper.includes("AUGSBURG") || cUpper.includes("SCHALKE") || cUpper.includes("SALZBURG") || cUpper.includes("EINTRACHT") || cUpper.includes("KARLSRUHER") || cUpper.includes("MONCHENGLADBACH")) {
      return "Bundesliga";
    }
    if (cUpper.includes("PSG") || cUpper.includes("PARIS") || cUpper.includes("LILLE") || cUpper.includes("MONACO") || cUpper.includes("RENNES") || cUpper.includes("LENS") || cUpper.includes("ANGERS") || cUpper.includes("MONTPELLIER")) {
      return "Ligue 1";
    }
    if (cUpper.includes("BESIKTAS") || cUpper.includes("FENERBAHCE") || cUpper.includes("GALATASARAY") || cUpper.includes("GAZIANTEP") || cUpper.includes("RIZESPOR")) {
      return "Süper Lig";
    }
    if (cUpper.includes("LAFC") || cUpper.includes("MIAMI") || cUpper.includes("COLUMBUS") || cUpper.includes("CHICAGO") || cUpper.includes("ORLANDO") || cUpper.includes("CHARLOTTE") || cUpper.includes("CINCINNATI") || cUpper.includes("VANCOUVER") || cUpper.includes("PHILADELPHIA") || cUpper.includes("NEW YORK")) {
      return "MLS";
    }
    if (cUpper.includes("PSV") || cUpper.includes("FEYENOORD") || cUpper.includes("AJAX") || cUpper.includes("AZ") || cUpper.includes("WILLEM") || cUpper.includes("NEC")) {
      return "Eredivisie";
    }
    return leagues[seedNum % leagues.length];
  };

  // Try to load real player squads scraped from Wikipedia
  let realSquads: Record<string, any[]> = {};
  try {
    const filePath = path.join(process.cwd(), "scratch", "real-squads.json");
    if (fs.existsSync(filePath)) {
      realSquads = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.log("Could not load real-squads.json:", e);
  }

  let wikiPlayers = realSquads[team.id];
  
  if (team.id === "tur" && wikiPlayers) {
    const officialTurkeyNames = [
      "Altay Bayındır", "Mert Günok", "Uğurcan Çakır",
      "Abdülkerim Bardakcı", "Çağlar Söyüncü", "Eren Elmalı", "Ferdi Kadıoğlu", "Merih Demiral", "Mert Müldür", "Ozan Kabak", "Samet Akaydin", "Zeki Çelik",
      "Hakan Çalhanoğlu", "İsmail Yüksek", "Kaan Ayhan", "Orkun Kökçü", "Salih Özcan",
      "Arda Güler", "Barış Alper Yılmaz", "Can Uzun", "Deniz Gül", "İrfan Can Kahveci", "Kenan Yıldız", "Kerem Aktürkoğlu", "Oğuz Aydın", "Yunus Akgün"
    ];

    const normalizeNameStr = (str: string) => {
      return str
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u")
        .replace(/ñ/g, "n")
        .replace(/á/g, "a")
        .replace(/é/g, "e")
        .replace(/í/g, "i")
        .replace(/ó/g, "o")
        .replace(/ú/g, "u")
        .replace(/â/g, "a")
        .replace(/î/g, "i")
        .replace(/û/g, "u")
        .replace(/ø/g, "o")
        .replace(/æ/g, "ae")
        .replace(/å/g, "a")
        .replace(/[^a-z0-9]/g, "");
    };

    const officialNormalized = officialTurkeyNames.map(normalizeNameStr);
    wikiPlayers = wikiPlayers.filter((p: any) => {
      const norm = normalizeNameStr(p.name);
      return officialNormalized.includes(norm);
    });
    console.log(`Filtered Turkey wikiPlayers down to ${wikiPlayers.length} players matching FIFA squad list.`);
  }

  if (wikiPlayers && wikiPlayers.length >= 10) {
    // Priority-based balanced selection to get exactly 26 players (3 GKs, 23 outfielders)
    const gks = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("GK"));
    const dfs = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("DF"));
    const mids = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("MF"));
    const fwds = wikiPlayers.filter((p: any) => p.position.toUpperCase().includes("FW"));

    const sortByPriority = (arr: any[]) => {
      return [...arr].sort((a, b) => getPlayerPriority(b) - getPlayerPriority(a));
    };

    const sortedGks = sortByPriority(gks);
    const sortedDfs = sortByPriority(dfs);
    const sortedMids = sortByPriority(mids);
    const sortedFwds = sortByPriority(fwds);

    const selectedGks = sortedGks.slice(0, 3);
    const minDfs = Math.min(sortedDfs.length, 7);
    const minMids = Math.min(sortedMids.length, 7);
    const minFwds = Math.min(sortedFwds.length, 5);

    const selectedDfs = sortedDfs.slice(0, minDfs);
    const selectedMids = sortedMids.slice(0, minMids);
    const selectedFwds = sortedFwds.slice(0, minFwds);

    const remainingDfs = sortedDfs.slice(minDfs);
    const remainingMids = sortedMids.slice(minMids);
    const remainingFwds = sortedFwds.slice(minFwds);
    const pool = sortByPriority([...remainingDfs, ...remainingMids, ...remainingFwds]);

    const currentOutfieldCount = selectedDfs.length + selectedMids.length + selectedFwds.length;
    const slotsNeeded = 23 - currentOutfieldCount;
    const extraOutfielders = pool.slice(0, slotsNeeded);

    extraOutfielders.forEach((p: any) => {
      const pos = p.position.toUpperCase();
      if (pos.includes("DF")) selectedDfs.push(p);
      else if (pos.includes("MF")) selectedMids.push(p);
      else if (pos.includes("FW")) selectedFwds.push(p);
    });

    const selectedPlayers = [...selectedGks, ...selectedDfs, ...selectedMids, ...selectedFwds];

    return selectedPlayers.map((p: any, idx: number) => {
      let pos = p.position;
      const pUpper = p.position.toUpperCase();
      if (pUpper.includes("GK")) pos = "Kaleci";
      else if (pUpper.includes("DF")) pos = "Defans";
      else if (pUpper.includes("MF")) pos = "Orta Saha";
      else if (pUpper.includes("FW")) pos = "Forvet";

      const isCaptain = idx === 0;
      const age = p.age || 26;
      const dateOfBirth = p.dateOfBirth || `${2026 - age}-06-01`;

      const h = getHeightByPosition(pos, idx);
      const w = getWeightByHeight(h, idx);
      
      const club = p.club || "Serbest";
      if (club && club !== "Serbest") {
        clubCounts[club] = (clubCounts[club] || 0) + 1;
      }
      const league = getLeagueByClub(club, idx);
      const birthPlace = getBirthPlaceByTeam(team.id, p.name);

      return {
        name: p.name,
        position: pos,
        number: idx + 1,
        isCaptain: isCaptain,
        club: club,
        dateOfBirth,
        height: h,
        weight: w,
        league,
        birthPlace
      };
    });
  }

  if (team.players && team.players.length >= 24) {
    return team.players.map((p: any, idx: number) => {
      let pos = p.position;
      const upper = p.position.toUpperCase();
      if (upper === "GK") pos = "Kaleci";
      else if (upper === "DF") pos = "Defans";
      else if (upper === "MF") pos = "Orta Saha";
      else if (upper === "FW") pos = "Forvet";

      const isCaptain = p.name === "Christian Pulisic" || p.name === "Virgil van Dijk" || idx === 0;

      const age = p.age || 26;
      const birthYear = 2026 - age;
      const dateOfBirth = `${birthYear}-01-01`;

      const h = getHeightByPosition(pos, idx);
      const w = getWeightByHeight(h, idx);
      
      const club = p.club || "";
      if (club) {
        clubCounts[club] = (clubCounts[club] || 0) + 1;
      }
      const league = getLeagueByClub(club, idx);
      const birthPlace = getBirthPlaceByTeam(team.id, p.name);

      return {
        name: p.name,
        position: pos,
        number: idx + 1,
        isCaptain: isCaptain,
        club: club,
        dateOfBirth,
        height: h,
        weight: w,
        league,
        birthPlace
      };
    });
  }

  const positions = ["Kaleci", "Stoper", "Sol Bek", "Sağ Bek", "Ön Libero", 
                     "Merkez Midfielder", "Sol Açık", "Sağ Açık", "Ofansif Midfielder", "Forvet"];
  
  const players = [];
  for (let i = 1; i <= 26; i++) {
    const name = `${team.nameTr} Oyuncu ${i}`;
    const seed = hashString(name);
    const age = (seed % 18) + 18; // age 18 to 35
    const birthYear = 2026 - age;
    const dateOfBirth = `${birthYear}-06-01`;

    const pos = positions[i % positions.length];
    const h = getHeightByPosition(pos, seed);
    const w = getWeightByHeight(h, seed);
    
    const club = getRealisticClubByTeam(team.id, seed, clubCounts);
    clubCounts[club] = (clubCounts[club] || 0) + 1;
    const league = getLeagueByClub(club, seed);
    const birthPlace = getBirthPlaceByTeam(team.id, name);

    players.push({
      name: name,
      position: pos,
      number: i,
      isCaptain: i === 1,
      club: club,
      dateOfBirth,
      height: h,
      weight: w,
      league,
      birthPlace
    });
  }
  return players;
}

// ============================================================
// 2. TAHMİN MOTORU (PREDICTION ENGINE)
// ============================================================

export async function generatePredictions(matches: Array<{
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date?: Date;
}>): Promise<{
  predictions: MatchPrediction[];
  weatherData: Map<string, WeatherData>;
  playerStatuses: PlayerStatusData[];
}> {
  const predictions: MatchPrediction[] = [];
  const weatherData = new Map<string, WeatherData>();
  const playerStatuses: PlayerStatusData[] = [];

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) continue;

    const home = getTeamById(match.homeTeamId);
    const away = getTeamById(match.awayTeamId);
    const seed = hashString(match.id + new Date().toISOString().split("T")[0]);

    if (!home || !away) continue;

    // 1. Hava durumu verisi (simülasyon)
    const stadium = STADIUMS[0];
    const mockWeather = generateMockWeather(stadium?.cityTr || home.nameTr, seed);
    weatherData.set(match.id, mockWeather);

    // 2. Oyuncu durumu (simülasyon)
    const mockInjuries = generateMockPlayerStatuses(home.id, away.id, seed);
    playerStatuses.push(...mockInjuries);

    // 3. Tahmin hesaplama
    const rankDiff = (away.fifaRank || 50) - (home.fifaRank || 50);
    let homeWin = 33.33;
    let draw = 33.33;
    let awayWin = 33.33;

    // FIFA sıralamasına göre ağırlık
    if (rankDiff > 20) {
      homeWin = 55 + (seed % 15);
      awayWin = 15 + (seed % 10);
      draw = 100 - homeWin - awayWin;
    } else if (rankDiff < -20) {
      awayWin = 55 + (seed % 15);
      homeWin = 15 + (seed % 10);
      draw = 100 - homeWin - awayWin;
    } else {
      homeWin = 30 + (seed % 15);
      awayWin = 30 + ((seed >> 2) % 15);
      draw = 100 - homeWin - awayWin;
    }

    // Hava durumu etkisi
    if (mockWeather.condition === "snow" || mockWeather.temperature < 5) {
      draw += 10;
      homeWin -= 5;
      awayWin -= 5;
    }

    // Skor tahmini
    let h = 1 + Math.floor((homeWin / 40) * (seed % 3));
    let a = 1 + Math.floor((awayWin / 40) * ((seed >> 1) % 3));
    if (h === 0 && a === 0) h = 1;

    predictions.push({
      matchId: match.id,
      homeWin: Math.round(homeWin * 100) / 100,
      draw: Math.round(draw * 100) / 100,
      awayWin: Math.round(awayWin * 100) / 100,
      predictedScoreline: `${h}-${a}`,
      confidence: 0.6 + (Math.abs(rankDiff) / 200)
    });

    // 4. Veritabanına kaydet
    await saveMatchAnalysis(match.id, match.homeTeamId, match.awayTeamId, {
      homeWin,
      draw,
      awayWin,
      scoreline: `${h}-${a}`,
      confidence: 0.6 + (Math.abs(rankDiff) / 200),
      weather: mockWeather,
      injuries: mockInjuries
    });
  }

  return { predictions, weatherData, playerStatuses };
}

function generateMockWeather(city: string, seed: number): WeatherData {
  const conditions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
  const condition = conditions[seed % conditions.length];
  return {
    city,
    temperature: 10 + (seed % 25),
    condition,
    windSpeed: 5 + (seed % 30),
    humidity: 40 + (seed % 50),
    precipitationChance: condition === "rainy" ? 70 + (seed % 30) : condition === "snowy" ? 60 + (seed % 40) : 10 + (seed % 20)
  };
}

function generateMockPlayerStatuses(homeTeamId: string, awayTeamId: string, seed: number): PlayerStatusData[] {
  const statuses: PlayerStatusData[] = [];
  
  // Rastgele sakatlık/ceza oluştur (gerçek API entegrasyonu için yer tutucu)
  if (seed % 7 === 0) {
    statuses.push({
      playerName: "Kritik Forvet",
      teamId: homeTeamId,
      status: "injured",
      injuryType: "Ayak bileği burkulması",
      expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }
  
  if (seed % 11 === 0) {
    statuses.push({
      playerName: "Defansif Midfielder",
      teamId: awayTeamId,
      status: "suspended",
      suspensionReason: "Sarı kart birikmesi",
      suspensionMatches: 1
    });
  }
  
  return statuses;
}

async function saveMatchAnalysis(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  data: {
    homeWin: number;
    draw: number;
    awayWin: number;
    scoreline: string;
    confidence: number;
    weather: WeatherData;
    injuries: PlayerStatusData[];
  }
) {
  try {
    await supabaseAdmin
      .from("match_analyses")
      .upsert({
        match_id: matchId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        prediction_home_win: data.homeWin,
        prediction_draw: data.draw,
        prediction_away_win: data.awayWin,
        predicted_scoreline: data.scoreline,
        analysis_confidence: data.confidence,
        weather_data: data.weather,
        injury_data: data.injuries,
        last_updated: new Date().toISOString()
      }, {
        onConflict: "match_id"
      });
  } catch (error) {
    console.error("Maç analizi kaydedilemedi:", error);
  }
}

// ============================================================
// 3. YAPAY ZEKA YORUMLARI (AI COMMENTARY)
// ============================================================

export function generateAiCommentary(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  prediction: MatchPrediction,
  weather: WeatherData,
  injuries: PlayerStatusData[]
): AiCommentary {
  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const seed = hashString(matchId);

  const homeNameTr = home?.nameTr || "Ev Sahibi";
  const homeNameEn = home?.nameEn || "Home";
  const awayNameTr = away?.nameTr || "Deplasman";
  const awayNameEn = away?.nameEn || "Away";

  // Hava durumu etkisi
  let weatherNoteTr = "";
  let weatherNoteEn = "";
  if (weather.condition === "snowy" || weather.temperature < 5) {
    weatherNoteTr = `${weather.city}'da kar yağışı ve aşırı soğuk bekleniyor. Bu durum ${homeNameTr}'ın oyununu etkileyebilir. `;
    weatherNoteEn = `Snow and extreme cold expected in ${weather.city}. This may affect ${homeNameEn}'s performance. `;
  } else if (weather.condition === "rainy") {
    weatherNoteTr = `${weather.city}'da yağmur bekleniyor. Kaygan zemin pas trafiğini yavaşlatabilir. `;
    weatherNoteEn = `Rain expected in ${weather.city}. Slippery pitch may slow down passing. `;
  }

  // Sakatlık etkisi
  let injuryNoteTr = "";
  let injuryNoteEn = "";
  const homeInjuries = injuries.filter(i => i.teamId === homeTeamId);
  const awayInjuries = injuries.filter(i => i.teamId === awayTeamId);

  if (homeInjuries.length > 0) {
    injuryNoteTr = `${homeNameTr}'da ${homeInjuries.length} kritik oyuncu sakat/cezalı. Bu durum gücü düşürüyor. `;
    injuryNoteEn = `${homeNameEn} has ${homeInjuries.length} key players injured/suspended. This weakens their strength. `;
  }
  if (awayInjuries.length > 0) {
    injuryNoteTr = `${awayNameTr}'da ${awayInjuries.length} oyuncu eksik. `;
    injuryNoteEn = `${awayNameEn} missing ${awayInjuries.length} players. `;
  }

  // Ana yorum
  const trTemplates = [
    `Bu maçta ${homeNameTr} ev sahibi avantajıyla %${prediction.homeWin} kazanma şansıyla oynuyor. ${awayNameTr} ise %${prediction.awayWin} ile sürpriz arıyor. ${weatherNoteTr}${injuryNoteTr}Tahmin skorum: ${prediction.predictedScoreline}.`,
    `${homeNameTr} ve ${awayNameTr} arasında zorlu bir mücadele bekliyorum. Beraberlik ihtimali %${prediction.draw} oldukça yüksek. ${weatherNoteTr}${injuryNoteTr}Sonucun ${prediction.predictedScoreline} olacağını düşünüyorum.`,
    `Deplasman ekibi ${awayNameTr} formda görünse de, ${homeNameTr}'ın taraftar desteği belirleyici olabilir. ${weatherNoteTr}${injuryNoteTr}Benim tahminim: ${prediction.predictedScoreline}.`
  ];

  const enTemplates = [
    `${homeNameEn} plays at home with ${prediction.homeWin}% chance of winning. ${awayNameEn} looks for an upset with ${prediction.awayWin}%. ${weatherNoteEn}${injuryNoteEn}My predicted score: ${prediction.predictedScoreline}.`,
    `I expect a tough battle between ${homeNameEn} and ${awayNameEn}. Draw probability is quite high at ${prediction.draw}%. ${weatherNoteEn}${injuryNoteEn}I think it will end ${prediction.predictedScoreline}.`,
    `Although away side ${awayNameEn} looks in form, ${homeNameEn}'s fan support could be decisive. ${weatherNoteEn}${injuryNoteEn}My prediction: ${prediction.predictedScoreline}.`
  ];

  return {
    tr: trTemplates[seed % trTemplates.length],
    en: enTemplates[seed % enTemplates.length],
    es: trTemplates[seed % trTemplates.length],
    fr: trTemplates[seed % trTemplates.length],
    de: trTemplates[seed % trTemplates.length]
  };
}

// ============================================================
// AJAN ÇALIŞMA KAYDI (AGENT LOGGING)
// ============================================================

async function logAgentActivity(
  agentName: string,
  taskType: string,
  status: "success" | "failed" | "partial",
  itemsProcessed: number,
  errors?: string[]
) {
  try {
    await supabaseAdmin
      .from("ai_agent_logs")
      .insert({
        agent_name: agentName,
        task_type: taskType,
        status,
        items_processed: itemsProcessed,
        error_message: errors?.join(" | "),
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Log kaydedilemedi:", error);
  }
}

// ============================================================
// ANA ÇALIŞTIRICI (MAIN RUNNER)
// ============================================================

export async function runAiAgent(): Promise<{
  rosterUpdate: any;
  predictions: any;
  success: boolean;
}> {
  console.log("🤖 Akıllı Dünya Kupası Yapay Zeka Ajanı çalışıyor...");

  try {
    // 1. Kadro güncellemesi
    const rosterResult = await updateTeamRosters();
    console.log("✅ Kadro güncellemesi tamamlandı:", rosterResult);

    // 2. Maç tahminleri - Basit örnek maçlar (ileride gerçek maç verileri gelecek)
    const allMatches = TEAMS.slice(0, 10).map((team, index) => ({
      id: `match-${index}`,
      homeTeamId: team.id,
      awayTeamId: TEAMS[(index + 1) % TEAMS.length].id,
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000)
    }));
    
    const predResult = await generatePredictions(allMatches as any);
    console.log("✅ Tahminler tamamlandı:", predResult.predictions.length, "maç");

    // 3. Yorumları kaydet
    for (const pred of predResult.predictions) {
      const weather = predResult.weatherData.get(pred.matchId);
      if (weather) {
        const homeTeamId = allMatches.find((m: any) => m.id === pred.matchId)?.homeTeamId || "";
        const awayTeamId = allMatches.find((m: any) => m.id === pred.matchId)?.awayTeamId || "";
        
        const commentary = generateAiCommentary(
          pred.matchId,
          homeTeamId,
          awayTeamId,
          pred,
          weather,
          predResult.playerStatuses
        );
        
        await supabaseAdmin
          .from("match_analyses")
          .update({
            ai_commentary_tr: commentary.tr,
            ai_commentary_en: commentary.en,
            ai_commentary_es: commentary.es,
            ai_commentary_fr: commentary.fr,
            ai_commentary_de: commentary.de
          })
          .eq("match_id", pred.matchId);
      }
    }

    await logAgentActivity("ai_sports_agent", "full_run", "success", predResult.predictions.length);
    console.log("🎉 Yapay Zeka Ajanı tamamlandı!");

    return {
      rosterUpdate: rosterResult,
      predictions: predResult,
      success: true
    };

  } catch (error) {
    await logAgentActivity("ai_sports_agent", "full_run", "failed", 0, [String(error)]);
    console.error("❌ Yapay Zeka Ajanı hatası:", error);
    throw error;
  }
}
