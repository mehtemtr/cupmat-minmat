import { NextResponse } from "next/server";

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_URL = "https://v3.football.api-sports.io";

export const revalidate = 600; // Cache for 10 minutes

// Fallback real 36-team initial rosters with country codes
const FALLBACK_STANDINGS: Record<number, any[]> = {
  // UEFA Champions League (36 teams)
  2: [
    { rank: 1, team: "Real Madrid", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 2, team: "Manchester City", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 3, team: "Bayern Munich", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 4, team: "Arsenal", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 5, team: "Bayer Leverkusen", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 6, team: "Barcelona", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 7, team: "Inter Milan", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 8, team: "Liverpool", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 9, team: "PSG", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 10, team: "Borussia Dortmund", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 11, team: "Atletico Madrid", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 12, team: "Juventus", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 13, team: "Atalanta", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 14, team: "AC Milan", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 15, team: "Sporting CP", country: "POR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 16, team: "Benfica", country: "POR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 17, team: "RB Leipzig", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 18, team: "Aston Villa", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 19, team: "Monaco", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 20, team: "Lille", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 21, team: "PSV Eindhoven", country: "HOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 22, team: "Feyenoord", country: "HOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 23, team: "Club Brugge", country: "BEL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 24, team: "Stuttgart", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 25, team: "Bologna", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 26, team: "Girona", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 27, team: "Celtic", country: "İSK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 28, team: "Red Bull Salzburg", country: "AVU", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 29, team: "Dinamo Zagreb", country: "HIR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 30, team: "Shakhtar Donetsk", country: "UKR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 31, team: "Sparta Prag", country: "ÇEK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 32, team: "Crvena Zvezda", country: "SIR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 33, team: "Young Boys", country: "İSV", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 34, team: "Brest", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 35, team: "Sturm Graz", country: "AVU", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 36, team: "Slovan Bratislava", country: "SVK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" }
  ],
  // UEFA Europa League (36 teams)
  3: [
    { rank: 1, team: "Galatasaray", country: "TÜR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 2, team: "Fenerbahçe", country: "TÜR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 3, team: "Beşiktaş", country: "TÜR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 4, team: "Tottenham", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 5, team: "Manchester United", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 6, team: "AS Roma", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 7, team: "Lazio", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 8, team: "Porto", country: "POR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 9, team: "Athletic Bilbao", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 10, team: "Real Sociedad", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 11, team: "Eintracht Frankfurt", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 12, team: "Hoffenheim", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 13, team: "Lyon", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 14, team: "Nice", country: "FRA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 15, team: "Ajax", country: "HOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 16, team: "AZ Alkmaar", country: "HOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 17, team: "Twente", country: "HOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 18, team: "Braga", country: "POR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 19, team: "Rangers", country: "İSK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 20, team: "Olympiakos", country: "YUN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 21, team: "PAOK", country: "YUN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 22, team: "Slavia Prag", country: "ÇEK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 23, team: "Viktoria Plzen", country: "ÇEK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 24, team: "Anderlecht", country: "BEL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 25, team: "Union Saint-Gilloise", country: "BEL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 26, team: "Bodø/Glimt", country: "NOR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 27, team: "Midtjylland", country: "DAN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 28, team: "Malmö FF", country: "İSVE", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 29, team: "Elfsborg", country: "İSVE", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 30, team: "Karabağ", country: "AZE", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 31, team: "Ferencváros", country: "MAC", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 32, team: "Dinamo Kiev", country: "UKR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 33, team: "Ludogorets", country: "BUL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 34, team: "FCSB", country: "ROM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 35, team: "Maccabi Tel Aviv", country: "İSR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 36, team: "RFS", country: "LET", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" }
  ],
  // UEFA Conference League (36 teams)
  848: [
    { rank: 1, team: "Chelsea", country: "İNG", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 2, team: "Real Betis", country: "İSP", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 3, team: "Fiorentina", country: "İTA", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 4, team: "Başakşehir", country: "TÜR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 5, team: "Heidenheim", country: "ALM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 6, team: "Gent", country: "BEL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 7, team: "Cercle Brugge", country: "BEL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 8, team: "Kopenhag", country: "DAN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 9, team: "Rapid Wien", country: "AVU", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 10, team: "LASK", country: "AVU", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 11, team: "Legia Varşova", country: "POL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 12, team: "Jagiellonia", country: "POL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 13, team: "Panathinaikos", country: "YUN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 14, team: "Vitoria Guimaraes", country: "POR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 15, team: "Molde", country: "NOR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 16, team: "Djurgarden", country: "İSVE", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 17, team: "FC Lugano", country: "İSV", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 18, team: "St. Gallen", country: "İSV", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 19, team: "APOEL", country: "KIB", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 20, team: "Omonia", country: "KIB", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 21, team: "Pafos", country: "KIB", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 22, team: "Astana", country: "KAZ", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 23, team: "HJK Helsinki", country: "FİN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 24, team: "Mlada Boleslav", country: "ÇEK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 25, team: "Heart of Midlothian", country: "İSK", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 26, team: "Olimpija Ljubljana", country: "SVN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 27, team: "Celje", country: "SVN", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 28, team: "The New Saints", country: "GAL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 29, team: "Borac Banja Luka", country: "BOS", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 30, team: "Shamrock Rovers", country: "İRL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 31, team: "Larne", country: "K.İR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 32, team: "Dinamo Minsk", country: "BLR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 33, team: "Noah", country: "ERM", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 34, team: "Vikingur Reykjavik", country: "İZL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 35, team: "Petrocub", country: "MOL", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" },
    { rank: 36, team: "TSC Backa Topola", country: "SIR", played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: "" }
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = parseInt(searchParams.get("tournament") || "2", 10);
  const season = searchParams.get("season") || "2024";

  if (API_FOOTBALL_KEY) {
    try {
      const response = await fetch(`${API_URL}/standings?league=${tournamentId}&season=${season}`, {
        method: "GET",
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": API_FOOTBALL_KEY,
        },
        next: { revalidate: 600 },
      });

      if (response.ok) {
        const data = await response.json();
        const apiStandings = data.response?.[0]?.league?.standings?.[0];

        if (Array.isArray(apiStandings) && apiStandings.length > 0) {
          const formatted = apiStandings.map((item: any) => ({
            rank: item.rank,
            team: item.team?.name,
            teamId: item.team?.id,
            logo: item.team?.logo,
            played: item.all?.played || 0,
            win: item.all?.win || 0,
            draw: item.all?.draw || 0,
            lose: item.all?.lose || 0,
            gf: item.all?.goals?.for || 0,
            ga: item.all?.goals?.against || 0,
            gd: item.goalsDiff ?? ((item.all?.goals?.for || 0) - (item.all?.goals?.against || 0)),
            pts: item.points || 0,
            form: item.form || "",
            description: item.description || ""
          }));

          return NextResponse.json({
            success: true,
            tournamentId,
            standings: formatted,
            isLive: true
          });
        }
      }
    } catch (e) {
      console.warn("API Football standings fetch error, using fallback:", e);
    }
  }

  // Fallback to static qualified 36 teams if live API has no records yet
  const fallback = FALLBACK_STANDINGS[tournamentId] || FALLBACK_STANDINGS[2];
  return NextResponse.json({
    success: true,
    tournamentId,
    standings: fallback,
    isLive: false
  });
}
