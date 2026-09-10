"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Activity, MapPin, Trophy, Award, BarChart3, ChevronRight, ChevronDown, X, RefreshCw } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { CupMatStandings } from "@/components/cupmat/CupMatStandings";

// Supabase client initialization (Client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ==========================================
// CONSTANTS
// ==========================================
const CONTINENTS = [
  { id: "all", name: "Tümünü Gör" },
  { id: "europe", name: "Avrupa" },
  { id: "asia", name: "Asya" },
  { id: "america", name: "Amerika" },
  { id: "africa", name: "Afrika" },
];

const TOURNAMENTS = {
  "europe": [
    { id: 2, name: "Şampiyonlar Ligi" },
    { id: 3, name: "Avrupa Ligi" },
    { id: 848, name: "Konferans Ligi" },
    { id: 5, name: "Milli Maçlar (Nations League)" },
  ],
  "asia": [
    { id: 17, name: "AFC Şampiyonlar Ligi Elite" },
    { id: 18, name: "AFC Şampiyonlar Ligi 2" },
  ],
  "america": [
    { id: 13, name: "Copa Libertadores" },
    { id: 11, name: "Copa Sudamericana" },
    { id: 16, name: "CONCACAF Champions" },
    { id: 34, name: "Milli Elemeler" },
  ],
  "africa": [
    { id: 12, name: "CAF Şampiyonlar Ligi" },
    { id: 20, name: "CAF Konfederasyon Kupası" },
    { id: 32, name: "Milli Elemeler (AFCON)" },
  ]
};

const TEAM_COUNTRIES: Record<string, string> = {
  // Türkiye
  'Fenerbahçe': 'TÜR', 'Beşiktaş': 'TÜR', 'Galatasaray': 'TÜR', 'Trabzonspor': 'TÜR', 'Başakşehir': 'TÜR',
  // İskoçya
  'Celtic': 'İSK', 'Rangers': 'İSK', 'Hearts': 'İSK', 'Heart Of Midlothian': 'İSK', 'Kilmarnock': 'İSK', 'St. Mirren': 'İSK',
  // Avusturya
  'Lask Linz': 'AVU', 'LASK': 'AVU', 'Red Bull Salzburg': 'AVU', 'Salzburg': 'AVU', 'Sturm Graz': 'AVU', 'Rapid Wien': 'AVU', 'Rapid Vienna': 'AVU', 'Austria Wien': 'AVU', 'Austria Vienna': 'AVU',
  // Hollanda
  'NEC Nijmegen': 'HOL', 'Ajax': 'HOL', 'PSV': 'HOL', 'Feyenoord': 'HOL', 'Twente': 'HOL', 'AZ Alkmaar': 'HOL', 'Go Ahead Eagles': 'HOL',
  // Norveç
  'Bodo/Glimt': 'NOR', 'Bodø/Glimt': 'NOR', 'Viking': 'NOR', 'Brann': 'NOR', 'Molde': 'NOR', 'Tromsö': 'NOR', 'Tromso': 'NOR', 'Lillestrom': 'NOR',
  // İsrail
  'Hapoel Beer Sheva': 'İSR', 'HB Sheva': 'İSR', 'Maccabi Tel Aviv': 'İSR', 'M. Tel Aviv': 'İSR', 'Maccabi Haifa': 'İSR', 'Beitar': 'İSR', 'Hapoel Jerusalem': 'İSR',
  // Azerbaycan
  'Sabah FA': 'AZE', 'Sabah': 'AZE', 'Karabağ': 'AZE', 'Qarabag': 'AZE', 'Neftçi PFK': 'AZE', 'Neftchi': 'AZE', 'Zira': 'AZE', 'Sumqayit': 'AZE',
  // Slovakya
  'Slovan Bratislava': 'SVK', 'S. Bratislava': 'SVK', 'Spartak Trnava': 'SVK', 'S. Trnava': 'SVK', 'DAC Dunajska Streda': 'SVK', 'Dunajska S.': 'SVK', 'MSK Zilina': 'SVK', 'Ruzomberok': 'SVK',
  // Slovenya
  'Celje': 'SVN', 'NK Celje': 'SVN', 'Maribor': 'SVN', 'Olimpija': 'SVN', 'Bravo': 'SVN', 'Aluminij': 'SVN',
  // Fransa
  'Lyon': 'FRA', 'PSG': 'FRA', 'Lille': 'FRA', 'Monaco': 'FRA', 'Marseille': 'FRA', 'Nice': 'FRA', 'Lens': 'FRA', 'Rennes': 'FRA', 'Brest': 'FRA',
  // Yunanistan
  'AEK Athens FC': 'YUN', 'AEK Athens': 'YUN', 'Olympiakos': 'YUN', 'PAOK': 'YUN', 'Panathinaikos': 'YUN', 'Aris': 'YUN', 'OFI': 'YUN',
  // Bulgaristan
  'Levski Sofia': 'BUL', 'Levski Sofya': 'BUL', 'Ludogorets': 'BUL', 'CSKA Sofia': 'BUL', 'CSKA Sofya': 'BUL', 'CSKA 1948': 'BUL', 'Botev Plovdiv': 'BUL', 'Cherno More': 'BUL',
  // Hırvatistan
  'Dinamo Zagreb': 'HIR', 'D. Zagreb': 'HIR', 'Hajduk Split': 'HIR', 'Rijeka': 'HIR', 'Osijek': 'HIR',
  // Çekya
  'Sparta Prag': 'ÇEK', 'Slavia Prag': 'ÇEK', 'Viktoria Plzen': 'ÇEK', 'Plzen': 'ÇEK', 'Mlada Boleslav': 'ÇEK', 'H. Kralove': 'ÇEK', 'Banik Ostrava': 'ÇEK',
  // Polonya
  'Jagiellonia': 'POL', 'J. Bialystok': 'POL', 'Lech Poznan': 'POL', 'Legia Varşova': 'POL', 'Legia': 'POL', 'Slask Wroclaw': 'POL', 'Gornik Zabrze': 'POL', 'Wisla Krakow': 'POL',
  // İsviçre
  'Young Boys': 'İSV', 'Servette': 'İSV', 'Lugano': 'İSV', 'FC Lugano': 'İSV', 'St. Gallen': 'İSV', 'Thun': 'İSV', 'FC Thun': 'İSV', 'Zurich': 'İSV',
  // Belçika
  'Club Brugge': 'BEL', 'Union SG': 'BEL', 'Anderlecht': 'BEL', 'Gent': 'BEL', 'Cercle Brugge': 'BEL', 'Antwerp': 'BEL', 'Genk': 'BEL', 'St. Truiden': 'BEL',
  // Portekiz
  'Sporting CP': 'POR', 'Benfica': 'POR', 'Porto': 'POR', 'Braga': 'POR', 'Vitoria Guimaraes': 'POR', 'Santa Clara': 'POR',
  // İspanya
  'Real Madrid': 'İSP', 'Barcelona': 'İSP', 'Atlético Madrid': 'İSP', 'Real Sociedad': 'İSP', 'Athletic Bilbao': 'İSP', 'Girona': 'İSP', 'Real Betis': 'İSP', 'Sevilla': 'İSP', 'Villarreal': 'İSP',
  // İngiltere
  'Man City': 'İNG', 'Arsenal': 'İNG', 'Liverpool': 'İNG', 'Aston Villa': 'İNG', 'Tottenham': 'İNG', 'Chelsea': 'İNG', 'Man United': 'İNG', 'Newcastle': 'İNG', 'West Ham': 'İNG',
  // Almanya
  'Bayer Leverkusen': 'ALM', 'Bayern Munich': 'ALM', 'Stuttgart': 'ALM', 'RB Leipzig': 'ALM', 'Borussia Dortmund': 'ALM', 'Eintracht Frankfurt': 'ALM', 'Hoffenheim': 'ALM', 'Heidenheim': 'ALM',
  // İtalya
  'Inter': 'İTA', 'Inter Milan': 'İTA', 'AC Milan': 'İTA', 'Juventus': 'İTA', 'Atalanta': 'İTA', 'Bologna': 'İTA', 'Roma': 'İTA', 'Lazio': 'İTA', 'Napoli': 'İTA', 'Fiorentina': 'İTA', 'Como': 'İTA',
  // Danimarka
  'FC Midtjylland': 'DAN', 'Midtjylland': 'DAN', 'Brondby': 'DAN', 'FC Copenhagen': 'DAN', 'Kopenhag': 'DAN', 'FC Nordsjaelland': 'DAN', 'Silkeborg': 'DAN', 'Aarhus': 'DAN',
  // İsveç
  'Malmö FF': 'İSVE', 'Malmo': 'İSVE', 'Elfsborg': 'İSVE', 'BK Häcken': 'İSVE', 'Hacken': 'İSVE', 'Djurgarden': 'İSVE', 'Hammarby': 'İSVE', 'Mjallby': 'İSVE', 'Mjallby AIF': 'İSVE', 'Göteborg': 'İSVE',
  // Sırbistan
  'Kızılyıldız': 'SIR', 'FK Crvena Zvezda': 'SIR', 'Partizan': 'SIR', 'FK Vojvodina': 'SIR', 'TSC Backa Topola': 'SIR', 'Radnicki 1923': 'SIR',
  // Romanya
  'FCSB': 'ROM', 'CFR Cluj': 'ROM', 'Univ. Craiova': 'ROM', 'Universitatea Craiova': 'ROM', 'U. Cluj': 'ROM', 'Corvinul Hunedoara': 'ROM',
  // Macaristan
  'Ferencvaros': 'MAC', 'Ferencvarosi TC': 'MAC', 'Paks': 'MAC', 'Fehervar': 'MAC', 'Puskas Akademia': 'MAC', 'Gyor': 'MAC',
  // Ukrayna
  'Shakhtar Donetsk': 'UKR', 'Dinamo Kiev': 'UKR', 'Kryvbas': 'UKR', 'Dnipro-1': 'UKR', 'Polissya': 'UKR', 'Polessya': 'UKR',
  // Kıbrıs Rum Kesimi
  'APOEL': 'KIB', 'AEK Larnaca': 'KIB', 'Omonia': 'KIB', 'Omonia Nicosia': 'KIB', 'Pafos': 'KIB', 'Apollon L.': 'KIB', 'Aris Limassol': 'KIB',
  // Gürcistan
  'Dinamo Batumi': 'GÜR', 'Dinamo Tiflis': 'GÜR', 'FC Iberia 1999': 'GÜR', 'Iberia': 'GÜR', 'Torpedo Kutaisi': 'GÜR', 'Dila Gori': 'GÜR',
  // Kazakistan
  'Ordabasy': 'KAZ', 'Astana': 'KAZ', 'Aktobe': 'KAZ', 'Tobol': 'KAZ', 'Kairat Almaty': 'KAZ', 'K. Almaty': 'KAZ',
  // Arnavutluk
  'Egnatia': 'ARN', 'Egnatia Rrogozhinë': 'ARN', 'Partizani': 'ARN', 'Vllaznia': 'ARN', 'KF Vllaznia': 'ARN', 'Skenderbeu': 'ARN', 'Dinamo Tirana': 'ARN', 'AF Elbasani': 'ARN',
  // Bosna Hersek
  'Borac Banja Luka': 'BOS', 'Banja Luka': 'BOS', 'Zrinjski': 'BOS', 'Velez Mostar': 'BOS', 'Sarajevo': 'BOS',
  // Kosova
  'Ballkani': 'KOS', 'Llapi': 'KOS', 'Drita': 'KOS', 'Malisheva': 'KOS', 'Dukagjini': 'KOS',
  // Ermenistan
  'Pyunik': 'ERM', 'Noah': 'ERM', 'Ararat-Armenia': 'ERM', 'Urartu': 'ERM', 'Alashkert': 'ERM',
  // İrlanda / Kuzey İrlanda
  'Shamrock Rovers': 'İRL', 'Shamrock R.': 'İRL', 'Derry City': 'İRL', 'Shelbourne': 'İRL', 'St Patrick\'s': 'İRL', 'Larne': 'K.İR', 'Linfield': 'K.İR', 'Cliftonville': 'K.İR', 'Crusaders': 'K.İR', 'Coleraine': 'K.İR',
  // Galler
  'The New Saints': 'GAL', 'Connah\'s': 'GAL', 'Bala Town': 'GAL', 'Caernarfon': 'GAL',
  // Finlandiya
  'HJK Helsinki': 'FİN', 'KuPS': 'FİN', 'Kuopion': 'FİN', 'Ilves': 'FİN', 'VPS': 'FİN', 'SJK': 'FİN',
  // İzlanda
  'Vikingur Reykjavik': 'İZL', 'Vikingur R.': 'İZL', 'Valur': 'İZL', 'Stjarnan': 'İZL', 'Breidablik': 'İZL', 'KR Reykjavik': 'İZL', 'IF Vestri': 'İZL',
  // Lüksemburg / Malta / Andorra / San Marino / Faroe / Cebelitarık / Moldova / Estonya / Letonya / Litvanya
  'Differdange': 'LÜK', 'F91 Dudelange': 'LÜK', 'Progres Niederkorn': 'LÜK', 'Strassen': 'LÜK', 'Atert': 'LÜK',
  'Hamrun Spartans': 'MLT', 'Floriana': 'MLT', 'Sliema Wanderers': 'MLT', 'Marsaxlokk': 'MLT',
  'UE Santa Coloma': 'AND', 'Inter Club d\'Escaldes': 'AND', 'Inter Escaldes': 'AND', 'AC Escaldes': 'AND',
  'Virtus': 'SMR', 'La Fiorita': 'SMR', 'Tre Penne': 'SMR', 'Tre Fiori': 'SMR',
  'KI Klaksvik': 'FAR', 'Klaksvik': 'FAR', 'HB Torshavn': 'FAR', 'B36 Torshavn': 'FAR', 'Vikingur Gota': 'FAR',
  'Lincoln Red Imps': 'CEB', 'Lincoln Red': 'CEB', 'St Joseph\'s': 'CEB', 'Bruno\'s Magpies': 'CEB', 'Europa FC': 'CEB',
  'Sheriff Tiraspol': 'MOL', 'Sheriff': 'MOL', 'Petrocub': 'MOL', 'Milsami': 'MOL', 'Zimbru': 'MOL',
  'Flora Tallinn': 'EST', 'Flora T.': 'EST', 'Levadia': 'EST', 'Paide Linnameeskond': 'EST', 'Paide Flora': 'EST', 'Nomme Kalju': 'EST',
  'RFS': 'LET', 'Riga FC': 'LET', 'Riga': 'LET', 'FK Auda': 'LET', 'Liepaja': 'LET', 'FK Liepaja': 'LET', 'FK Jelgava': 'LET',
  'FK Panevezys': 'LİT', 'Zalgiris': 'LİT', 'Kauno Zalgiris': 'LİT', 'Kauno Žalgiris': 'LİT', 'Hegelmann': 'LİT', 'FA Siauliai': 'LİT',
  'Dinamo Minsk': 'BLR', 'BATE Borisov': 'BLR', 'Torpedo-BelAZ': 'BLR', 'Neman Grodno': 'BLR', 'ML Rogachev': 'BLR',
  'FK Decic': 'KRD', 'Buducnost': 'KRD', 'Mornar': 'KRD', 'Sutjeska': 'KRD',
  'Struga': 'K.MK', 'Shkendija': 'K.MK', 'Tikves': 'K.MK', 'Vardar': 'K.MK',
  // Güney Amerika
  'Boca Juniors': 'ARG', 'River Plate': 'ARG', 'Estudiantes': 'ARG', 'Estudiantes L.P.': 'ARG', 'Rosario C.': 'ARG', 'Rosario Central': 'ARG', 'Argentinos Jr.': 'ARG', 'Atl Lanus': 'ARG', 'Platense': 'ARG', 'Ind. Mendoza': 'ARG', 'Tigre': 'ARG',
  'Flamengo': 'BRA', 'Palmeiras': 'BRA', 'Corinthians': 'BRA', 'Fluminense': 'BRA', 'Botafogo': 'BRA', 'Botafogo RJ': 'BRA', 'Cruzeiro': 'BRA', 'Cruzeiro MG': 'BRA', 'Atletico-MG': 'BRA', 'Bahia BA': 'BRA', 'Mirassol SP': 'BRA', 'Santos': 'BRA', 'Vasco DA Gama': 'BRA', 'Vitoria': 'BRA', 'RB Bragantino': 'BRA', 'Internacional': 'BRA', 'Gremio': 'BRA',
  'Bolivar': 'BOL', 'Bolívar': 'BOL', 'The Strongest': 'BOL', 'Always Ready': 'BOL', 'Nacional Potosi': 'BOL',
  'Colo Colo': 'ŞİL', 'Coquimbo U.': 'ŞİL', 'Coquimbo Unido': 'ŞİL', 'Huachipato': 'ŞİL', 'O\'Higgins': 'ŞİL', 'Palestino': 'ŞİL',
  'Medellin': 'KOL', 'Santa Fe': 'KOL', 'Dep. Tolima': 'KOL', 'Deportes Tolima': 'KOL', 'Atl. Junior': 'KOL',
  'LDU Quito': 'EKV', 'Ind. del Valle': 'EKV', 'Independiente del Valle': 'EKV', 'Barcelona SC': 'EKV', 'U. Catolica': 'EKV', 'Uni. Catolica': 'EKV',
  'Cerro Porteno': 'PAR', 'Libertad': 'PAR', 'Club Guarani': 'PAR', 'CS 2 de Mayo': 'PAR', 'Olimpia': 'PAR',
  'Alianza Lima': 'PER', 'U. Deportes': 'PER', 'S. Cristal': 'PER', 'Cusco': 'PER', 'Cienciano': 'PER',
  'Nacional': 'URU', 'CA Penarol': 'URU', 'Liverpool M.': 'URU', 'CA Juventud': 'URU', 'Atletico Torque': 'URU',
  'Dep. Tachira': 'VEN', 'Carabobo': 'VEN', 'Dep. La Guaira': 'VEN', 'UCV': 'VEN'
};

type MatchType = {
  id: string;
  api_id: number;
  tournament_id: string;
  season: number;
  round: string;
  date: string;
  dateStr: string;
  time: string;
  status: string;
  isSecondLeg?: boolean;
  isTieFinished?: boolean;
  team1: { 
    name: string; 
    countryCode: string; 
    score: number | null; 
    isWinner: boolean; 
    firstLegScore?: number;
    isTieWinner?: boolean;
  };
  team2: { 
    name: string; 
    countryCode: string; 
    score: number | null; 
    isWinner: boolean; 
    firstLegScore?: number;
    isTieWinner?: boolean;
  };
  aggregateScore?: { team1: number; team2: number };
  tournament_api_id: number;
  tournament_name: string;
  region: string;
};

export default function CupMatMatchCenter() {
  const { t, locale } = useTranslation();
  const currentLocale = locale || "tr";
  const { user, isSignedIn } = useUser();
  
  // Only hamemaht@gmail.com is authorized to see the manual sync button
  const isAdmin = Boolean(
    isSignedIn && (
      user?.primaryEmailAddress?.emailAddress?.toLowerCase() === "hamemaht@gmail.com" ||
      user?.emailAddresses?.some(e => e.emailAddress?.toLowerCase() === "hamemaht@gmail.com")
    )
  );
  
  // States
  const [mainView, setMainView] = useState<"matches" | "stats" | "standings" | "sm_standings">("matches");
  const [activeContinent, setActiveContinent] = useState<string>("europe");
  const [activeTournament, setActiveTournament] = useState<number>(2);
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>({});
  const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);
  
  // Real Data States
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Uluslar Ligi (Nations League) Custom Hierarchy States
  const [unlOpenLeagues, setUnlOpenLeagues] = useState<Record<string, boolean>>({ "Lig A": true });
  const [unlOpenGroups, setUnlOpenGroups] = useState<Record<string, boolean>>({ "Lig A - 1. Grup": true });

  // 2-Seviyeli Seçim State'leri (Şampiyonlar, Avrupa, Konferans Ligi için)
  const [euroStage, setEuroStage] = useState<"league" | "knockout" | "all">("league");
  const [selectedWeek, setSelectedWeek] = useState<string>("1. Hafta");
  const [selectedKnockoutRound, setSelectedKnockoutRound] = useState<string>("all");

  const toggleUnlLeague = (leagueKey: string) => {
    setUnlOpenLeagues(prev => ({ ...prev, [leagueKey]: !prev[leagueKey] }));
  };

  const toggleUnlGroup = (groupKey: string) => {
    setUnlOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Fetch real matches from Supabase
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // Join matches with tournaments to get region and api_id
      const { data, error } = await supabase
        .from('cupmat_matches')
        .select(`
          *,
          cupmat_tournaments!inner(api_id, region, name)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching matches:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const rawMatches: MatchType[] = data.map((item: any) => {
          const matchDate = new Date(item.date);
          const dateStr = matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const timeStr = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

          let cleanRound = item.round || 'Normal Sezon';
          cleanRound = cleanRound.replace(/[^0-9\. ]*n Eleme/g, "Ön Eleme").replace(/\s+/g, " ");

          const homeCountry = (item.home_team_country_code && item.home_team_country_code !== "TBD" && item.home_team_country_code !== "UNK")
            ? item.home_team_country_code 
            : (TEAM_COUNTRIES[item.home_team_name] || "");
          const awayCountry = (item.away_team_country_code && item.away_team_country_code !== "TBD" && item.away_team_country_code !== "UNK")
            ? item.away_team_country_code 
            : (TEAM_COUNTRIES[item.away_team_name] || "");

          return {
            id: item.id,
            api_id: item.api_id,
            tournament_id: item.tournament_id,
            tournament_api_id: item.cupmat_tournaments.api_id,
            tournament_name: item.cupmat_tournaments.name,
            region: item.cupmat_tournaments.region || 'world',
            season: item.season,
            round: cleanRound,
            date: item.date,
            dateStr: dateStr,
            time: timeStr,
            status: item.status,
            team1: { 
              name: item.home_team_name, 
              countryCode: homeCountry, 
              score: item.home_score, 
              isWinner: item.home_is_winner,
              firstLegScore: item.first_leg_home_score
            },
            team2: { 
              name: item.away_team_name, 
              countryCode: awayCountry, 
              score: item.away_score, 
              isWinner: item.away_is_winner,
              firstLegScore: item.first_leg_away_score
            },
            aggregateScore: item.aggregate_home_score !== null && item.aggregate_away_score !== null ? {
              team1: item.aggregate_home_score,
              team2: item.aggregate_away_score
            } : undefined
          };
        });

        // Pair 1st and 2nd leg matches to calculate aggregate scores and determine who qualified
        const formattedMatches: MatchType[] = rawMatches.map((m2) => {
          // Find if there is an earlier 1st leg match with reversed home/away
          const m1 = rawMatches.find((m) => 
            m.tournament_id === m2.tournament_id &&
            m.round === m2.round &&
            m.team1.name === m2.team2.name &&
            m.team2.name === m2.team1.name &&
            new Date(m.date).getTime() < new Date(m2.date).getTime()
          );

          // Find if there is a later 2nd leg match with reversed home/away
          const futureLeg = rawMatches.find((m) =>
            m.tournament_id === m2.tournament_id &&
            m.round === m2.round &&
            m.team1.name === m2.team2.name &&
            m.team2.name === m2.team1.name &&
            new Date(m.date).getTime() > new Date(m2.date).getTime()
          );

          const isTwoLeggedTie = !!m1 || !!futureLeg;
          const isSecondLeg = !!m1;
          const firstLegTeam1Score = m1 ? m1.team2.score : m2.team1.firstLegScore;
          const firstLegTeam2Score = m1 ? m1.team1.score : m2.team2.firstLegScore;

          let aggScore = m2.aggregateScore;
          if (m1 && m1.team1.score !== null && m1.team2.score !== null && m2.team1.score !== null && m2.team2.score !== null) {
            aggScore = {
              team1: Number(m2.team1.score) + Number(m1.team2.score),
              team2: Number(m2.team2.score) + Number(m1.team1.score)
            };
          }

          const isMatchFinished = ["FT", "AET", "PEN"].includes(m2.status);
          let isTieFinished = false;
          let team1TieWinner = false;
          let team2TieWinner = false;

          // Only determine tie qualification on the 2nd leg when finished, OR on single-match knockout finals
          if (isSecondLeg && isMatchFinished && aggScore) {
            isTieFinished = true;
            if (aggScore.team1 > aggScore.team2) {
              team1TieWinner = true;
            } else if (aggScore.team2 > aggScore.team1) {
              team2TieWinner = true;
            } else {
              // Tie in aggregate score: check match penalty/winner flags
              if (m2.team1.isWinner) team1TieWinner = true;
              else if (m2.team2.isWinner) team2TieWinner = true;
              else if (m2.team1.score !== null && m2.team2.score !== null) {
                if (m2.team1.score > m2.team2.score) team1TieWinner = true;
                else if (m2.team2.score > m2.team1.score) team2TieWinner = true;
              }
            }
          } else if (!isTwoLeggedTie && isMatchFinished && (m2.round.toLowerCase().includes("final") || m2.round.toLowerCase().includes("super cup"))) {
            // Single-match knockout final
            if (m2.team1.isWinner) {
              isTieFinished = true;
              team1TieWinner = true;
            } else if (m2.team2.isWinner) {
              isTieFinished = true;
              team2TieWinner = true;
            }
          }

          return {
            ...m2,
            isSecondLeg,
            isTieFinished,
            team1: {
              ...m2.team1,
              firstLegScore: firstLegTeam1Score ?? undefined,
              isTieWinner: team1TieWinner
            },
            team2: {
              ...m2.team2,
              firstLegScore: firstLegTeam2Score ?? undefined,
              isTieWinner: team2TieWinner
            },
            aggregateScore: aggScore
          };
        });
        
        setMatches(formattedMatches);
        
        // Auto-expand all rounds by default so user sees every round & first leg matches immediately
        const allRoundsMap: Record<string, boolean> = {};
        formattedMatches.forEach(m => {
          allRoundsMap[m.round] = true;
          allRoundsMap[`${m.tournament_name} - ${m.round}`] = true;
        });
        setExpandedRounds(allRoundsMap);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/cron/cupmat-fetch", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✓ Başarılı: ${data.updated || 0} maç güncellendi, ${data.inserted || 0} yeni eklendi.`);
      } else {
        setSyncMessage("✓ Güncelleme tamamlandı.");
      }
      await fetchMatches();
    } catch (e) {
      console.error("Sync error:", e);
      setSyncMessage("Bağlantı hatası oluştu.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Kıta değişince alt turnuvaları güncelle
  useEffect(() => {
    if (activeContinent !== "all") {
      const tournaments = TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS];
      if (tournaments && tournaments.length > 0) {
        setActiveTournament(tournaments[0].id);
      }
    }
  }, [activeContinent]);

  const toggleRound = (round: string) => {
    setExpandedRounds(prev => ({ ...prev, [round]: !prev[round] }));
  };

  // Filtrelenmiş maçlar
  const filteredMatches = matches.filter(m => {
    if (activeContinent === "all") return true;
    return m.tournament_api_id === activeTournament;
  });

  const getMatchRoundKey = (match: MatchType) => {
    let r = (match.round || "Normal Sezon").trim();

    // League Stage - 1 / Regular Season - 1 / Group Stage - 1 -> 1. Hafta
    const leagueStageMatch = r.match(/(?:League\s+Stage|Regular\s+Season|Group\s+Stage)\s*-\s*(\d+)/i);
    if (leagueStageMatch) {
      r = `${leagueStageMatch[1]}. Hafta`;
    } else {
      const matchdayMatch = r.match(/Matchday\s*(\d+)/i) || r.match(/(\d+)\.\s*Matchday/i);
      if (matchdayMatch) {
        r = `${matchdayMatch[1]}. Hafta`;
      } else {
        const ligAsamasiMatch = r.match(/Lig\s+Aşaması\s*-\s*(\d+)\.\s*Hafta/i);
        if (ligAsamasiMatch) {
          r = `${ligAsamasiMatch[1]}. Hafta`;
        }
      }
    }

    // YALNIZCA Uluslar Ligi (tournament_api_id === 5) için: "Lig A - 1. Grup - 1. Hafta" -> "1. Hafta - Lig A"
    if (match.tournament_api_id === 5) {
      const unlMatch = r.match(/Lig\s+([A-D])\s*-\s*(\d+)\.\s*Grup\s*-\s*(\d+)\.\s*Hafta/i);
      if (unlMatch) {
        const leagueLetter = unlMatch[1].toUpperCase();
        const weekNum = unlMatch[3];
        return `${weekNum}. Hafta - Lig ${leagueLetter}`;
      }
    }

    return r;
  };

  // Maçları Turlara göre grupla
  const groupedByRound = filteredMatches.reduce((acc, match) => {
    const rawRound = getMatchRoundKey(match);
    const roundKey = activeContinent === "all" ? `${match.tournament_name} - ${rawRound}` : rawRound;
    if (!acc[roundKey]) acc[roundKey] = [];
    acc[roundKey].push(match);
    return acc;
  }, {} as Record<string, MatchType[]>);

  // Accordion'ların Sıralanması (Şampiyonlar Ligi > Avrupa Ligi > Konferans Ligi > Uluslar Ligi)
  const getTournamentWeight = (roundName: string) => {
    if (roundName.includes("Şampiyonlar Ligi")) return 1;
    if (roundName.includes("Avrupa Ligi")) return 2;
    if (roundName.includes("Konferans Ligi")) return 3;
    if (roundName.includes("Milli") || roundName.includes("Nations")) return 4;
    return 5;
  };

  // Turları mantıksal ve kronolojik sıraya dizen ağırlık fonksiyonu
  const getRoundSortOrder = (roundKey: string) => {
    // 1. Uluslar Ligi: "1. Hafta - Lig A", "1. Hafta - Lig B" ... "6. Hafta - Lig D"
    const unlMatch = roundKey.match(/(\d+)\.\s*Hafta\s*-\s*Lig\s+([A-D])/i);
    if (unlMatch) {
      const weekNum = parseInt(unlMatch[1], 10);
      const letter = unlMatch[2].toUpperCase();
      const letterWeight: Record<string, number> = { A: 0.1, B: 0.2, C: 0.3, D: 0.4 };
      return weekNum + (letterWeight[letter] || 0.5);
    }

    // 2. Kulüp Kupaları Lig Aşaması: "1. Hafta", "2. Hafta" ... "8. Hafta"
    const weekMatch = roundKey.match(/(\d+)\.\s*Hafta/i) || roundKey.match(/Matchday\s*(\d+)/i);
    if (weekMatch) {
      return parseInt(weekMatch[1], 10);
    }

    // 3. Eleme ve Eleme Sonrası Turlar
    if (/final/i.test(roundKey) && !/yarı|çeyrek|ön/i.test(roundKey)) return 50;
    if (/yarı\s*final|semi/i.test(roundKey)) return 51;
    if (/çeyrek\s*final|quarter/i.test(roundKey)) return 52;
    if (/son\s*16|round\s*of\s*16/i.test(roundKey)) return 53;

    // 4. Ön Elemeler ve Play-off'lar (Lig aşamasından sonra gösterilir)
    if (/play-?off/i.test(roundKey)) return 100;
    if (/3\.\s*(?:ön\s*)?eleme|3rd\s*qualifying/i.test(roundKey)) return 101;
    if (/2\.\s*(?:ön\s*)?eleme|2nd\s*qualifying/i.test(roundKey)) return 102;
    if (/1\.\s*(?:ön\s*)?eleme|1st\s*qualifying/i.test(roundKey)) return 103;
    if (/ön\s*eleme|preliminary/i.test(roundKey)) return 104;

    return 200;
  };

  const sortedRoundKeys = Object.keys(groupedByRound).sort((a, b) => {
    // "Tümünü Gör" seçiliyse önce turnuvaya göre diz
    if (activeContinent === "all") {
      const weightA = getTournamentWeight(a);
      const weightB = getTournamentWeight(b);
      if (weightA !== weightB) {
        return weightA - weightB;
      }
    }

    const orderA = getRoundSortOrder(a);
    const orderB = getRoundSortOrder(b);

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.localeCompare(b);
  });

  // Şampiyonlar, Avrupa ve Konferans Ligi için Lig Aşaması haftaları ve Eleme turları
  const isEuroClubTournament = [2, 3, 848].includes(activeTournament) && activeContinent !== "all";

  const availableWeeks = useMemo(() => {
    const weekSet = new Set<string>();
    filteredMatches.forEach(m => {
      const rawRound = getMatchRoundKey(m);
      const match = rawRound.match(/(\d+)\.\s*Hafta/i);
      if (match) {
        weekSet.add(`${match[1]}. Hafta`);
      }
    });
    return Array.from(weekSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });
  }, [filteredMatches]);

  const availableKnockoutRounds = useMemo(() => {
    const roundSet = new Set<string>();
    filteredMatches.forEach(m => {
      const rawRound = getMatchRoundKey(m);
      if (!/hafta|matchday/i.test(rawRound)) {
        roundSet.add(rawRound);
      }
    });
    return Array.from(roundSet).sort((a, b) => getRoundSortOrder(a) - getRoundSortOrder(b));
  }, [filteredMatches]);

  // Turnuva değiştiğinde haftayı otomatik geçerli haftaya çek
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.includes(selectedWeek) && selectedWeek !== "all") {
      setSelectedWeek(availableWeeks[0]);
    }
  }, [activeTournament, availableWeeks]);

  // Çok Dilli Tur İsimlendirme Fonksiyonu
  const getLocalizedRoundName = (roundKey: string, lang: string = "tr") => {
    let prefix = "";
    let roundName = roundKey;
    if (roundKey.includes(" - ")) {
      const parts = roundKey.split(" - ");
      if (parts[0].includes("League") || parts[0].includes("Ligi") || parts[0].includes("Cup") || parts[0].includes("UEFA") || parts[0].includes("Milli")) {
        prefix = parts[0] + " - ";
        roundName = parts.slice(1).join(" - ");
      }
    }

    // Uluslar Ligi Formatı: "1. Hafta - Lig A"
    const unlMatch = roundName.match(/(\d+)\.\s*Hafta\s*-\s*Lig\s+([A-D])/i);
    if (unlMatch) {
      const weekNum = unlMatch[1];
      const leagueLetter = unlMatch[2].toUpperCase();
      switch (lang) {
        case "en": return `${prefix}Matchday ${weekNum} - League ${leagueLetter}`;
        case "de": return `${prefix}Spieltag ${weekNum} - Liga ${leagueLetter}`;
        case "fr": return `${prefix}Journée ${weekNum} - Ligue ${leagueLetter}`;
        case "es": return `${prefix}Jornada ${weekNum} - Liga ${leagueLetter}`;
        case "pt": return `${prefix}Rodada ${weekNum} - Liga ${leagueLetter}`;
        case "it": return `${prefix}Giornata ${weekNum} - Lega ${leagueLetter}`;
        case "ko": return `${prefix}${weekNum}주차 - 리그 ${leagueLetter}`;
        case "ar": return `${prefix}الجولة ${weekNum} - الدوري ${leagueLetter}`;
        default: return `${prefix}${weekNum}. Hafta - Lig ${leagueLetter}`;
      }
    }

    const weekMatch = roundName.match(/(\d+)\.\s*Hafta/i) || roundName.match(/Matchday\s*(\d+)/i);
    if (weekMatch) {
      const w = weekMatch[1];
      switch (lang) {
        case "en": return `${prefix}League Stage - Matchday ${w}`;
        case "de": return `${prefix}Ligaphase - Spieltag ${w}`;
        case "fr": return `${prefix}Phase de Ligue - Journée ${w}`;
        case "es": return `${prefix}Fase de Liga - Jornada ${w}`;
        case "pt": return `${prefix}Fase de Liga - Rodada ${w}`;
        case "it": return `${prefix}Fase Campionato - Giornata ${w}`;
        case "ko": return `${prefix}리그 페이즈 - ${w}주차`;
        case "ar": return `${prefix}مرحلة الدوري - الجولة ${w}`;
        default: return `${prefix}Lig Aşaması - ${w}. Hafta`;
      }
    }

    if (/play-?off/i.test(roundName)) {
      return `${prefix}Play-offs`;
    }

    if (/3\.\s*(?:ön\s*)?eleme|3rd\s*qualifying/i.test(roundName)) {
      switch (lang) {
        case "en": return `${prefix}3rd Qualifying Round`;
        case "de": return `${prefix}3. Qualifikationsrunde`;
        case "fr": return `${prefix}3e tour de qualification`;
        default: return `${prefix}3. Ön Eleme`;
      }
    }

    if (/2\.\s*(?:ön\s*)?eleme|2nd\s*qualifying/i.test(roundName)) {
      switch (lang) {
        case "en": return `${prefix}2nd Qualifying Round`;
        case "de": return `${prefix}2. Qualifikationsrunde`;
        case "fr": return `${prefix}2e tour de qualification`;
        default: return `${prefix}2. Ön Eleme`;
      }
    }

    if (/1\.\s*(?:ön\s*)?eleme|1st\s*qualifying/i.test(roundName)) {
      switch (lang) {
        case "en": return `${prefix}1st Qualifying Round`;
        case "de": return `${prefix}1. Qualifikationsrunde`;
        case "fr": return `${prefix}1er tour de qualification`;
        default: return `${prefix}1. Ön Eleme`;
      }
    }

    if (/2\.\s*(?:ön\s*)?eleme|2\.\s*eleme|2nd\s*qualifying/i.test(roundName)) {
      let localizedRound = "2. Ön Eleme";
      switch (lang) {
        case "en": localizedRound = "2nd Qualifying Round"; break;
        case "de": localizedRound = "2. Qualifikationsrunde"; break;
        case "fr": localizedRound = "2e tour de qualification"; break;
        case "es": localizedRound = "2ª Ronda de Clasificación"; break;
        case "pt": localizedRound = "2ª Rodada de Qualificação"; break;
        case "it": localizedRound = "2° Turno di Qualificazione"; break;
        case "ko": localizedRound = "2차 예선"; break;
        case "ar": localizedRound = "الدور التأهيلي الثاني"; break;
        default: localizedRound = "2. Ön Eleme"; break;
      }
      return prefix ? `${prefix}${localizedRound}` : localizedRound;
    }

    if (/1\.\s*(?:ön\s*)?eleme|1\.\s*eleme|1st\s*qualifying/i.test(roundName)) {
      let localizedRound = "1. Ön Eleme";
      switch (lang) {
        case "en": localizedRound = "1st Qualifying Round"; break;
        case "de": localizedRound = "1. Qualifikationsrunde"; break;
        case "fr": localizedRound = "1er tour de qualification"; break;
        case "es": localizedRound = "1ª Ronda de Clasificación"; break;
        case "pt": localizedRound = "1ª Rodada de Qualificação"; break;
        case "it": localizedRound = "1° Turno di Qualificazione"; break;
        case "ko": localizedRound = "1차 예선"; break;
        case "ar": localizedRound = "الدور التأهيلي الأول"; break;
        default: localizedRound = "1. Ön Eleme"; break;
      }
      return prefix ? `${prefix}${localizedRound}` : localizedRound;
    }

    return roundKey;
  };

  // Modal kapandığında scroll'u aç
  useEffect(() => {
    if (selectedMatch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedMatch]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20 relative">
      {/* Header Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-blue-900/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 pt-28 sm:pt-32 pb-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3 justify-center sm:justify-start">
              <img src="/logo_s_clean.png" alt="CupMat Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              {t("CupMat")}
            </h1>
            <p className="text-slate-400 text-lg">{t("Uluslararası Kupa Maçları")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isAdmin && syncMessage && (
              <span className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-fade-in font-medium">
                {syncMessage}
              </span>
            )}
            {isAdmin && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
                title="Sadece Admin (hamemaht@gmail.com)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? t("Güncelleniyor...") : t("Sonuçları Güncelle")}
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("Canlı Veri Akışı")}
            </div>
          </div>
        </div>

        {/* 4 Ana Sayfa (View Switcher) */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700/50 w-full sm:w-fit mb-8 overflow-x-auto hide-scrollbar">
          {[
            { id: "matches", label: "Maçlar", icon: Calendar },
            { id: "stats", label: "İstatistikler", icon: BarChart3 },
            { id: "standings", label: "Puan Tablosu", icon: Trophy },
            { id: "sm_standings", label: "StatMatik Tablo", icon: Award }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setMainView(view.id as any)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                mainView === view.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <view.icon className="w-4 h-4" />
              {t(view.label)}
            </button>
          ))}
        </div>

        {/* Dinamik İçerik */}
        {mainView === "matches" && (
          <div className="space-y-6">
            
            {/* 1. SEVİYE: Kıta Sekmeleri */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
              {CONTINENTS.map(continent => (
                <button
                  key={continent.id}
                  onClick={() => setActiveContinent(continent.id)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                    activeContinent === continent.id
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {t(continent.name)}
                </button>
              ))}
            </div>

            {/* 2. SEVİYE: Turnuva Sekmeleri */}
            {activeContinent !== "all" && TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS] && (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4 border-b border-slate-800/60">
                {TOURNAMENTS[activeContinent as keyof typeof TOURNAMENTS].map(tourney => (
                  <button
                    key={tourney.id}
                    onClick={() => setActiveTournament(tourney.id)}
                    className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
                      activeTournament === tourney.id
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t(tourney.name)}
                  </button>
                ))}
              </div>
            )}

            {/* 3. SEVİYE: Turlar (Accordion) ve Maçlar */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
                <div className="text-5xl mb-4">⚽</div>
                <h3 className="text-xl font-bold text-white mb-2">{t("Henüz Maç Takvimi Bulunmuyor")}</h3>
                <p className="text-slate-400">{t("Seçili turnuva için fikstür verileri güncelleniyor.")}</p>
              </div>
            ) : activeTournament === 5 ? (
              /* ========================================================================= */
              /* ÖZEL ULUSLAR LİGİ GÖRÜNÜMÜ: Lig A/B/C/D -> Gruplar -> Tüm Grup Maçları    */
              /* ========================================================================= */
              <div className="space-y-4">
                {["Lig A", "Lig B", "Lig C", "Lig D"].map(leagueKey => {
                  const isLeagueOpen = unlOpenLeagues[leagueKey];
                  const leagueLetter = leagueKey.replace("Lig ", "").trim();
                  
                  // Lig D'de 2 grup var, diğerlerinde 4 grup var
                  const groupsInLeague = (leagueLetter === "D") 
                    ? ["1. Grup", "2. Grup"] 
                    : ["1. Grup", "2. Grup", "3. Grup", "4. Grup"];

                  return (
                    <div key={leagueKey} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
                      {/* 1. SEVİYE: Lig Başlığı (Lig A, Lig B, Lig C, Lig D) */}
                      <button
                        onClick={() => toggleUnlLeague(leagueKey)}
                        className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-sm flex items-center justify-center">
                            {leagueLetter}
                          </span>
                          <h3 className="text-lg font-bold text-white">{leagueKey}</h3>
                        </div>
                        {isLeagueOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                      </button>

                      {/* 2. SEVİYE: Gruplar */}
                      {isLeagueOpen && (
                        <div className="p-3 sm:p-5 space-y-3 bg-slate-950/30">
                          {groupsInLeague.map(groupName => {
                            const groupFullKey = `${leagueKey} - ${groupName}`;
                            const isGroupOpen = unlOpenGroups[groupFullKey];

                            // Bu lig ve gruba ait maçları filtrele
                            const groupMatches = filteredMatches.filter(m => {
                              const r = m.round || "";
                              return r.includes(leagueKey) && r.includes(groupName);
                            });

                            // Maçları hafta (1..6) ve tarihe göre sırala
                            const sortedGroupMatches = [...groupMatches].sort((a, b) => {
                              const getWeek = (r: string) => {
                                const match = r.match(/(\d+)\.\s*Hafta/i);
                                return match ? parseInt(match[1], 10) : 99;
                              };
                              const wA = getWeek(a.round);
                              const wB = getWeek(b.round);
                              if (wA !== wB) return wA - wB;
                              return new Date(a.date).getTime() - new Date(b.date).getTime();
                            });

                            return (
                              <div key={groupFullKey} className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
                                {/* Grup Başlığı */}
                                <button
                                  onClick={() => toggleUnlGroup(groupFullKey)}
                                  className="w-full flex items-center justify-between p-3.5 sm:px-5 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">
                                      {leagueKey}
                                    </span>
                                    <h4 className="text-base font-bold text-slate-100">{groupName}</h4>
                                    <span className="text-xs text-slate-400">({sortedGroupMatches.length} maç)</span>
                                  </div>
                                  {isGroupOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                </button>

                                {/* 3. SEVİYE: Tüm Grup Maçları Listesi (Direkt, açılan buton olmadan) */}
                                {isGroupOpen && (
                                  <div className="p-3 sm:p-4 space-y-2 border-t border-slate-800/60">
                                    {sortedGroupMatches.length === 0 ? (
                                      <p className="text-xs text-slate-400 py-3 text-center">{t("Bu grupta henüz maç bulunmuyor.")}</p>
                                    ) : (
                                      sortedGroupMatches.map(match => {
                                        // Hafta bilgisini ayıkla (Örn: 1. Hafta)
                                        const weekMatch = match.round.match(/(\d+)\.\s*Hafta/i);
                                        const weekNum = weekMatch ? `${weekMatch[1]}. Hafta` : "";

                                        return (
                                          <div
                                            key={match.id}
                                            onClick={() => setSelectedMatch(match)}
                                            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-slate-800/40 hover:border-indigo-500/30"
                                          >
                                            {/* EV SAHİBİ TAKIM */}
                                            <div className="flex items-center justify-end gap-2 text-right">
                                              <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                                {match.team1.countryCode}
                                              </span>
                                              <span className="text-sm sm:text-base font-bold text-slate-100">
                                                {match.team1.name}
                                              </span>
                                            </div>

                                            {/* ORTA: HAFTA ROZETİ, TARİH, SKOR / SAAT */}
                                            <div className="flex flex-col items-center justify-center min-w-[90px] sm:min-w-[120px] gap-1">
                                              {/* Hafta Rozeti & Tarih */}
                                              <div className="flex items-center gap-1.5">
                                                {weekNum && (
                                                  <span className="text-[10px] font-black text-indigo-300 bg-indigo-950/90 border border-indigo-500/30 px-2 py-0.5 rounded">
                                                    {weekNum}
                                                  </span>
                                                )}
                                                <span className="text-[10px] font-medium text-slate-400">
                                                  {match.dateStr}
                                                </span>
                                              </div>

                                              {/* Skor veya Saat */}
                                              {["FT", "AET", "PEN"].includes(match.status) ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-md border border-slate-700">
                                                  <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">{match.team1.score}</span>
                                                  <span className="text-slate-500">-</span>
                                                  <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums">{match.team2.score}</span>
                                                </div>
                                              ) : (
                                                <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                                                  {match.time}
                                                </div>
                                              )}
                                            </div>

                                            {/* DEPLASMAN TAKIM */}
                                            <div className="flex items-center justify-start gap-2 text-left">
                                              <span className="text-sm sm:text-base font-bold text-slate-100">
                                                {match.team2.name}
                                              </span>
                                              <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                                {match.team2.countryCode}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : isEuroClubTournament ? (
              /* ========================================================================= */
              /* 🌟 2-SEVİYELİ SEÇİM: ŞAMPİYONLAR, AVRUPA & KONFERANS LİGİ                */
              /* ========================================================================= */
              <div className="space-y-6">
                
                {/* 1. SEVİYE: AŞAMA SEÇİMİ (Lig Aşaması, Eleme & Play-off, Tüm Turlar) */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 w-full sm:w-fit">
                  <button
                    onClick={() => setEuroStage("league")}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      euroStage === "league"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    🏆 {t("Lig Aşaması")}
                  </button>
                  {availableKnockoutRounds.length > 0 && (
                    <button
                      onClick={() => setEuroStage("knockout")}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        euroStage === "knockout"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      ⚔️ {t("Eleme & Play-off")}
                    </button>
                  )}
                  <button
                    onClick={() => setEuroStage("all")}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      euroStage === "all"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    📋 {t("Tüm Turlar")}
                  </button>
                </div>

                {/* 2. SEVİYE: LİG AŞAMASI HAFTA SEÇİM BUTONLARI (1. Hafta, 2. Hafta, ... 8. Hafta) */}
                {euroStage === "league" && (
                  <div className="space-y-6">
                    {availableWeeks.length > 0 && (
                      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                        {availableWeeks.map(week => (
                          <button
                            key={week}
                            onClick={() => setSelectedWeek(week)}
                            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                              selectedWeek === week
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105"
                                : "bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {week}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedWeek("all")}
                          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                            selectedWeek === "all"
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105"
                              : "bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {t("Tüm Haftalar")}
                        </button>
                      </div>
                    )}

                    {/* SEÇİLİ HAFTANIN MAÇLARI */}
                    {selectedWeek !== "all" ? (
                      (() => {
                        const targetMatches = filteredMatches.filter(m => getMatchRoundKey(m) === selectedWeek);
                        
                        const matchesByDate = targetMatches.reduce((acc, match) => {
                          if (!acc[match.dateStr]) acc[match.dateStr] = [];
                          acc[match.dateStr].push(match);
                          return acc;
                        }, {} as Record<string, MatchType[]>);

                        const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                          const [d1, m1, y1] = a.split('.');
                          const [d2, m2, y2] = b.split('.');
                          return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                        });

                        return (
                          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-6 animate-in fade-in-50 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-sm">
                                  {selectedWeek.replace(/\D/g, "") || "1"}
                                </span>
                                <h3 className="text-xl font-black text-white">{selectedWeek}</h3>
                              </div>
                              <span className="text-xs text-slate-400 font-medium bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
                                {targetMatches.length} {t("Maç")}
                              </span>
                            </div>

                            {targetMatches.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-8">{t("Bu hafta için henüz maç planı bulunmuyor.")}</p>
                            ) : (
                              sortedDates.map(dateStr => (
                                <div key={dateStr} className="space-y-3">
                                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                    <h4 className="text-sm font-semibold text-slate-400">{dateStr}</h4>
                                  </div>
                                  <div className="space-y-2">
                                    {matchesByDate[dateStr].map(match => (
                                      <div
                                        key={match.id}
                                        onClick={() => setSelectedMatch(match)}
                                        className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                      >
                                        {/* EV SAHİBİ TAKIM */}
                                        <div className="flex items-center justify-end gap-2 text-right">
                                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                            {match.team1.countryCode}
                                          </span>
                                          <span className="text-sm sm:text-base font-bold text-slate-100">
                                            {match.team1.name}
                                          </span>
                                        </div>

                                        {/* SKOR / SAAT */}
                                        <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                          {["FT", "AET", "PEN"].includes(match.status) ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                              <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team1.score}</span>
                                              <span className="text-slate-500">-</span>
                                              <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team2.score}</span>
                                            </div>
                                          ) : (
                                            <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                                              {match.time}
                                            </div>
                                          )}
                                        </div>

                                        {/* DEPLASMAN TAKIM */}
                                        <div className="flex items-center justify-start gap-2 text-left">
                                          <span className="text-sm sm:text-base font-bold text-slate-100">
                                            {match.team2.name}
                                          </span>
                                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                            {match.team2.countryCode}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      /* TÜM HAFTALAR ACCORDION GÖRÜNÜMÜ */
                      <div className="space-y-4">
                        {availableWeeks.map(week => {
                          const isOpen = expandedRounds[week] !== false;
                          const weekMatches = filteredMatches.filter(m => getMatchRoundKey(m) === week);
                          
                          const matchesByDate = weekMatches.reduce((acc, match) => {
                            if (!acc[match.dateStr]) acc[match.dateStr] = [];
                            acc[match.dateStr].push(match);
                            return acc;
                          }, {} as Record<string, MatchType[]>);

                          const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                            const [d1, m1, y1] = a.split('.');
                            const [d2, m2, y2] = b.split('.');
                            return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                          });

                          return (
                            <div key={week} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                              <button 
                                onClick={() => toggleRound(week)}
                                className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                              >
                                <h3 className="text-lg font-bold text-white">{week}</h3>
                                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                              </button>

                              {isOpen && (
                                <div className="p-4 sm:p-6 space-y-6">
                                  {sortedDates.map(dateStr => (
                                    <div key={dateStr} className="space-y-3">
                                      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                        <h4 className="text-sm font-semibold text-slate-400">{dateStr}</h4>
                                      </div>
                                      <div className="space-y-2">
                                        {matchesByDate[dateStr].map(match => (
                                          <div
                                            key={match.id}
                                            onClick={() => setSelectedMatch(match)}
                                            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                          >
                                            <div className="flex items-center justify-end gap-2 text-right">
                                              <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                                {match.team1.countryCode}
                                              </span>
                                              <span className="text-sm sm:text-base font-bold text-slate-100">{match.team1.name}</span>
                                            </div>

                                            <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                              {["FT", "AET", "PEN"].includes(match.status) ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                                  <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team1.score}</span>
                                                  <span className="text-slate-500">-</span>
                                                  <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team2.score}</span>
                                                </div>
                                              ) : (
                                                <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">{match.time}</div>
                                              )}
                                            </div>

                                            <div className="flex items-center justify-start gap-2 text-left">
                                              <span className="text-sm sm:text-base font-bold text-slate-100">{match.team2.name}</span>
                                              <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                                {match.team2.countryCode}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SEVİYE: ELEME & PLAY-OFF SEÇİMİ */}
                {euroStage === "knockout" && (
                  <div className="space-y-6">
                    {availableKnockoutRounds.length > 0 && (
                      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
                        <button
                          onClick={() => setSelectedKnockoutRound("all")}
                          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                            selectedKnockoutRound === "all"
                              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105"
                              : "bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {t("Tüm Elemeler")}
                        </button>
                        {availableKnockoutRounds.map(rName => (
                          <button
                            key={rName}
                            onClick={() => setSelectedKnockoutRound(rName)}
                            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border cursor-pointer ${
                              selectedKnockoutRound === rName
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105"
                                : "bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {getLocalizedRoundName(rName, currentLocale)}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ELEME MAÇLARI LİSTESİ */}
                    <div className="space-y-4">
                      {(selectedKnockoutRound === "all" ? availableKnockoutRounds : [selectedKnockoutRound]).map(rName => {
                        const rMatches = filteredMatches.filter(m => getMatchRoundKey(m) === rName);
                        if (rMatches.length === 0) return null;

                        const matchesByDate = rMatches.reduce((acc, match) => {
                          if (!acc[match.dateStr]) acc[match.dateStr] = [];
                          acc[match.dateStr].push(match);
                          return acc;
                        }, {} as Record<string, MatchType[]>);

                        const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                          const [d1, m1, y1] = a.split('.');
                          const [d2, m2, y2] = b.split('.');
                          return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                        });

                        const firstDateStr = sortedDates[0];
                        const [fd, fm, fy] = (firstDateStr || "01.01.2026").split('.');
                        const firstDateTime = new Date(`${fy}-${fm}-${fd}`).getTime();

                        return (
                          <div key={rName} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <h3 className="text-lg sm:text-xl font-bold text-white">{getLocalizedRoundName(rName, currentLocale)}</h3>
                              <span className="text-xs text-slate-400 font-medium bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
                                {rMatches.length} {t("Maç")}
                              </span>
                            </div>

                            {sortedDates.map(dateStr => {
                              const [d, m, y] = dateStr.split('.');
                              const currentDateTime = new Date(`${y}-${m}-${d}`).getTime();
                              const diffDays = (currentDateTime - firstDateTime) / (1000 * 60 * 60 * 24);
                              const isSecondLeg = diffDays > 3;

                              return (
                                <div key={dateStr} className="space-y-3">
                                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                    <h4 className="text-sm font-semibold text-slate-400">{dateStr}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                      {isSecondLeg ? t("Rövanş Maçları") : t("İlk Maçlar")}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {matchesByDate[dateStr].map(match => {
                                      const tieDecided = match.isTieFinished;
                                      const isTeam1Advancing = tieDecided && match.team1.isTieWinner;
                                      const isTeam2Advancing = tieDecided && match.team2.isTieWinner;
                                      const isTeam1Eliminated = tieDecided && !match.team1.isTieWinner;
                                      const isTeam2Eliminated = tieDecided && !match.team2.isTieWinner;

                                      return (
                                        <div
                                          key={match.id}
                                          onClick={() => setSelectedMatch(match)}
                                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                        >
                                          {/* EV SAHİBİ */}
                                          <div className={`flex items-center justify-end gap-2 text-right transition-all ${
                                            isTeam1Advancing ? 'text-white' : isTeam1Eliminated ? 'text-slate-500 opacity-40' : 'text-slate-100'
                                          }`}>
                                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                              {match.team1.countryCode}
                                            </span>
                                            <span className={`text-sm sm:text-base ${
                                              isTeam1Advancing ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : isTeam1Eliminated ? 'font-normal text-slate-500' : 'font-bold text-slate-100'
                                            }`}>
                                              {match.team1.name}
                                            </span>
                                            {isTeam1Advancing && (
                                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                                ✓
                                              </span>
                                            )}
                                          </div>

                                          {/* SKOR / SAAT */}
                                          <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                            {["FT", "AET", "PEN"].includes(match.status) ? (
                                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                                <span className={`text-sm sm:text-lg tabular-nums ${isTeam1Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team1.score}</span>
                                                <span className="text-slate-500">-</span>
                                                <span className={`text-sm sm:text-lg tabular-nums ${isTeam2Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team2.score}</span>
                                              </div>
                                            ) : (
                                              <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">{match.time}</div>
                                            )}
                                            {match.aggregateScore && ["FT", "AET", "PEN"].includes(match.status) && (
                                              <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-1.5 py-0.2 rounded mt-1 shadow-sm">
                                                Top: {match.aggregateScore.team1} - {match.aggregateScore.team2}
                                              </span>
                                            )}
                                          </div>

                                          {/* DEPLASMAN */}
                                          <div className={`flex items-center justify-start gap-2 text-left transition-all ${
                                            isTeam2Advancing ? 'text-white' : isTeam2Eliminated ? 'text-slate-500 opacity-40' : 'text-slate-100'
                                          }`}>
                                            {isTeam2Advancing && (
                                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                                ✓
                                              </span>
                                            )}
                                            <span className={`text-sm sm:text-base ${
                                              isTeam2Advancing ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : isTeam2Eliminated ? 'font-normal text-slate-500' : 'font-bold text-slate-100'
                                            }`}>
                                              {match.team2.name}
                                            </span>
                                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                              {match.team2.countryCode}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TÜM TURLAR (ACCORDION GÖRÜNÜMÜ) */}
                {euroStage === "all" && (
                  <div className="space-y-4">
                    {sortedRoundKeys.map(round => {
                      const isOpen = expandedRounds[round] !== false;
                      const matches = groupedByRound[round];
                      
                      const matchesByDate = matches.reduce((acc, match) => {
                        if (!acc[match.dateStr]) acc[match.dateStr] = [];
                        acc[match.dateStr].push(match);
                        return acc;
                      }, {} as Record<string, MatchType[]>);

                      const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                        const [d1, m1, y1] = a.split('.');
                        const [d2, m2, y2] = b.split('.');
                        return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                      });
                      
                      const firstDateStr = sortedDates[0];
                      const [fd, fm, fy] = (firstDateStr || "01.01.2026").split('.');
                      const firstDateTime = new Date(`${fy}-${fm}-${fd}`).getTime();

                      return (
                        <div key={round} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                          <button 
                            onClick={() => toggleRound(round)}
                            className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                          >
                            <h3 className="text-lg font-bold text-white">{getLocalizedRoundName(round, currentLocale)}</h3>
                            {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          </button>

                          {isOpen && (
                            <div className="p-4 sm:p-6 space-y-6">
                              {sortedDates.map(dateStr => {
                                const [d, m, y] = dateStr.split('.');
                                const currentDateTime = new Date(`${y}-${m}-${d}`).getTime();
                                const diffDays = (currentDateTime - firstDateTime) / (1000 * 60 * 60 * 24);
                                const isSecondLeg = diffDays > 3;
                                const isLeagueStage = /lig\s*aşaması|league\s*stage|hafta/i.test(round);
                                
                                return (
                                  <div key={dateStr} className="space-y-3">
                                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                      <h4 className="text-sm font-semibold text-slate-400">{dateStr}</h4>
                                      {!isLeagueStage && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                          {isSecondLeg ? t("Rövanş Maçları") : t("İlk Maçlar")}
                                        </span>
                                      )}
                                    </div>
                                  
                                    <div className="space-y-2">
                                      {matchesByDate[dateStr].map(match => (
                                        <div 
                                          key={match.id}
                                          onClick={() => setSelectedMatch(match)}
                                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                        >
                                          <div className="flex items-center justify-end gap-2 text-right">
                                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                              {match.team1.countryCode}
                                            </span>
                                            <span className="text-sm sm:text-base font-bold text-slate-100">{match.team1.name}</span>
                                          </div>

                                          <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                            {["FT", "AET", "PEN"].includes(match.status) ? (
                                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                                <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team1.score}</span>
                                                <span className="text-slate-500">-</span>
                                                <span className="text-sm sm:text-lg tabular-nums font-black text-emerald-400">{match.team2.score}</span>
                                              </div>
                                            ) : (
                                              <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">{match.time}</div>
                                            )}
                                          </div>

                                          <div className="flex items-center justify-start gap-2 text-left">
                                            <span className="text-sm sm:text-base font-bold text-slate-100">{match.team2.name}</span>
                                            <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                              {match.team2.countryCode}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            ) : (
              /* ========================================================================= */
              /* DİĞER TÜM TURNUVALAR (Copa Libertadores, Sudamericana vb.)                 */
              /* ========================================================================= */
              <div className="space-y-4">
                {sortedRoundKeys.map(round => {
                  const isOpen = expandedRounds[round];
                  const matches = groupedByRound[round];
                  
                  // Maçları tarihe göre grupla (Ör: 13.08.2026)
                  const matchesByDate = matches.reduce((acc, match) => {
                    if (!acc[match.dateStr]) acc[match.dateStr] = [];
                    acc[match.dateStr].push(match);
                    return acc;
                  }, {} as Record<string, MatchType[]>);

                  // Tüm tarihleri sıralayarak İlk Maç / Rövanş mantığı kurma
                  const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
                    const [d1, m1, y1] = a.split('.');
                    const [d2, m2, y2] = b.split('.');
                    return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
                  });
                  
                  const firstDateStr = sortedDates[0];
                  const [fd, fm, fy] = (firstDateStr || "01.01.2026").split('.');
                  const firstDateTime = new Date(`${fy}-${fm}-${fd}`).getTime();

                  return (
                  <div key={round} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                    {/* Accordion Başlığı */}
                    <button 
                      onClick={() => toggleRound(round)}
                      className="w-full flex items-center justify-between p-4 sm:px-6 bg-slate-800/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <h3 className="text-lg font-bold text-white">{getLocalizedRoundName(round, currentLocale)}</h3>
                      {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    </button>

                    {/* Accordion İçeriği (Tarihler ve Maçlar) */}
                    {isOpen && (
                      <div className="p-4 sm:p-6 space-y-6">
                        {sortedDates.map(dateStr => {
                          const [d, m, y] = dateStr.split('.');
                          const currentDateTime = new Date(`${y}-${m}-${d}`).getTime();
                          const diffDays = (currentDateTime - firstDateTime) / (1000 * 60 * 60 * 24);
                          const isSecondLeg = diffDays > 3;
                          const isLeagueStage = /lig\s*aşaması|league\s*stage|hafta/i.test(round);
                          
                          return (
                            <div key={dateStr} className="space-y-3">
                              {/* Tarih Başlığı */}
                              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                <h4 className="text-sm font-semibold text-slate-400">
                                  {dateStr}
                                </h4>
                                {!isLeagueStage && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    {isSecondLeg ? t("Rövanş Maçları") : t("İlk Maçlar")}
                                  </span>
                                )}
                              </div>
                            
                            {/* O Tarihteki Maçlar */}
                            <div className="space-y-2">
                              {matchesByDate[dateStr].map(match => {
                                const tieDecided = match.isTieFinished;
                                const isTeam1Advancing = tieDecided && match.team1.isTieWinner;
                                const isTeam2Advancing = tieDecided && match.team2.isTieWinner;
                                const isTeam1Eliminated = tieDecided && !match.team1.isTieWinner;
                                const isTeam2Eliminated = tieDecided && !match.team2.isTieWinner;

                                return (
                                <div 
                                  key={match.id}
                                  onClick={() => setSelectedMatch(match)}
                                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-indigo-500/30"
                                >
                                  {/* EV SAHİBİ TAKIM */}
                                  <div className={`flex items-center justify-end gap-2 text-right transition-all ${
                                    isTeam1Advancing
                                      ? 'text-white'
                                      : isTeam1Eliminated
                                      ? 'text-slate-500 opacity-40'
                                      : 'text-slate-100'
                                  }`}>
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                      {match.team1.countryCode}
                                    </span>
                                    <span className={`text-sm sm:text-base ${
                                      isTeam1Advancing
                                        ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                        : isTeam1Eliminated
                                        ? 'font-normal text-slate-500'
                                        : 'font-bold text-slate-100'
                                    }`}>
                                      {match.team1.name}
                                    </span>
                                    {isTeam1Advancing && (
                                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                        ✓
                                      </span>
                                    )}
                                  </div>

                                  {/* SKOR / SAAT */}
                                  <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
                                    {["FT", "AET", "PEN"].includes(match.status) ? (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700">
                                        <span className={`text-sm sm:text-lg tabular-nums ${isTeam1Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team1.score}</span>
                                        <span className="text-slate-500">-</span>
                                        <span className={`text-sm sm:text-lg tabular-nums ${isTeam2Advancing ? 'font-black text-emerald-400' : 'font-bold text-slate-100'}`}>{match.team2.score}</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                                        {match.time}
                                      </div>
                                    )}
                                    {/* Toplam Skor (Aggregate) */}
                                    {match.aggregateScore && ["FT", "AET", "PEN"].includes(match.status) && (
                                      <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-1.5 py-0.2 rounded mt-1 shadow-sm">
                                        Top: {match.aggregateScore.team1} - {match.aggregateScore.team2}
                                      </span>
                                    )}
                                  </div>

                                  {/* DEPLASMAN TAKIM */}
                                  <div className={`flex items-center justify-start gap-2 text-left transition-all ${
                                    isTeam2Advancing
                                      ? 'text-white'
                                      : isTeam2Eliminated
                                      ? 'text-slate-500 opacity-40'
                                      : 'text-slate-100'
                                  }`}>
                                    {isTeam2Advancing && (
                                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40 shadow-sm" title="Turu Geçti">
                                        ✓
                                      </span>
                                    )}
                                    <span className={`text-sm sm:text-base ${
                                      isTeam2Advancing
                                        ? 'font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                        : isTeam2Eliminated
                                        ? 'font-normal text-slate-500'
                                        : 'font-bold text-slate-100'
                                    }`}>
                                      {match.team2.name}
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:inline-block">
                                      {match.team2.countryCode}
                                    </span>
                                  </div>

                                </div>
                              )})}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {mainView === "stats" && <div className="text-center py-20 text-slate-400">{t("İstatistikler çok yakında eklenecek.")}</div>}
        {mainView === "standings" && <CupMatStandings />}
        {mainView === "sm_standings" && <div className="text-center py-20 text-slate-400">{t("StatMatik Endeks tablosu çok yakında eklenecek.")}</div>}

      </div>

      {/* ========================================== */}
      {/* 📱 MAÇ DETAY KARTI (ZOOM MODAL) */}
      {/* ========================================== */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all" onClick={() => setSelectedMatch(null)}>
          <div 
            className="bg-[#0b1121] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()} // Dışarı tıklamayı engelleme
          >
            {/* Kapatma Tuşu */}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedMatch(null); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 text-center relative overflow-hidden">
              {/* Arka Plan Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 mb-8 uppercase tracking-widest">
                  {getLocalizedRoundName(selectedMatch.round, currentLocale)} • {selectedMatch.dateStr}
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Ev Sahibi Zoom */}
                  <div className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                    selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner
                      ? 'text-white'
                      : selectedMatch.isTieFinished && !selectedMatch.team1.isTieWinner
                      ? 'text-slate-500 opacity-40'
                      : 'text-slate-100'
                  }`}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedMatch.team1.countryCode}</span>
                    <span className={`text-2xl sm:text-3xl ${
                      selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner
                        ? 'font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : selectedMatch.isTieFinished && !selectedMatch.team1.isTieWinner
                        ? 'font-normal text-slate-500'
                        : 'font-bold text-slate-100'
                    }`}>
                      {selectedMatch.team1.name}
                    </span>
                    {selectedMatch.isTieFinished && selectedMatch.team1.isTieWinner && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 mt-1 shadow-md">
                        ✓ Turu Geçti
                      </span>
                    )}
                  </div>

                  {/* Dev Skor */}
                  <div className="shrink-0 flex flex-col items-center">
                    {["FT", "AET", "PEN"].includes(selectedMatch.status) ? (
                      <div className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                        {selectedMatch.team1.score} <span className="text-slate-600 font-light mx-1">-</span> {selectedMatch.team2.score}
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                        {selectedMatch.time}
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-[0.2em]">{selectedMatch.status}</span>
                  </div>

                  {/* Deplasman Zoom */}
                  <div className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                    selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner
                      ? 'text-white'
                      : selectedMatch.isTieFinished && !selectedMatch.team2.isTieWinner
                      ? 'text-slate-500 opacity-40'
                      : 'text-slate-100'
                  }`}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedMatch.team2.countryCode}</span>
                    <span className={`text-2xl sm:text-3xl ${
                      selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner
                        ? 'font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : selectedMatch.isTieFinished && !selectedMatch.team2.isTieWinner
                        ? 'font-normal text-slate-500'
                        : 'font-bold text-slate-100'
                    }`}>
                      {selectedMatch.team2.name}
                    </span>
                    {selectedMatch.isTieFinished && selectedMatch.team2.isTieWinner && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40 mt-1 shadow-md">
                        ✓ Turu Geçti
                      </span>
                    )}
                  </div>
                </div>

                {/* Toplam Skor Detayı (Eğer Varsa) */}
                {(selectedMatch.aggregateScore || selectedMatch.team1.firstLegScore != null) && (
                  <div className="mt-10 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-2 text-sm">
                    {selectedMatch.team1.firstLegScore != null && (
                      <div className="flex justify-between text-slate-400">
                        <span>İlk Maç:</span>
                        <span className="font-bold">{selectedMatch.team1.firstLegScore} - {selectedMatch.team2.firstLegScore}</span>
                      </div>
                    )}
                    {selectedMatch.aggregateScore && (
                      <div className="flex justify-between text-indigo-300 font-bold border-t border-slate-700/50 pt-2 mt-1">
                        <span>Toplam Skor:</span>
                        <span>{selectedMatch.aggregateScore.team1} - {selectedMatch.aggregateScore.team2}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
