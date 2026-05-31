import * as fs from "fs";
import * as path from "path";

const dictionariesDir = path.join(__dirname, "../dictionaries");

const updates: Record<string, { statsNav: string; statsPage: any }> = {
  tr: {
    statsNav: "İstatistikler",
    statsPage: {
      title: "Turnuva İstatistikleri",
      subtitle: "Kadro yaş, boy, kilo ortalamaları, kulüp temsilcileri ve tarihteki Dünya Kupası rekorlarını analiz edin.",
      tabSquad: "Kadro Analizleri",
      tabLive: "Canlı İstatistik",
      tabHistory: "Tarihsel Rekorlar",
      youngestTitle: "En Genç 20 Futbolcu",
      oldestTitle: "En Yaşlı 20 Futbolcu",
      topClubsTitle: "En Çok Oyuncu Gönderen Kulüpler",
      confederationsTitle: "Konfederasyon Dağılımı",
      countryAveragesTitle: "Ülke Kadro Ortalamaları",
      historyWins: "Dünya Kupası Şampiyonluk Sayıları",
      historyFinals: "En Çok Final Oynayan Ülkeler",
      historyScorers: "Dünya Kupası Tarihinin En Golcüleri",
      liveScorers: "Turnuva Gol Krallığı",
      liveAssists: "Turnuva Asist Krallığı",
      liveCards: "Kart Raporları",
      liveOwnGoals: "Kendi Kalesine Goller",
      liveNote: "Bu istatistikler, turnuva maçları başladığında canlı olarak otomatik güncellenecektir.",
      colPlayer: "Futbolcu",
      colTeam: "Takım",
      colAge: "Yaş",
      colClub: "Kulüp",
      colHeight: "Boy (cm)",
      colWeight: "Kilo (kg)",
      colLeague: "Lig",
      avgAge: "Ort. Yaş",
      avgHeight: "Ort. Boy",
      avgWeight: "Ort. Kilo",
      emptyData: "Veriler yükleniyor veya istatistik bulunamadı."
    }
  },
  en: {
    statsNav: "Stats",
    statsPage: {
      title: "Tournament Statistics",
      subtitle: "Analyze player ages, heights, weights, club representations, and historical World Cup records.",
      tabSquad: "Squad Analysis",
      tabLive: "Live Stats",
      tabHistory: "Historical Records",
      youngestTitle: "Top 20 Youngest Players",
      oldestTitle: "Top 20 Oldest Players",
      topClubsTitle: "Top Clubs Represented",
      confederationsTitle: "Players by Confederation",
      countryAveragesTitle: "Country Squad Averages",
      historyWins: "Most World Cup Titles",
      historyFinals: "Most Finals Played",
      historyScorers: "World Cup All-Time Top Scorers",
      liveScorers: "Tournament Top Scorers",
      liveAssists: "Tournament Top Assists",
      liveCards: "Card Reports",
      liveOwnGoals: "Own Goals",
      liveNote: "These stats will update live automatically once the tournament matches kickoff.",
      colPlayer: "Player",
      colTeam: "Team",
      colAge: "Age",
      colClub: "Club",
      colHeight: "Height (cm)",
      colWeight: "Weight (kg)",
      colLeague: "League",
      avgAge: "Avg. Age",
      avgHeight: "Avg. Height",
      avgWeight: "Avg. Weight",
      emptyData: "Loading data or no statistics available."
    }
  },
  de: {
    statsNav: "Statistiken",
    statsPage: {
      title: "Turnierstatistiken",
      subtitle: "Analysieren Sie Alter, Größe, Gewicht der Spieler, Vereinsvertretungen und historische WM-Rekorde.",
      tabSquad: "Kaderanalyse",
      tabLive: "Live-Statistiken",
      tabHistory: "Historische Rekorde",
      youngestTitle: "Top 20 der jüngsten Spieler",
      oldestTitle: "Top 20 der ältesten Spieler",
      topClubsTitle: "Am stärksten vertretene Vereine",
      confederationsTitle: "Spieler nach Konföderation",
      countryAveragesTitle: "Durchschnittswerte der Nationalkader",
      historyWins: "Die meisten WM-Titel",
      historyFinals: "Die meisten gespielten Finalspiele",
      historyScorers: "Ewige Torschützenliste der WM",
      liveScorers: "Torschützenkönig des Turniers",
      liveAssists: "Top-Vorlagengeber des Turniers",
      liveCards: "Kartenberichte",
      liveOwnGoals: "Eigentore",
      liveNote: "Diese Statistiken werden automatisch live aktualisiert, sobald die Turnierspiele angepfiffen werden.",
      colPlayer: "Spieler",
      colTeam: "Team",
      colAge: "Alter",
      colClub: "Verein",
      colHeight: "Größe (cm)",
      colWeight: "Gewicht (kg)",
      colLeague: "Liga",
      avgAge: "Ø Alter",
      avgHeight: "Ø Größe",
      avgWeight: "Ø Gewicht",
      emptyData: "Daten werden geladen oder keine Statistiken verfügbar."
    }
  },
  es: {
    statsNav: "Estadísticas",
    statsPage: {
      title: "Estadísticas del Torneo",
      subtitle: "Analiza las edades, alturas, pesos de los jugadores, representación de clubes y récords históricos de la Copa Mundial.",
      tabSquad: "Análisis de Plantillas",
      tabLive: "Estadísticas en Vivo",
      tabHistory: "Récords Históricos",
      youngestTitle: "Top 20 Jugadores Más Jóvenes",
      oldestTitle: "Top 20 Jugadores Más Veteranos",
      topClubsTitle: "Clubes con Más Representantes",
      confederationsTitle: "Jugadores por Confederación",
      countryAveragesTitle: "Promedios por País",
      historyWins: "Más Títulos de la Copa Mundial",
      historyFinals: "Más Finales Disputadas",
      historyScorers: "Máximos Goleadores Históricos",
      liveScorers: "Tabla de Goleadores",
      liveAssists: "Tabla de Asistencias",
      liveCards: "Reporte de Tarjetas",
      liveOwnGoals: "Goles en Propia Puerta",
      liveNote: "Estas estadísticas se actualizarán en vivo automáticamente una vez que comiencen los partidos del torneo.",
      colPlayer: "Jugador",
      colTeam: "Equipo",
      colAge: "Edad",
      colClub: "Club",
      colHeight: "Altura (cm)",
      colWeight: "Peso (kg)",
      colLeague: "Liga",
      avgAge: "Prom. Edad",
      avgHeight: "Prom. Altura",
      avgWeight: "Prom. Peso",
      emptyData: "Cargando datos o no hay estadísticas disponibles."
    }
  },
  fr: {
    statsNav: "Statistiques",
    statsPage: {
      title: "Statistiques du Tournoi",
      subtitle: "Analysez l'âge, la taille et le poids des joueurs, les clubs représentés et les records historiques de la Coupe du Monde.",
      tabSquad: "Analyse des Effectifs",
      tabLive: "Stats en Direct",
      tabHistory: "Records Historiques",
      youngestTitle: "Top 20 des plus jeunes joueurs",
      oldestTitle: "Top 20 des plus vieux joueurs",
      topClubsTitle: "Clubs les plus représentés",
      confederationsTitle: "Joueurs par Confédération",
      countryAveragesTitle: "Moyennes des Effectifs Nationaux",
      historyWins: "Plus grand nombre de titres",
      historyFinals: "Plus grand nombre de finales jouées",
      historyScorers: "Meilleurs buteurs de l'histoire de la CM",
      liveScorers: "Meilleurs buteurs du tournoi",
      liveAssists: "Meilleurs passeurs du tournoi",
      liveCards: "Rapport sur les cartons",
      liveOwnGoals: "Buts contre son camp",
      liveNote: "Ces statistiques seront mises à jour en direct automatiquement dès le coup d'envoi du tournoi.",
      colPlayer: "Joueur",
      colTeam: "Équipe",
      colAge: "Âge",
      colClub: "Club",
      colHeight: "Taille (cm)",
      colWeight: "Poids (kg)",
      colLeague: "Ligue",
      avgAge: "Âge moy.",
      avgHeight: "Taille moy.",
      avgWeight: "Poids moy.",
      emptyData: "Chargement des données ou aucune statistique disponible."
    }
  }
};

function main() {
  const files = fs.readdirSync(dictionariesDir);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const lang = file.replace(".json", "");
    const update = updates[lang];
    if (!update) continue;

    const filePath = path.join(dictionariesDir, file);
    console.log(`Updating ${file}...`);
    
    const content = fs.readFileSync(filePath, "utf8");
    const dict = JSON.parse(content);

    // 1. Add to nav
    if (dict.nav) {
      dict.nav.stats = update.statsNav;
    }
    
    // 2. Add statsPage
    dict.statsPage = update.statsPage;

    fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), "utf8");
    console.log(`Successfully updated ${file}`);
  }
}

main();
