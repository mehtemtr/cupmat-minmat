"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getAllPlayers } from "@/data/teams";
import { getPlayerDetail } from "@/data/player-details";
import { useTranslation } from "@/contexts/LocaleContext";
import Image from "next/image";
import Link from "next/link";
import { getPlayerStatus } from "@/lib/store/player-status-store";

// Local translations for common detail page terms
const localDict = {
  tr: {
    back: "← Tüm Futbolcular",
    notFound: "Futbolcu Bulunamadı",
    age: "Yaş",
    club: "Kulüp Takımı",
    position: "Mevki",
    statsTitle: "Turnuva Performans İstatistikleri",
    matchesPlayed: "Oynanan Maç",
    goals: "Gol",
    assists: "Asist",
    passes: "Pas İsabeti",
    tackles: "Top Kazanma",
    rating: "Genel Derece",
    bio: "Futbolcu Biyografisi",
    timerTitle: "Keşif Sayacı",
    timerCounting: "Keşfediliyor...",
    timerRewarded: "✓ Keşfedildi",
    timerExploitBlocked: "Keşif Ödülü Alındı",
    pointsAwarded: "Keşif Puanı!",
    positionGK: "Kaleci",
    positionDF: "Defans",
    positionMF: "Orta Saha",
    positionFW: "Forvet",
    country: "Ülke",
    yellowCards: "Sarı Kart",
    redCards: "Kırmızı Kart",
    ownGoals: "Kendi Kalesine Gol",
    cleanSheets: "Gol Yememe Maçı",
    fantasyPoints: "Taktik Puanı",
    loading: "İstatistikler Yükleniyor...",
    // New goalkeeper stats
    goalsConceded: "Yenilen Gol",
    saves: "Kurtarış",
    penaltySaved: "Penaltı Kurtarma",
    shotsOnGoalAgainst: "Kaleyi Bulan Şut Karşıtı",
    xgConceded: "Beklenen Yenilen Gol (xGC)",
    xgotConceded: "Beklenen İsabetli Şut Yenilen Gol (xGOTC)",
    goalsPrevented: "Önlenen Gol",
    claimedCrosses: "Orta Durdurma",
    clearances: "Uzaklaştırma",
    punches: "Yumruklama",
    // New outfield stats
    touches: "Topla Buluşma",
    xg: "Beklenen Gol (xG)",
    xa: "Beklenen Asist (xA)",
    shotsOnGoal: "Kaleyi Bulan Şut",
    shots: "Şut",
    bigChancesCreated: "Yaratılan Büyük Şans",
    interceptions: "Pas Kesme",
    duelsWon: "Kazanılan İkili Mücadele"
  },
  en: {
    back: "← All Footballers",
    notFound: "Footballer Not Found",
    age: "Age",
    club: "Club Team",
    position: "Position",
    statsTitle: "Tournament Performance Stats",
    matchesPlayed: "Matches Played",
    goals: "Goals",
    assists: "Assists",
    passes: "Passes Completed",
    tackles: "Tackles Won",
    rating: "Overall Rating",
    bio: "Player Biography",
    timerTitle: "Discovery Timer",
    timerCounting: "Discovering...",
    timerRewarded: "✓ Discovered",
    timerExploitBlocked: "Discovery Points Claimed",
    pointsAwarded: "Discovery Points!",
    positionGK: "Goalkeeper",
    positionDF: "Defender",
    positionMF: "Midfielder",
    positionFW: "Forward",
    country: "Country",
    yellowCards: "Yellow Cards",
    redCards: "Red Cards",
    ownGoals: "Own Goals",
    cleanSheets: "Clean Sheets",
    fantasyPoints: "Tactics Points",
    loading: "Loading stats...",
    // New goalkeeper stats
    goalsConceded: "Goals Conceded",
    saves: "Saves",
    penaltySaved: "Penalties Saved",
    shotsOnGoalAgainst: "Shots on Target Against",
    xgConceded: "Expected Goals Conceded (xGC)",
    xgotConceded: "Expected Goals on Target Conceded (xGOTC)",
    goalsPrevented: "Goals Prevented",
    claimedCrosses: "Crosses Claimed",
    clearances: "Clearances",
    punches: "Punches",
    // New outfield stats
    touches: "Touches",
    xg: "Expected Goals (xG)",
    xa: "Expected Assists (xA)",
    shotsOnGoal: "Shots on Target",
    shots: "Shots",
    bigChancesCreated: "Big Chances Created",
    interceptions: "Interceptions",
    duelsWon: "Duels Won"
  },
  es: {
    back: "← Todos los Futbolistas",
    notFound: "Futbolista No Encontrado",
    age: "Edad",
    club: "Club de Fútbol",
    position: "Posición",
    statsTitle: "Estadísticas del Torneo",
    matchesPlayed: "Partidos Jugados",
    goals: "Goles",
    assists: "Asistencias",
    passes: "Pases Completados",
    tackles: "Entradas Ganadas",
    rating: "Calificación",
    bio: "Biografía del Jugador",
    timerTitle: "Temporizador de Descubrimiento",
    timerCounting: "Descubriendo...",
    timerRewarded: "✓ Descubierto",
    timerExploitBlocked: "Puntos Reclamados",
    pointsAwarded: "Puntos de Descubrimiento!",
    positionGK: "Portero",
    positionDF: "Defensor",
    positionMF: "Centrocampista",
    positionFW: "Delantero",
    country: "País",
    yellowCards: "Tarjetas Amarillas",
    redCards: "Tarjetas Rojas",
    ownGoals: "Goles en Contra",
    cleanSheets: "Portería a Cero",
    fantasyPoints: "Puntos Tácticos",
    loading: "Cargando...",
    goalsConceded: "Goles Concedidos",
    saves: "Paradas",
    penaltySaved: "Penaltis Parados",
    shotsOnGoalAgainst: "Disparos a Puerta en Contra",
    xgConceded: "Goles Esperados en Contra (xGC)",
    xgotConceded: "xGOT en Contra (xGOTC)",
    goalsPrevented: "Goles Evitados",
    claimedCrosses: "Centros Atrapados",
    clearances: "Despejes",
    punches: "Despejes de Puño",
    touches: "Toques",
    xg: "Goles Esperados (xG)",
    xa: "Asistencias Esperadas (xA)",
    shotsOnGoal: "Disparos a Puerta",
    shots: "Disparos",
    bigChancesCreated: "Grandes Ocasiones Creadas",
    interceptions: "Intercepciones",
    duelsWon: "Duelos Ganados"
  },
  fr: {
    back: "← Tous les Joueurs",
    notFound: "Joueur Non Trouvé",
    age: "Âge",
    club: "Club",
    position: "Poste",
    statsTitle: "Stats de Performance de Tournoi",
    matchesPlayed: "Matchs Joués",
    goals: "Buts",
    assists: "Passes D.",
    passes: "Passes Réussies",
    tackles: "Tacles Réussis",
    rating: "Note Globale",
    bio: "Biographie du Joueur",
    timerTitle: "Compteur de Découverte",
    timerCounting: "Découverte en cours...",
    timerRewarded: "✓ Découvert",
    timerExploitBlocked: "Points Déjà Obtenus",
    pointsAwarded: "Points de Découverte !",
    positionGK: "Gardien",
    positionDF: "Défenseur",
    positionMF: "Milieu",
    positionFW: "Attaquant",
    country: "Pays",
    yellowCards: "Cartons Jaunes",
    redCards: "Cartons Rouges",
    ownGoals: "Buts contre son camp",
    cleanSheets: "Matchs sans encaisser",
    fantasyPoints: "Points Tactiques",
    loading: "Chargement...",
    goalsConceded: "Buts Encaissés",
    saves: "Arrêts",
    penaltySaved: "Penaltys Arrêtés",
    shotsOnGoalAgainst: "Tirs Cadrés Subis",
    xgConceded: "Buts Attendus Concédés (xGC)",
    xgotConceded: "xGOT Concédés (xGOTC)",
    goalsPrevented: "Buts Évités",
    claimedCrosses: "Centres Captés",
    clearances: "Dégagements",
    punches: "Pugilats",
    touches: "Ballons Touchés",
    xg: "Buts Attendus (xG)",
    xa: "Passes D. Attendues (xA)",
    shotsOnGoal: "Tirs Cadrés",
    shots: "Tirs",
    bigChancesCreated: "Grandes Occasions Créées",
    interceptions: "Interceptions",
    duelsWon: "Duels Gagnés"
  },
  de: {
    back: "← Alle Spieler",
    notFound: "Spieler nicht gefunden",
    age: "Alter",
    club: "Verein",
    position: "Position",
    statsTitle: "Turnierstatistiken",
    matchesPlayed: "Spiele",
    goals: "Tore",
    assists: "Vorlagen",
    passes: "Erfolgreiche Pässe",
    tackles: "Zweikämpfe",
    rating: "Gesamtbewertung",
    bio: "Spielerbiografie",
    timerTitle: "Entdeckungs-Timer",
    timerCounting: "Entdecken...",
    timerRewarded: "✓ Entdeckt",
    timerExploitBlocked: "Punkte bereits erhalten",
    pointsAwarded: "Entdeckungspunkte!",
    positionGK: "Torwart",
    positionDF: "Abwehr",
    positionMF: "Mittelfeld",
    positionFW: "Sturm",
    country: "Land",
    yellowCards: "Gelbe Karten",
    redCards: "Rote Karten",
    ownGoals: "Eigentore",
    cleanSheets: "Weiße Weste",
    fantasyPoints: "Taktik-Punkte",
    loading: "Laden...",
    goalsConceded: "Gegentore",
    saves: "Paraden",
    penaltySaved: "Elfmeter Gehalten",
    shotsOnGoalAgainst: "Torschüsse Gegen",
    xgConceded: "Expected Goals Gegen (xGC)",
    xgotConceded: "Expected Goals on Target Gegen (xGOTC)",
    goalsPrevented: "Verhinderte Tore",
    claimedCrosses: "Abgefangene Flanken",
    clearances: "Befreiungsschläge",
    punches: "Faustbälle",
    touches: "Ballkontakte",
    xg: "Expected Goals (xG)",
    xa: "Expected Assists (xA)",
    shotsOnGoal: "Schüsse aufs Tor",
    shots: "Schüsse",
    bigChancesCreated: "Großchancen Kreiert",
    interceptions: "Abgefangene Bälle",
    duelsWon: "Gewonnene Zweikämpfe"
  }
};

export default function FootballerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const id = params?.id as string;
  const allPlayers = getAllPlayers();
  const player = allPlayers.find((p) => p.id === id);

  // Discovery Timer & Leaderboard States
  const [countdown, setCountdown] = useState(5);
  const [isDiscovered, setIsDiscovered] = useState(false);

  // Tournament Stats States
  const [realStats, setRealStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoadingStats(true);
    fetch(`/api/stats/player-tournament-stats?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.stats) {
          setRealStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching tournament stats:", err))
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!player) return;

    // Check if player was already discovered in this session to prevent exploits
    const alreadyDiscovered = sessionStorage.getItem(`discovered_${player.id}`);
    if (alreadyDiscovered) {
      setIsDiscovered(true);
      setCountdown(0);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isDiscovered) {
      setIsDiscovered(true);
      sessionStorage.setItem(`discovered_${player.id}`, "true");
      
      // TRIGGER LEADERBOARD / POINTS CONNECTION HERE
      // Global veya local storage puan tablosu mekanizmanızı günceller
      const currentPoints = parseInt(localStorage.getItem("discovery_points") || "0", 10);
      localStorage.setItem("discovery_points", (currentPoints + 10).toString());
      
      // Custom event dispatching so navigation bars or scoreboard components update live
      window.dispatchEvent(new Event("scoreboardUpdated"));
    }
  }, [countdown, player, isDiscovered]);

  if (!player) {
    return (
      <PageShell title={dict.notFound}>
        <div className="text-center py-20">
          <p className="text-zinc-400 mb-6 text-lg">
            {id ? `"${id}" ID'li futbolcu sistemde bulunamadı.` : "Futbolcu kodu geçersiz."}
          </p>
          <button
            onClick={() => router.push("/futbolcular")}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            {dict.back}
          </button>
        </div>
      </PageShell>
    );
  }

  const details = getPlayerDetail(player.id, player.name, player.position, player.teamId);
  const countryName = locale === "tr" ? player.teamNameTr : player.teamNameEn;

  const getPositionLabel = (pos: string) => {
    switch (pos.toUpperCase()) {
      case "GK": return dict.positionGK;
      case "DF": return dict.positionDF;
      case "MF": return dict.positionMF;
      case "FW": return dict.positionFW;
      default: return pos;
    }
  };

  const getPositionColor = (pos: string) => {
    switch (pos.toUpperCase()) {
      case "GK": return "text-rose-400";
      case "DF": return "text-sky-400";
      case "MF": return "text-indigo-400";
      case "FW": return "text-emerald-400";
      default: return "text-zinc-400";
    }
  };

  return (
    <PageShell title={player.name} subtitle={getPositionLabel(player.position)}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => router.push("/futbolcular")}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all text-sm"
        >
          {dict.back}
        </button>

        {/* Discovery Timer UI */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider">{dict.timerTitle}:</span>
          {!isDiscovered ? (
            <span className="text-amber-400 font-mono font-bold animate-pulse">
              {dict.timerCounting} ({countdown}s)
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
              {dict.timerRewarded} <span className="text-zinc-500 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400">+10 XP</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 relative">
        {/* LEFT COLUMN: Player Avatar Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar card with Flag */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="w-28 h-28 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-4xl text-emerald-400 shadow-2xl mb-4 border-t-emerald-500/20 select-none">
              {player.name.charAt(0)}
            </div>

            <h2 className="text-2xl font-black text-white leading-snug">{player.name}</h2>
            <p className={`text-sm mt-1 font-bold ${getPositionColor(player.position)}`}>
              {getPositionLabel(player.position)}
            </p>

            <div className="w-full border-t border-zinc-900 my-5" />

            {/* Flag & Team affiliation */}
            <div className="w-full space-y-4 text-left text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">{dict.position}</span>
                <span className={`font-bold ${getPositionColor(player.position)}`}>
                  {getPositionLabel(player.position)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500">{dict.age}</span>
                <span className="text-zinc-200 font-bold">{player.age}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500">{dict.club}</span>
                <span className="text-zinc-200 font-bold truncate max-w-[150px]">{player.club}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                <span className="text-zinc-500">{dict.country}</span>
                <Link 
                  href={`/ulkeler/${player.teamId}`}
                  className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition-colors group"
                >
                  <div className="relative w-5 h-3.5 overflow-hidden rounded border border-zinc-800/40 group-hover:ring-1 group-hover:ring-emerald-500/35 transition-all">
                    <Image
                      src={player.teamFlagUrl}
                      alt={`${countryName} flag`}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-zinc-200 font-bold truncate max-w-[120px] group-hover:text-emerald-400 transition-colors">
                    {countryName}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Statistics & Biography */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dynamic AI News Agent Player Status Overlay */}
          {(() => {
            const statusUpdate = getPlayerStatus(player.id);
            if (!statusUpdate || statusUpdate.status === "hazir") return null;

            const isSakat = statusUpdate.status === "sakat";
            const icon = isSakat ? "🤕" : "🟥";
            const statusLabel = isSakat
              ? locale === "tr"
                ? "Sakat"
                : "Injured"
              : locale === "tr"
              ? "Cezalı"
              : "Suspended";
            const borderColor = isSakat ? "border-rose-900/50" : "border-amber-900/50";
            const bgColor = isSakat ? "bg-rose-950/15" : "bg-amber-950/15";
            const textColor = isSakat ? "text-rose-400" : "text-amber-400";

            return (
              <div className={`p-5 rounded-3xl border ${borderColor} ${bgColor} backdrop-blur-md shadow-2xl flex flex-col gap-1.5 animate-fadeIn`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-950/80 border ${borderColor} ${textColor}`}>
                    {statusLabel}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold ml-auto uppercase tracking-widest">
                    ⚡ AI Haber Ajanı Raporu
                  </span>
                </div>
                <p className="text-zinc-300 text-xs font-semibold leading-relaxed mt-2">
                  {statusUpdate.detail}
                </p>
              </div>
            );
          })()}

          {/* Biography Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2 border-b border-zinc-900 pb-3">
              📖 {dict.bio}
            </h3>
            <p className="text-zinc-300 leading-relaxed text-base italic">
              &ldquo;{details.bio[activeLang] || details.bio["en"]}&rdquo;
            </p>
          </div>

          {/* Detailed Statistics Cards */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 border-b border-zinc-900 pb-3">
              📊 {dict.statsTitle}
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Rating Star Indicator */}
              <div className="sm:col-span-2 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 text-xs uppercase tracking-wider block">
                    ⭐ {dict.rating}
                  </span>
                  <span className="text-3xl font-black text-white mt-1 block">
                    {details.stats.rating} <span className="text-zinc-600 text-sm">/ 10</span>
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => {
                    const filled = starIndex < Math.round(details.stats.rating / 2);
                    return (
                      <span key={starIndex} className={`text-2xl ${filled ? "text-amber-400 animate-pulse" : "text-zinc-800"}`}>
                        ★
                      </span>
                    );
                  })}
                </div>
              </div>

              {loadingStats ? (
                <div className="sm:col-span-2 py-12 text-center text-zinc-500 text-sm animate-pulse">
                  {dict.loading}
                </div>
              ) : (() => {
                const displayStats = realStats || {
                  matchesPlayed: 0,
                  goals: 0,
                  assists: 0,
                  yellowCards: 0,
                  redCards: 0,
                  ownGoals: 0,
                  cleanSheets: 0,
                  points: 0,
                  isGoalkeeper: player.position.toUpperCase() === "GK",
                  goalsConceded: 0,
                  saves: 0,
                  penaltySaved: 0,
                  shotsOnGoalAgainst: 0,
                  xgConceded: 0.0,
                  xgotConceded: 0.0,
                  goalsPrevented: 0.0,
                  claimedCrosses: 0,
                  clearances: 0,
                  punches: 0,
                  touches: 0,
                  xg: 0.0,
                  xa: 0.0,
                  shotsOnGoal: 0,
                  shots: 0,
                  bigChancesCreated: 0,
                  interceptions: 0,
                  duelsWon: 0
                };

                return (
                  <>
                    {/* Stat row: Matches Played */}
                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                      <span className="text-zinc-500 text-xs block">{dict.matchesPlayed}</span>
                      <span className="text-xl font-bold text-white mt-1 block">
                        🏃‍♂️ {displayStats.matchesPlayed}
                      </span>
                    </div>

                    {/* Stat row: Fantasy Points */}
                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-emerald-950 transition-colors">
                      <span className="text-zinc-500 text-xs block">{dict.fantasyPoints}</span>
                      <span className="text-xl font-bold text-emerald-400 mt-1 block">
                        💎 {displayStats.points}
                      </span>
                    </div>

                    {displayStats.isGoalkeeper ? (
                      /* GOALKEEPER CARD DETAILS */
                      <>
                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.goalsConceded}</span>
                          <span className="text-xl font-bold text-rose-400 mt-1 block">
                            🥅 {displayStats.goalsConceded}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.saves}</span>
                          <span className="text-xl font-bold text-sky-400 mt-1 block">
                            🧤 {displayStats.saves}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.penaltySaved}</span>
                          <span className="text-xl font-bold text-emerald-400 mt-1 block">
                            ⛔ {displayStats.penaltySaved}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.shotsOnGoalAgainst}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            🎯 {displayStats.shotsOnGoalAgainst}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.xgConceded}</span>
                          <span className="text-xl font-bold text-amber-500 mt-1 block">
                            📈 {displayStats.xgConceded}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.xgotConceded}</span>
                          <span className="text-xl font-bold text-orange-400 mt-1 block">
                            📊 {displayStats.xgotConceded}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.goalsPrevented}</span>
                          <span className="text-xl font-bold text-emerald-400 mt-1 block">
                            🛡️ {displayStats.goalsPrevented}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.claimedCrosses}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            🙌 {displayStats.claimedCrosses}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.clearances}</span>
                          <span className="text-xl font-bold text-zinc-400 mt-1 block">
                            💥 {displayStats.clearances}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.punches}</span>
                          <span className="text-xl font-bold text-zinc-400 mt-1 block">
                            👊 {displayStats.punches}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* OUTFIELD PLAYER CARD DETAILS */
                      <>
                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.goals}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            ⚽ {displayStats.goals}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.assists}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            👟 {displayStats.assists}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.touches}</span>
                          <span className="text-xl font-bold text-sky-400 mt-1 block">
                            🔄 {displayStats.touches}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.xg}</span>
                          <span className="text-xl font-bold text-amber-500 mt-1 block">
                            📈 {displayStats.xg}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.xa}</span>
                          <span className="text-xl font-bold text-orange-400 mt-1 block">
                            📊 {displayStats.xa}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.shotsOnGoal}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            🎯 {displayStats.shotsOnGoal}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.shots}</span>
                          <span className="text-xl font-bold text-zinc-400 mt-1 block">
                            💥 {displayStats.shots}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.bigChancesCreated}</span>
                          <span className="text-xl font-bold text-emerald-400 mt-1 block">
                            💡 {displayStats.bigChancesCreated}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.interceptions}</span>
                          <span className="text-xl font-bold text-white mt-1 block">
                            🛡️ {displayStats.interceptions}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                          <span className="text-zinc-500 text-xs block">{dict.duelsWon}</span>
                          <span className="text-xl font-bold text-sky-400 mt-1 block">
                            ⚔️ {displayStats.duelsWon}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Universal cards */}
                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                      <span className="text-zinc-500 text-xs block">{dict.yellowCards}</span>
                      <span className="text-xl font-bold text-amber-500 mt-1 block">
                        🟨 {displayStats.yellowCards}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                      <span className="text-zinc-500 text-xs block">{dict.redCards}</span>
                      <span className="text-xl font-bold text-rose-500 mt-1 block">
                        🟥 {displayStats.redCards}
                      </span>
                    </div>

                    {displayStats.cleanSheets > 0 && (
                      <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                        <span className="text-zinc-500 text-xs block">{dict.cleanSheets}</span>
                        <span className="text-xl font-bold text-sky-400 mt-1 block">
                          🛡️ {displayStats.cleanSheets}
                        </span>
                      </div>
                    )}

                    {displayStats.ownGoals > 0 && (
                      <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 shadow-sm hover:border-zinc-800 transition-colors">
                        <span className="text-zinc-500 text-xs block">{dict.ownGoals}</span>
                        <span className="text-xl font-bold text-red-400 mt-1 block">
                          😈 {displayStats.ownGoals}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}