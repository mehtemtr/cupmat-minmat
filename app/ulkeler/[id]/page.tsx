"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getTeamById, getTeamName } from "@/data/teams";
import { getCountryDetail } from "@/data/country-details";
import { useTranslation } from "@/contexts/LocaleContext";
import { useState } from "react";

// Local translations for common content page terms
const localDict = {
  tr: {
    back: "← Geri Dön",
    notFound: "Ülke Bulunamadı",
    capital: "Başkent",
    population: "Nüfus",
    nickname: "Takım Takma Adı",
    history: "Futbol Geçmişi",
    achievements: "Başarılar",
    squad: "Turnuva Kadrosu",
    manager: "Teknik Direktör",
    confederation: "Konfederasyon",
    fifaRank: "FIFA Sıralaması",
    age: "yaş",
    club: "Kulüp",
    position: "Pozisyon",
    positionGK: "Kaleci",
    positionDF: "Defans",
    positionMF: "Orta Saha",
    positionFW: "Forvet"
  },
  en: {
    back: "← Go Back",
    notFound: "Country Not Found",
    capital: "Capital",
    population: "Population",
    nickname: "Team Nickname",
    history: "Football History",
    achievements: "Achievements",
    squad: "Tournament Squad",
    manager: "Manager",
    confederation: "Confederation",
    fifaRank: "FIFA Ranking",
    age: "years old",
    club: "Club",
    position: "Position",
    positionGK: "Goalkeeper",
    positionDF: "Defender",
    positionMF: "Midfielder",
    positionFW: "Forward"
  },
  es: {
    back: "← Volver",
    notFound: "País No Encontrado",
    capital: "Capital",
    population: "Población",
    nickname: "Apodo del Equipo",
    history: "Historia de Fútbol",
    achievements: "Logros",
    squad: "Plantilla del Torneo",
    manager: "Entrenador",
    confederation: "Confederación",
    fifaRank: "Clasificación FIFA",
    age: "años",
    club: "Club",
    position: "Posición",
    positionGK: "Portero",
    positionDF: "Defensor",
    positionMF: "Centrocampista",
    positionFW: "Delantero"
  },
  fr: {
    back: "← Retour",
    notFound: "Pays Non Trouvé",
    capital: "Capitale",
    population: "Population",
    nickname: "Surnom de l'équipe",
    history: "Histoire du Football",
    achievements: "Palmarès",
    squad: "Effectif du Tournoi",
    manager: "Sélectionneur",
    confederation: "Confédération",
    fifaRank: "Classement FIFA",
    age: "ans",
    club: "Club",
    position: "Poste",
    positionGK: "Gardien",
    positionDF: "Défenseur",
    positionMF: "Milieu",
    positionFW: "Attaquant"
  },
  de: {
    back: "← Zurück",
    notFound: "Land nicht gefunden",
    capital: "Hauptstadt",
    population: "Bevölkerung",
    nickname: "Spitzname des Teams",
    history: "Fußball-Geschichte",
    achievements: "Erfolge",
    squad: "Turnierkader",
    manager: "Trainer",
    confederation: "Konföderation",
    fifaRank: "FIFA-Ranking",
    age: "Jahre",
    club: "Verein",
    position: "Position",
    positionGK: "Torwart",
    positionDF: "Abwehr",
    positionMF: "Mittelfeld",
    positionFW: "Sturm"
  }
};

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  
  const id = params?.id as string;
  const team = getTeamById(id);
  
  // Safe multi-language dictionary mapping
  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const [activeTab, setActiveTab] = useState<"history" | "achievements">("history");

  if (!team) {
    return (
      <PageShell title={dict.notFound}>
        <div className="text-center py-20">
          <p className="text-zinc-400 mb-6 text-lg">
            {id ? `"${id}" ID'li ülke sistemde kayıtlı değil.` : "Ülke kodu geçersiz."}
          </p>
          <button
            onClick={() => router.push("/teams")}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            {dict.back}
          </button>
        </div>
      </PageShell>
    );
  }

  const details = getCountryDetail(team.id, team.nameTr, team.nameEn);
  const countryName = getTeamName(team, locale);

  const getPositionLabel = (pos: string) => {
    switch (pos.toUpperCase()) {
      case "GK": return dict.positionGK;
      case "DF": return dict.positionDF;
      case "MF": return dict.positionMF;
      case "FW": return dict.positionFW;
      default: return pos;
    }
  };

  return (
    <PageShell title={countryName} subtitle={team.confederation}>
      <div className="mb-6">
        <button
          onClick={() => router.push("/teams")}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all text-sm"
        >
          {dict.back}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Flag & General Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Flag Header Card */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative w-36 h-24 mb-4 rounded-xl overflow-hidden shadow-lg border border-zinc-800/50">
              <img
                src={team.flagUrl}
                alt={`${countryName} Flag`}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-extrabold text-white">{countryName}</h2>
            {details.nickname && (
              <p className="text-emerald-400 text-sm mt-1 font-medium italic animate-pulse">
                &ldquo;{details.nickname[activeLang]}&rdquo;
              </p>
            )}

            <div className="w-full border-t border-zinc-800/80 my-6" />

            {/* Stat Row */}
            <div className="w-full space-y-4 text-left">
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider block">
                  {dict.fifaRank}
                </span>
                <span className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                  ⭐ <span className="text-emerald-400">#{team.fifaRank}</span>
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider block">
                  {dict.confederation}
                </span>
                <span className="text-base font-semibold text-zinc-200 mt-0.5 block">
                  {team.confederation}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider block">
                  {dict.capital}
                </span>
                <span className="text-base font-semibold text-zinc-200 mt-0.5 block">
                  {details.capital[activeLang]}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wider block">
                  {dict.population}
                </span>
                <span className="text-base font-semibold text-zinc-200 mt-0.5 block">
                  {details.population[activeLang]}
                </span>
              </div>
            </div>
          </div>

          {/* Manager Info Card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">
              👔 {dict.manager}
            </span>
            <h3 className="text-xl font-bold text-white">{team.manager.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-900">
              <div>
                <span className="text-zinc-500 text-xs block">{dict.age}</span>
                <span className="text-zinc-200 font-semibold">{team.manager.age}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-xs block">Görev Süresi</span>
                <span className="text-zinc-200 font-semibold">{team.manager.tenure}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed History/Achievements & Squad */}
        <div className="lg:col-span-2 space-y-6">
          {/* History / Achievements Section */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800/80 mb-6">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                  activeTab === "history"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                📖 {dict.history}
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${
                  activeTab === "achievements"
                    ? "border-emerald-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                🏆 {dict.achievements}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[160px] text-zinc-300 leading-relaxed text-base">
              {activeTab === "history" ? (
                <p className="animate-fade-in">{details.history[activeLang]}</p>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="font-semibold text-white">{dict.achievements}:</p>
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
                    {details.achievements[activeLang]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Squad Grid */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🏃‍♂️ {dict.squad}
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {player.name}
                      </h4>
                      <p className="text-zinc-500 text-xs mt-1">
                        ⚽ {player.club}
                      </p>
                    </div>
                    
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-zinc-700">
                      {getPositionLabel(player.position)}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-400">
                    <span>{dict.club}</span>
                    <span className="text-zinc-200 font-semibold">{player.club}</span>
                  </div>

                  <div className="mt-1 flex justify-between items-center text-xs text-zinc-400">
                    <span>{player.age} {dict.age}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
