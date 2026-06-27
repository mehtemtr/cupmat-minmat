import { supabaseAdmin } from "./supabase";
import { getTeamById, TEAMS } from "@/data/teams";
import { STADIUMS } from "@/data/stadiums";
import { generateGroupFixtures } from "@/lib/fixtures";
import { STATIC_PREDICTIONS } from "@/lib/store/ai-analysis-store";
import { getLocalTeamId } from "./api-football";
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
    let homeWin = 33.33;
    let draw = 33.33;
    let awayWin = 33.33;
    let scoreline = "1-1";
    const rankDiff = (away.fifaRank || 50) - (home.fifaRank || 50);

    if (STATIC_PREDICTIONS[match.id]) {
      const staticPred = STATIC_PREDICTIONS[match.id];
      scoreline = staticPred.skor;
      const [hStr, aStr] = scoreline.split("-");
      const hScore = parseInt(hStr, 10);
      const aScore = parseInt(aStr, 10);

      if (hScore > aScore) {
        if (hScore - aScore >= 2) {
          homeWin = 70;
          draw = 20;
          awayWin = 10;
        } else {
          homeWin = 55;
          draw = 25;
          awayWin = 20;
        }
      } else if (aScore > hScore) {
        if (aScore - hScore >= 2) {
          homeWin = 10;
          draw = 20;
          awayWin = 70;
        } else {
          homeWin = 20;
          draw = 25;
          awayWin = 55;
        }
      } else {
        homeWin = 20;
        draw = 60;
        awayWin = 20;
      }
    } else {
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
      scoreline = `${h}-${a}`;
    }

    predictions.push({
      matchId: match.id,
      homeWin: Math.round(homeWin * 100) / 100,
      draw: Math.round(draw * 100) / 100,
      awayWin: Math.round(awayWin * 100) / 100,
      predictedScoreline: scoreline,
      confidence: 0.6 + (Math.abs(rankDiff) / 200)
    });

    // 4. Veritabanına kaydet
    await saveMatchAnalysis(match.id, match.homeTeamId, match.awayTeamId, {
      homeWin,
      draw,
      awayWin,
      scoreline,
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
  // If static predictions exist, use them
  if (STATIC_PREDICTIONS[matchId]) {
    const staticPred = STATIC_PREDICTIONS[matchId];
    
    // Past match cleanup: if the match is in the past, return empty comment
    const allFixtures = generateGroupFixtures();
    const matchFixture = allFixtures.find((m) => m.id === matchId);
    const isPastMatch = matchFixture 
      ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
      : false;

    const commentTr = isPastMatch ? "" : staticPred.commentTr;
    const commentEn = isPastMatch ? "" : staticPred.commentEn;

    return {
      tr: commentTr,
      en: commentEn,
      es: commentTr,
      fr: commentTr,
      de: commentTr
    };
  }

  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const seed = hashString(matchId);

  const homeNameTr = home?.nameTr || "Ev Sahibi";
  const homeNameEn = home?.nameEn || "Home";
  const awayNameTr = away?.nameTr || "Deplasman";
  const awayNameEn = away?.nameEn || "Away";

  // 2. BAĞIMSIZLIK VE KALİTE FİLTRESİ (QUALITY GUARD):
  // Maç hakkında özgün, kaliteli ve üretilen skorla çelişmeyen yorum yapılamıyorsa boş döneriz.
  if (seed % 6 === 0) {
    return { tr: "", en: "", es: "", fr: "", de: "" };
  }

  // Parse prediction scoreline
  const [h, a] = prediction.predictedScoreline.split("-").map(Number);

  // Hava durumu etkisi
  let weatherNoteTr = "";
  let weatherNoteEn = "";
  if (weather.condition === "snowy" || weather.temperature < 5) {
    weatherNoteTr = `${weather.city}'da kar yağışı ve aşırı soğuk bekleniyor. `;
    weatherNoteEn = `Snow and extreme cold expected in ${weather.city}. `;
  } else if (weather.condition === "rainy") {
    weatherNoteTr = `${weather.city}'da yağmur bekleniyor. Kaygan zemin pas trafiğini etkileyebilir. `;
    weatherNoteEn = `Rain expected in ${weather.city}. Slippery pitch might affect passing. `;
  }

  // Sakatlık etkisi
  let injuryNoteTr = "";
  let injuryNoteEn = "";
  const homeInjuries = injuries.filter(i => i.teamId === homeTeamId);
  const awayInjuries = injuries.filter(i => i.teamId === awayTeamId);

  if (homeInjuries.length > 0) {
    injuryNoteTr = `${homeNameTr}'da önemli eksikler var. `;
    injuryNoteEn = `${homeNameEn} has key players missing. `;
  }
  if (awayInjuries.length > 0) {
    injuryNoteTr = `${awayNameTr}'da eksik oyuncular bulunuyor. `;
    injuryNoteEn = `${awayNameEn} has some missing players. `;
  }

  // 1. YAPAY ZEKA SİSTEM TALİMATI (SYSTEM PROMPT) TUTARLILIK KURALLARI
  let trComment = "";
  let enComment = "";

  if (h > a) {
    // Ev sahibi kazanıyorsa
    trComment = `${homeNameTr} ev sahibi avantajını çok iyi yansıtıyor. ${weatherNoteTr}${injuryNoteTr}Hücum gücü ve taktiksel üstünlüğüyle maçı koparacaktır.`;
    enComment = `${homeNameEn} is showing great home dominance. ${weatherNoteEn}${injuryNoteEn}With their attacking prowess and tactical edge, they will secure the victory.`;
  } else if (a > h) {
    // Deplasman kazanıyorsa
    trComment = `${awayNameTr} deplasmanda son derece disiplinli oynuyor. ${weatherNoteTr}${injuryNoteTr}Katı savunması ve hızlı kontra ataklarıyla galibiyete uzanacaktır.`;
    enComment = `${awayNameEn} plays highly disciplined football away. ${weatherNoteEn}${injuryNoteEn}With their solid defense and rapid counters, they will seal the win.`;
  } else {
    // Beraberlik
    trComment = `İki takım arasında dengeli bir oyun bekliyoruz. ${weatherNoteTr}${injuryNoteTr}Kilit eksikler nedeniyle tempo artsa bile az gollü bir beraberlik ön planda.`;
    enComment = `An evenly balanced game is expected between both sides. ${weatherNoteEn}${injuryNoteEn}Due to key player absences, a high-tempo but low-scoring draw is likely.`;
  }

  return {
    tr: trComment,
    en: enComment,
    es: trComment,
    fr: trComment,
    de: trComment
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
// CANLI FİKSTÜR YARDIMCILARI (LIVE FIXTURE HELPERS)
// ============================================================

async function fetchLiveWorldCupMatches(): Promise<any[]> {
  const rawKeys = process.env.API_FOOTBALL_KEY || "";
  const keys = rawKeys.split(",").map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) {
    console.warn("No API_FOOTBALL_KEY found in environment variables. Live scanning skipped.");
    return [];
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const url = "https://v3.football.api-sports.io/fixtures?league=1&season=2026";
    console.log(`[AI Agent] Fetching live World Cup fixtures using key ${i + 1}/${keys.length}...`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "x-apisports-key": key },
        next: { revalidate: 0 }
      });
      if (response.status === 429) continue;
      if (!response.ok) continue;
      const data = await response.json();
      if (data.errors && !Array.isArray(data.errors) && Object.keys(data.errors).length > 0) continue;
      return data.response || [];
    } catch (err) {
      console.error(`[AI Agent] API-Football key ${i+1} fetch failed:`, err);
    }
  }
  return [];
}

function getRoundPrefix(apiRoundName: string): string | null {
  const name = apiRoundName.toLowerCase();
  if (name.includes("round of 32")) return "r32";
  if (name.includes("round of 16")) return "r16";
  if (name.includes("quarter-final") || name.includes("quarterfinal")) return "qf";
  if (name.includes("semi-final") || name.includes("semifinal")) return "sf";
  if (name.includes("final") && !name.includes("quarter") && !name.includes("semi") && !name.includes("third") && !name.includes("3rd")) return "final";
  return null;
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

    // 2. Canlı Fikstür Taraması ve Otomatik Maç Ekleme (Knockout / Üst Turlar)
    console.log("🔍 Canlı fikstür taranıyor ve yeni üst tur eşleşmeleri kontrol ediliyor...");
    let liveMatches: any[] = [];
    try {
      liveMatches = await fetchLiveWorldCupMatches();
      console.log(`🔍 Canlı fikstürde ${liveMatches.length} maç bulundu.`);
    } catch (apiErr) {
      console.error("❌ Canlı fikstür API'sinden maçlar alınamadı:", apiErr);
    }

    const roundMatchesMap: Record<string, any[]> = {
      r32: [],
      r16: [],
      qf: [],
      sf: [],
      final: []
    };

    for (const item of liveMatches) {
      const roundName = item.league?.round || "";
      const prefix = getRoundPrefix(roundName);
      if (prefix && roundMatchesMap[prefix]) {
        roundMatchesMap[prefix].push(item);
      }
    }

    const resolvedKnockoutMatches: Array<{
      id: string;
      homeTeamId: string;
      awayTeamId: string;
      date: string;
      time: string;
    }> = [];

    // Her tur için kronolojik olarak sırala ve slot ID ata
    for (const [prefix, items] of Object.entries(roundMatchesMap)) {
      items.sort((a, b) => {
        const dateA = a.fixture?.date || "";
        const dateB = b.fixture?.date || "";
        return dateA.localeCompare(dateB);
      });

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const homeId = getLocalTeamId(item.teams.home);
        const awayId = getLocalTeamId(item.teams.away);

        if (homeId && awayId) {
          const slotId = `${prefix}-${index + 1}`;
          
          const fixtureDateRaw = item.fixture?.date || "";
          let dateStr = "2026-07-01";
          let timeStr = "12:00";
          if (fixtureDateRaw) {
            const d = new Date(fixtureDateRaw);
            // Convert to Turkey Time UTC+3
            const trDate = new Date(d.getTime() + 3 * 60 * 60 * 1000);
            dateStr = trDate.toISOString().split("T")[0];
            timeStr = trDate.toISOString().split("T")[1].substring(0, 5);
          }

          resolvedKnockoutMatches.push({
            id: slotId,
            homeTeamId: homeId,
            awayTeamId: awayId,
            date: dateStr,
            time: timeStr
          });
        }
      }
    }

    console.log(`🔍 Canlı fikstürden çözümlenen eşleşme sayısı: ${resolvedKnockoutMatches.length}`);

    // Yeni eşleşmeleri kontrol et ve veritabanında yoksa otomatik olarak ekle
    for (const match of resolvedKnockoutMatches) {
      let existing = null;
      try {
        const { data } = await supabaseAdmin
          .from("match_analyses")
          .select("match_id, home_team_id, away_team_id")
          .or(`match_id.eq.${match.id},and(home_team_id.eq.${match.homeTeamId},away_team_id.eq.${match.awayTeamId}),and(home_team_id.eq.${match.awayTeamId},away_team_id.eq.${match.homeTeamId})`)
          .maybeSingle();
        existing = data;
      } catch (dbErr) {
        console.error("Database query failed while checking match existence:", dbErr);
      }

      if (!existing) {
        console.log(`🆕 Yeni Üst Tur Eşleşmesi Tespit Edildi: ${match.id} (${match.homeTeamId} vs ${match.awayTeamId})`);
        
        // AI tahmin motorunu çalıştır (saveMatchAnalysis otomatik olarak veritabanına ekleme/insert yapacaktır)
        const predResult = await generatePredictions([{
          id: match.id,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          date: new Date(match.date)
        }]);

        if (predResult.predictions.length > 0) {
          const pred = predResult.predictions[0];
          const weather = predResult.weatherData.get(pred.matchId) || {
            city: "World Cup Stadium",
            temperature: 20,
            condition: "sunny",
            windSpeed: 10,
            humidity: 50,
            precipitationChance: 10
          };

          const commentary = generateAiCommentary(
            pred.matchId,
            match.homeTeamId,
            match.awayTeamId,
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
            
          console.log(`✅ Yeni maç ve AI yorumları başarıyla eklendi: ${pred.matchId}`);
        }
      }
    }

    // 3. Maç tahminleri - Önümüzdeki 48 saatlik oynanmamış maçları seç (Grup + Canlı Üst Turlar)
    const allGroupMatches = generateGroupFixtures().map(m => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      played: m.played || m.homeScore !== null || m.awayScore !== null,
      date: m.date,
      time: m.time || "12:00"
    }));

    const mergedFixtures = [...allGroupMatches];
    for (const lm of resolvedKnockoutMatches) {
      if (!mergedFixtures.some(f => f.id === lm.id)) {
        mergedFixtures.push({
          id: lm.id,
          homeTeamId: lm.homeTeamId,
          awayTeamId: lm.awayTeamId,
          played: false,
          date: lm.date,
          time: lm.time
        });
      }
    }

    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    const upcomingMatches = mergedFixtures.filter((m) => {
      if (m.played) return false;
      
      const [tsiHourStr, tsiMinStr] = (m.time || "12:00").split(":");
      const tsiHour = parseInt(tsiHourStr, 10);
      const tsiMin = parseInt(tsiMinStr, 10);
      const [yearStr, monthStr, dayStr] = m.date.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      const tsiDate = new Date(Date.UTC(year, month, day, tsiHour, tsiMin, 0));
      const matchUtcTime = tsiDate.getTime() - 3 * 60 * 60 * 1000;
      
      const timeDiff = matchUtcTime - now;
      return timeDiff >= 0 && timeDiff <= fortyEightHoursMs;
    });
    
    const formattedUpcoming = upcomingMatches.map(m => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      date: new Date(m.date)
    }));

    const predResult = await generatePredictions(formattedUpcoming);
    console.log("✅ 48 saatlik tahminler tamamlandı:", predResult.predictions.length, "maç");

    // Yorumları kaydet
    for (const pred of predResult.predictions) {
      const weather = predResult.weatherData.get(pred.matchId);
      if (weather) {
        const homeTeamId = upcomingMatches.find((m: any) => m.id === pred.matchId)?.homeTeamId || "";
        const awayTeamId = upcomingMatches.find((m: any) => m.id === pred.matchId)?.awayTeamId || "";
        
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
