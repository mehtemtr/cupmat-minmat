"use client";

import { PageShell } from "@/components/PageShell";
import { getAllPlayers, getTeamName, sortPlayersWithBjkBias } from "@/data/teams";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPlayerStatus } from "@/lib/store/player-status-store";

// Local translations for common terms on the player listing
const localDict = {
  tr: {
    title: "Dünya Kupası Yıldızları",
    subtitle: "Turnuvada mücadele eden 48 milli takımın elit futbolcu kadroları",
    searchPlaceholder: "Oyuncu, kulüp veya ülke ara...",
    positionAll: "Hepsi",
    positionGK: "Kaleci",
    positionDF: "Defans",
    positionMF: "Orta Saha",
    positionFW: "Forvet",
    age: "yaş",
    club: "Kulüp",
    viewProfile: "Profili İncele →",
    noResults: "Arama kriterlerine uygun futbolcu bulunamadı.",
    country: "Ülke"
  },
  en: {
    title: "World Cup Stars",
    subtitle: "Elite player rosters from the 48 competing national teams",
    searchPlaceholder: "Search player, club, or country...",
    positionAll: "All",
    positionGK: "Goalkeeper",
    positionDF: "Defender",
    positionMF: "Midfielder",
    positionFW: "Forward",
    age: "years old",
    club: "Club",
    viewProfile: "View Profile →",
    noResults: "No players found matching the search criteria.",
    country: "Country"
  },
  es: {
    title: "Estrellas del Mundial",
    subtitle: "Plantillas de futbolistas de las 48 selecciones nacionales",
    searchPlaceholder: "Buscar jugador, club o país...",
    positionAll: "Todos",
    positionGK: "Portero",
    positionDF: "Defensor",
    positionMF: "Centrocampista",
    positionFW: "Delantero",
    age: "años",
    club: "Club",
    viewProfile: "Ver Perfil →",
    noResults: "No se encontraron futbolistas con los criterios de búsqueda.",
    country: "País"
  },
  fr: {
    title: "Étoiles de la Coupe du Monde",
    subtitle: "Effectifs des joueurs d'élite des 48 équipes nationales",
    searchPlaceholder: "Rechercher joueur, club ou pays...",
    positionAll: "Tous",
    positionGK: "Gardien",
    positionDF: "Défenseur",
    positionMF: "Milieu",
    positionFW: "Attaquant",
    age: "ans",
    club: "Club",
    viewProfile: "Voir le Profil →",
    noResults: "Aucun joueur trouvé correspondant à vos critères.",
    country: "Pays"
  },
  de: {
    title: "WM-Sterne",
    subtitle: "Kader der besten Spieler aller 48 Nationalmannschaften",
    searchPlaceholder: "Spieler, Verein oder Land suchen...",
    positionAll: "Alle",
    positionGK: "Torwart",
    positionDF: "Abwehr",
    positionMF: "Mittelfeld",
    positionFW: "Sturm",
    age: "Jahre",
    club: "Verein",
    viewProfile: "Profil anzeigen →",
    noResults: "Keine Spieler gefunden, die den Kriterien entsprechen.",
    country: "Land"
  }
};

export default function FootballersListPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  
  // Safe multi-language mapping
  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const [search, setSearch] = useState("");
  const [activePosition, setActivePosition] = useState<"ALL" | "GK" | "DF" | "MF" | "FW">("ALL");

  const allPlayers = useMemo(() => getAllPlayers(), []);

  // Filter and search logic
  const filteredPlayers = useMemo(() => {
    const list = allPlayers.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.club.toLowerCase().includes(search.toLowerCase()) ||
        p.teamNameTr.toLowerCase().includes(search.toLowerCase()) ||
        p.teamNameEn.toLowerCase().includes(search.toLowerCase());

      const matchesPosition =
        activePosition === "ALL" || p.position.toUpperCase() === activePosition;

      return matchesSearch && matchesPosition;
    });

    // Apply custom Beşiktaş-top & Galatasaray-bottom global sorting rule
    return sortPlayersWithBjkBias(list);
  }, [allPlayers, search, activePosition]);

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
      case "GK":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "DF":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "MF":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "FW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <PageShell title={dict.title} subtitle={dict.subtitle}>
      {/* Search & Filter Bar */}
      <section className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="flex-grow rounded-2xl border border-zinc-800 bg-zinc-950/60 px-5 py-4 text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-xl backdrop-blur-md"
          />

          {/* Position Selector Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {(["ALL", "GK", "DF", "MF", "FW"] as const).map((pos) => {
              let label = dict.positionAll;
              if (pos === "GK") label = dict.positionGK;
              if (pos === "DF") label = dict.positionDF;
              if (pos === "MF") label = dict.positionMF;
              if (pos === "FW") label = dict.positionFW;

              return (
                <button
                  key={pos}
                  onClick={() => setActivePosition(pos)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                    activePosition === pos
                      ? "bg-emerald-500 border-emerald-500 text-[#060b14] shadow-lg shadow-emerald-500/20 scale-95"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid of Footballers */}
      {filteredPlayers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/50 p-5 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300 shadow-2xl flex flex-col justify-between"
            >
              {/* Card Header visual gradient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

              <div>
                {/* Player Photo concept & Details */}
                <div className="flex justify-between items-start mb-4">
                  {/* Photo Avatar circle with initials */}
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-lg text-emerald-400 shadow-inner group-hover:scale-105 transition-transform duration-300 select-none">
                    {player.name.charAt(0)}
                  </div>

                  <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${getPositionColor(player.position)}`}>
                    {getPositionLabel(player.position)}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-emerald-400 transition-colors truncate">
                  {player.name}
                </h3>
                
                <p className="text-zinc-500 text-xs mt-1">
                  {player.age} {dict.age}
                </p>

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
                  const borderColor = isSakat ? "border-rose-500/20" : "border-amber-500/20";
                  const bgColor = isSakat ? "bg-rose-500/10" : "bg-amber-500/10";
                  const textColor = isSakat ? "text-rose-400" : "text-amber-400";

                  return (
                    <div className={`mt-2 inline-flex items-center gap-1 ${bgColor} border ${borderColor} px-2 py-0.5 rounded-lg text-[9px] font-black ${textColor} uppercase tracking-wider animate-pulse`}>
                      {icon} {statusLabel}
                    </div>
                  );
                })()}

                {/* Country Row */}
                <Link 
                  href={`/ulkeler/${player.teamId}`}
                  className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2 hover:text-emerald-400 cursor-pointer transition-colors group/team"
                >
                  <div className="relative w-6 h-4 overflow-hidden rounded shadow border border-zinc-800/40 group-hover/team:ring-1 group-hover/team:ring-emerald-500/35 transition-all">
                    <img
                      src={player.teamFlagUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-zinc-300 text-xs font-semibold truncate group-hover/team:text-emerald-400 transition-colors">
                    {locale === "tr" ? player.teamNameTr : player.teamNameEn}
                  </span>
                </Link>

                {/* Club Details */}
                <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                  ⚽ {dict.club}: <span className="text-zinc-400 font-medium truncate max-w-[120px]">{player.club}</span>
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-3">
                <button
                  onClick={() => router.push(`/futbolcular/${player.id}`)}
                  className="w-full py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:text-zinc-950 transition-all duration-300 block text-center shadow-lg"
                >
                  {dict.viewProfile}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20">
          <p className="text-zinc-500 text-base">{dict.noResults}</p>
        </div>
      )}
    </PageShell>
  );
}
