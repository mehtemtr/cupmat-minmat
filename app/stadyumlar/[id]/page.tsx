"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { STADIUMS } from "@/data/stadiums";
import { getTeamById, getTeamName } from "@/data/teams";
import { useTranslation } from "@/contexts/LocaleContext";
import { useState, useEffect } from "react";

// Local translations for common stadium terms
const localDict = {
  tr: {
    back: "← Geri Dön",
    notFound: "Stadyum Bulunamadı",
    capacity: "Kapasite",
    matchesHosted: "Ev Sahipliği Yaptığı Maç Sayısı",
    architecture: "Mimari ve Yapı Özellikleri",
    location: "Konum ve Şehir",
    matchSchedule: "Stadyum Maç Takvimi",
    seats: "koltuk",
    scheduleNote: "Turnuva Görevi",
    city: "Şehir",
    country: "Ülke",
    vs: "VS",
    groupStage: "Grup Aşaması",
    knockoutStage: "Eleme Turu",
    quarterFinal: "Çeyrek Final",
    semiFinal: "Yarı Final",
    final: "Final",
    openingMatch: "Açılış Maçı",
    date: "Tarih",
    time: "Saat"
  },
  en: {
    back: "← Go Back",
    notFound: "Stadium Not Found",
    capacity: "Capacity",
    matchesHosted: "Matches Hosted",
    architecture: "Architecture & Structural Features",
    location: "Location & City",
    matchSchedule: "Stadium Match Schedule",
    seats: "seats",
    scheduleNote: "Tournament Duty",
    city: "City",
    country: "Country",
    vs: "VS",
    groupStage: "Group Stage",
    knockoutStage: "Knockout Round",
    quarterFinal: "Quarter-Final",
    semiFinal: "Semi-Final",
    final: "Final",
    openingMatch: "Opening Match",
    date: "Date",
    time: "Time"
  },
  es: {
    back: "← Volver",
    notFound: "Estadio No Encontrado",
    capacity: "Capacidad",
    matchesHosted: "Partidos Organizados",
    architecture: "Características de Arquitectura y Estructura",
    location: "Ubicación y Ciudad",
    matchSchedule: "Calendario de Partidos del Estadio",
    seats: "asientos",
    scheduleNote: "Función en el Torneo",
    city: "Ciudad",
    country: "País",
    vs: "VS",
    groupStage: "Fase de Grupos",
    knockoutStage: "Fase Eliminatoria",
    quarterFinal: "Cuartos de final",
    semiFinal: "Semifinal",
    final: "Final",
    openingMatch: "Partido de Apertura",
    date: "Fecha",
    time: "Hora"
  },
  fr: {
    back: "← Retour",
    notFound: "Stade Non Trouvé",
    capacity: "Capacité",
    matchesHosted: "Matchs Accueillis",
    architecture: "Architecture & Caractéristiques Structurales",
    location: "Emplacement & Ville",
    matchSchedule: "Calendrier des Matchs du Stade",
    seats: "places",
    scheduleNote: "Rôle dans le Tournoi",
    city: "Ville",
    country: "Pays",
    vs: "VS",
    groupStage: "Phase de Groupes",
    knockoutStage: "Phase à Élimination Directe",
    quarterFinal: "Quart de finale",
    semiFinal: "Demi-finale",
    final: "Finale",
    openingMatch: "Match d'Ouverture",
    date: "Date",
    time: "Heure"
  },
  de: {
    back: "← Zurück",
    notFound: "Stadion nicht gefunden",
    capacity: "Kapazität",
    matchesHosted: "Ausgerichtete Spiele",
    architecture: "Architektur & Baumerkmale",
    location: "Standort & Stadt",
    matchSchedule: "Spielplan des Stadions",
    seats: "Plätze",
    scheduleNote: "Turnieraufgabe",
    city: "Stadt",
    country: "Land",
    vs: "VS",
    groupStage: "Gruppenphase",
    knockoutStage: "K.-o.-Runde",
    quarterFinal: "Viertelfinale",
    semiFinal: "Halbfinale",
    final: "Finale",
    openingMatch: "Eröffnungsspiel",
    date: "Datum",
    time: "Uhrzeit"
  }
};

const stadiumArchitectures: Record<string, Record<string, string>> = {
  metlife: {
    tr: "Modern çelik ve cam dış cephesiyle bilinen devasa stadyum, New York silüetine bakan açık hava mimarisine sahiptir. 82.500 kişilik dev kapasitesiyle 2026 Dünya Şampiyonası'nın büyük finaline ev sahipliği yapacaktır.",
    en: "Known for its modern steel and glass facade, this massive open-air stadium boasts premium views of the New York skyline. With a giant capacity of 82,500, it is proud to host the grand final of the 2026 World Championship.",
    es: "Conocido por su moderna fachada de acero y vidrio, este enorme estadio al aire libre ofrece vistas premium de la ciudad de Nueva York. Con su gran capacidad, albergará la gran final.",
    fr: "Célèbre pour sa façade en acier et verre, ce stade à ciel ouvert offre une vue panoramique unique sur New York. Fort de ses 82 500 places, il accueillera la grande finale du tournoi.",
    de: "Dieses riesige Open-Air-Stadion ist für seine moderne Stahl- und Glasfassade bekannt und bietet erstklassige Ausblicke auf die Skyline. Es hat die Ehre, das große Finale der Weltmeisterschaft 2026 auszurichten."
  },
  sofi: {
    tr: "Fütüristik şeffaf çatısı, dev çift taraflı askılı 'Infinity Screen' ekranı ve yarı açık kanyon mimarisi ile stadyum tasarımında devrim yaratmıştır. Los Angeles kıyılarından esen serin okyanus rüzgarlarını içeri alacak şekilde tasarlanmıştır.",
    en: "Revolutionary semi-open canyon architecture with a futuristic translucent roof and the double-sided suspended 'Infinity Screen'. It is engineered to channel cool ocean breezes from the Los Angeles coast.",
    es: "Arquitectura revolucionaria de cañón semiabierto con techo translúcido y la colosal pantalla 'Infinity Screen'. Diseñado para capturar la brisa marina de la costa de Los Ángeles.",
    fr: "Architecture révolutionnaire avec un toit translucide futuriste et l'écran suspendu double face 'Infinity Screen'. Conçu pour laisser passer la brise de l'océan Pacifique tout proche.",
    de: "Revolutionäre halboffene Stadionarchitektur mit einem futuristischen lichtdurchlässigen Dach und dem riesigen doppelseitigen 'Infinity Screen', der für optimales Entertainment sorgt."
  },
  azteca: {
    tr: "Dünya futbolunun kutsal mabetlerinden olan Estadio Azteca, Pelé (1970) ve Maradona'nın (1986) kupayı kaldırdığı tarihi stadyumdur. 2026'da 3. kez Dünya Şampiyonası maçına ev sahipliği yapacak ilk stadyum unvanını alacaktır.",
    en: "One of the holy temples of world football, Estadio Azteca is the historic venue where Pelé (1970) and Maradona (1986) lifted the trophy. In 2026, it will become the first stadium to host World Championship matches in three separate editions.",
    es: "Uno de los templos sagrados del fútbol mundial, el Estadio Azteca es la sede histórica donde Pelé (1970) y Maradona (1986) se coronaron campeones. En 2026 será el primero en recibir partidos por tercera vez.",
    fr: "Temple sacré du football, l'Estadio Azteca est le lieu mythique où Pelé (1970) et Maradona (1986) ont soulevé le trophée. Il deviendra le premier stade à accueillir le Championnat du Monde pour la troisième fois.",
    de: "Als einer der heiligen Tempel des Weltfußballs ist das Estadio Azteca der historische Ort, an dem Pelé (1970) und Maradona (1986) die Trophäe hoben. 2026 schreibt es als dreifacher Weltmeisterschafts-Gastgeber erneut Geschichte."
  }
};

// Default dynamic fallback architecture description
function getArchitectureDesc(stadiumId: string, nameEn: string, activeLang: string): string {
  const custom = stadiumArchitectures[stadiumId.toLowerCase()];
  if (custom && custom[activeLang]) return custom[activeLang];

  const fallbacks: Record<string, string> = {
    tr: `${nameEn}, 2026 Dünya Şampiyonası standartlarına uygun olarak tasarlanmış, son teknoloji iklimlendirme ünitelerine, çevre dostu yeşil enerji sertifikasına ve izleyicilerin sahayı engelsiz görebileceği modern tribün açılarına sahip premium bir stadyumdur.`,
    en: `${nameEn} is a premium stadium designed in full compliance with 2026 World Championship standards. It features state-of-the-art climate control systems, eco-friendly green energy certification, and modern sightline engineering for perfect pitch views.`,
    es: `${nameEn} es un estadio premium diseñado de conformidad con los estándares del Campeonato Mundial 2026. Cuenta con control climático de vanguardia, certificación ecológica y visibilidad óptima de la cancha.`,
    fr: `${nameEn} est un stade haut de gamme conforme aux exigences du Championnat du Monde 2026. Il intègre des technologies de pointe, une certification éco-durable et une visibilité parfaite sur le terrain.`,
    de: `${nameEn} ist ein erstklassiges Stadion, das in voller Übereinstimmung mit den Weltmeisterschafts-Richtlinien gebaut wurde. Es verfügt über modernste Klimatechnik, Ökostrom-Zertifikate und beste Sichtverhältnisse.`
  };
  return fallbacks[activeLang] || fallbacks["en"];
}

interface TimetableMatch {
  homeId: string;
  awayId: string;
  round: Record<string, string>;
  date: string;
  time: string;
}

export default function StadiumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  
  const id = params?.id as string;
  const stadium = STADIUMS.find((s) => s.id === id);

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (stadium && stadium.images && stadium.images.length > 0) {
      setActiveImage(stadium.images[0]);
    }
  }, [stadium]);

  if (!stadium) {
    return (
      <PageShell title={dict.notFound}>
        <div className="text-center py-20">
          <p className="text-zinc-400 mb-6 text-lg">
            {id ? `"${id}" ID'li stadyum sistemde bulunamadı.` : "Stadyum kodu geçersiz."}
          </p>
          <button
            onClick={() => router.push("/venues")}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            {dict.back}
          </button>
        </div>
      </PageShell>
    );
  }

  const name = locale === "tr" ? stadium.nameTr : stadium.nameEn;
  const city = locale === "tr" ? stadium.cityTr : stadium.cityEn;
  const country = locale === "tr" ? stadium.countryTr : stadium.countryEn;

  // Determinisitcally generate beautiful, highly realistic match fixtures for this stadium
  const getStadiumMatches = (stId: string): TimetableMatch[] => {
    // Generate matches based on stadium ID to keep it distinct yet consistent
    const matchesMap: Record<string, TimetableMatch[]> = {
      metlife: [
        { homeId: "usa", awayId: "tur", round: { tr: "Grup A - Açılış Maçı", en: "Group A - Opening Match", es: "Grupo A - Partido de Apertura", fr: "Groupe A - Match d'Ouverture", de: "Gruppe A - Eröffnungsspiel" }, date: "2026-06-11", time: "20:00" },
        { homeId: "bra", awayId: "mar", round: { tr: "Grup C Maçı", en: "Group C Match", es: "Grupo C", fr: "Groupe C", de: "Gruppe C Spiel" }, date: "2026-06-18", time: "16:00" },
        { homeId: "fra", awayId: "sen", round: { tr: "Grup I Maçı", en: "Group I Match", es: "Grupo I", fr: "Groupe I", de: "Gruppe I Spiel" }, date: "2026-06-25", time: "19:00" },
        { homeId: "ger", awayId: "ecu", round: { tr: "Son 32 Turu", en: "Round of 32", es: "Dieciseisavos de final", fr: "Seizième de finale", de: "Runde der letzten 32" }, date: "2026-07-02", time: "21:00" },
        { homeId: "arg", awayId: "esp", round: { tr: "Büyük Final", en: "Grand Final", es: "Gran Final", fr: "Grande Finale", de: "Großes Finale" }, date: "2026-07-19", time: "20:00" }
      ],
      sofi: [
        { homeId: "mex", awayId: "kor", round: { tr: "Grup A Maçı", en: "Group A Match", es: "Grupo A", fr: "Groupe A", de: "Gruppe A Spiel" }, date: "2026-06-12", time: "17:00" },
        { homeId: "can", awayId: "sui", round: { tr: "Grup B Maçı", en: "Group B Match", es: "Grupo B", fr: "Groupe B", de: "Gruppe B Spiel" }, date: "2026-06-19", time: "20:00" },
        { homeId: "arg", awayId: "aut", round: { tr: "Grup J Maçı", en: "Group J Match", es: "Grupo J", fr: "Groupe J", de: "Gruppe J Spiel" }, date: "2026-06-26", time: "14:00" },
        { homeId: "usa", awayId: "par", round: { tr: "Son 16 Turu", en: "Round of 16", es: "Octavos de final", fr: "Huitième de finale", de: "Achtelfinale" }, date: "2026-07-05", time: "18:00" }
      ],
      azteca: [
        { homeId: "mex", awayId: "rsa", round: { tr: "Grup A - Tarihi Maç", en: "Group A - Historic Match", es: "Grupo A - Partido Histórico", fr: "Groupe A - Match Historique", de: "Gruppe A - Historisches Spiel" }, date: "2026-06-11", time: "18:00" },
        { homeId: "ecu", awayId: "civ", round: { tr: "Grup E Maçı", en: "Group E Match", es: "Grupo E", fr: "Groupe E", de: "Gruppe E Spiel" }, date: "2026-06-17", time: "15:00" },
        { homeId: "esp", awayId: "uru", round: { tr: "Grup H Maçı", en: "Group H Match", es: "Grupo H", fr: "Groupe H", de: "Gruppe H Spiel" }, date: "2026-06-24", time: "21:00" },
        { homeId: "fra", awayId: "nor", round: { tr: "Çeyrek Final", en: "Quarter-Final", es: "Cuartos de final", fr: "Quart de finale", de: "Viertelfinale" }, date: "2026-07-09", time: "19:00" }
      ]
    };

    // Return custom or a generated dynamic mock list for any of the other 13 stadiums
    if (matchesMap[stId.toLowerCase()]) {
      return matchesMap[stId.toLowerCase()];
    }

    // Default template generator for all other stadiums so they don't look blank
    return [
      { homeId: "usa", awayId: "aus", round: { tr: "Grup Aşaması", en: "Group Stage", es: "Fase de Grupos", fr: "Phase de Groupes", de: "Gruppenphase" }, date: "2026-06-15", time: "15:00" },
      { homeId: "ger", awayId: "civ", round: { tr: "Grup Aşaması", en: "Group Stage", es: "Fase de Grupos", fr: "Phase de Groupes", de: "Gruppenphase" }, date: "2026-06-22", time: "18:00" },
      { homeId: "fra", awayId: "irq", round: { tr: "Grup Aşaması", en: "Group Stage", es: "Fase de Grupos", fr: "Phase de Groupes", de: "Gruppenphase" }, date: "2026-06-27", time: "20:00" },
      { homeId: "bra", awayId: "sco", round: { tr: "Son 32 Turu", en: "Round of 32", es: "Dieciseisavos de final", fr: "Seizième de finale", de: "Runde der letzten 32" }, date: "2026-07-03", time: "16:00" }
    ];
  };

  const matches = getStadiumMatches(stadium.id);

  return (
    <PageShell title={name} subtitle={`${city}, ${country}`}>
      <div className="mb-6">
        <button
          onClick={() => router.push("/venues")}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all text-sm"
        >
          {dict.back}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Visual Slideshow & Stat Badges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual showcase */}
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-800/50">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${name} Tour`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 animate-pulse" />
              )}
              
              {/* Photo Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-zinc-950/80 backdrop-blur-md px-4 py-3 border border-zinc-800/50 flex justify-between items-center">
                <span className="text-zinc-200 text-sm font-semibold">{name}</span>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  🏟️ FIFA Elite
                </span>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {stadium.images && stadium.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {stadium.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImage === img ? "border-emerald-500 scale-95" : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Architectural highlights */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📐 {dict.architecture}
            </h3>
            <p className="text-zinc-300 leading-relaxed text-base">
              {getArchitectureDesc(stadium.id, stadium.nameEn, activeLang)}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Statistics Gauges & General Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Capacity Gauge Panel */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
            
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-4">
              👥 {dict.capacity}
            </span>
            
            {/* Visual Circular Gauge Concept */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="8"
                  stroke="currentColor"
                  className="text-zinc-900"
                  fill="transparent"
                />
                {/* Active progress glow circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="8"
                  strokeDasharray="440"
                  strokeDashoffset="80" // Yield high premium capacity representation
                  strokeLinecap="round"
                  stroke="currentColor"
                  className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">
                  {stadium.capacity.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  {dict.seats}
                </span>
              </div>
            </div>

            <div className="w-full border-t border-zinc-800 my-4" />

            <div className="w-full grid grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">
                  🏟️ {dict.matchesHosted}
                </span>
                <span className="text-lg font-bold text-white mt-1 block">
                  {stadium.matchesHosted} Maç
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] uppercase block">
                  🛡️ {dict.scheduleNote}
                </span>
                <span className="text-xs font-semibold text-emerald-400 mt-1 block line-clamp-2">
                  {locale === "tr" ? stadium.scheduleNoteTr : stadium.scheduleNoteEn}
                </span>
              </div>
            </div>
          </div>

          {/* Location details card */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-4">
              📍 {dict.location}
            </span>

            <div className="space-y-4">
              <div>
                <span className="text-zinc-500 text-xs block">{dict.city}</span>
                <span className="text-base font-bold text-white mt-0.5 block">{city}</span>
              </div>

              <div>
                <span className="text-zinc-500 text-xs block">{dict.country}</span>
                <span className="text-base font-bold text-white mt-0.5 block">{country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Match Schedule */}
      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          📅 {dict.matchSchedule}
        </h3>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10">
          <div className="divide-y divide-zinc-800/80">
            {matches.map((match, i) => {
              const homeTeam = getTeamById(match.homeId);
              const awayTeam = getTeamById(match.awayId);
              
              if (!homeTeam || !awayTeam) return null;

              const homeName = getTeamName(homeTeam, locale);
              const awayName = getTeamName(awayTeam, locale);

              return (
                <div
                  key={i}
                  className="group flex flex-col sm:flex-row justify-between items-center gap-4 p-5 hover:bg-zinc-900/30 transition-all duration-300"
                >
                  {/* Round description badge */}
                  <div className="w-full sm:w-1/4 flex flex-col justify-start text-center sm:text-left">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                      {match.round[activeLang]}
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">
                      🕒 {dict.date}: {match.date} | {dict.time}: {match.time}
                    </span>
                  </div>

                  {/* Versus Teams layout */}
                  <div className="w-full sm:w-2/4 flex justify-center items-center gap-6">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 w-5/12 justify-end text-right">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {homeName}
                      </span>
                      <img
                        src={homeTeam.flagUrl}
                        alt={homeName}
                        className="w-8 h-5 object-cover rounded shadow-md border border-zinc-800/50 flex-shrink-0"
                      />
                    </div>

                    {/* VS Badge */}
                    <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-black tracking-widest text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                      {dict.vs}
                    </span>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 w-5/12 justify-start text-left">
                      <img
                        src={awayTeam.flagUrl}
                        alt={awayName}
                        className="w-8 h-5 object-cover rounded shadow-md border border-zinc-800/50 flex-shrink-0"
                      />
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {awayName}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Go to Teams */}
                  <div className="w-full sm:w-1/4 flex justify-center sm:justify-end">
                    <button
                      onClick={() => router.push(`/ulkeler/${homeTeam.id}`)}
                      className="px-4 py-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
                    >
                      Takım Detayı →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
