"use client";

import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getRefereeById } from "@/data/referees";
import { useTranslation } from "@/contexts/LocaleContext";

// Local translations for common referee terms
const localDict = {
  tr: {
    back: "← Geri Dön",
    notFound: "Hakem Bulunamadı",
    age: "yaş",
    country: "Ülke",
    yellowCards: "Ort. Sarı Kart (Maç Başına)",
    redCards: "Ort. Kırmızı Kart (Maç Başına)",
    bio: "Hakem Profili ve Biyografi",
    importantMatches: "Yönettiği Önemli Turnuva Maçları",
    stats: "Kart İstatistikleri ve Saha Disiplini",
    confederation: "Konfederasyon",
    personalInfo: "Kişisel Bilgiler",
    eliteBadge: "FIFA Elit Kategori"
  },
  en: {
    back: "← Go Back",
    notFound: "Referee Not Found",
    age: "years old",
    country: "Country",
    yellowCards: "Avg. Yellow Cards (Per Match)",
    redCards: "Avg. Red Cards (Per Match)",
    bio: "Referee Profile & Biography",
    importantMatches: "Important Matches Officiated",
    stats: "Card Statistics & Pitch Discipline",
    confederation: "Confederation",
    personalInfo: "Personal Details",
    eliteBadge: "FIFA Elite Referee"
  },
  es: {
    back: "← Volver",
    notFound: "Árbitro No Encontrado",
    age: "años",
    country: "País",
    yellowCards: "Prom. Tarjetas Amarillas (Por Partido)",
    redCards: "Prom. Tarjetas Rojas (Por Partido)",
    bio: "Perfil y Biografía del Árbitro",
    importantMatches: "Partidos Importantes Dirigidos",
    stats: "Estadísticas de Tarjetas y Disciplina",
    confederation: "Confederación",
    personalInfo: "Datos Personales",
    eliteBadge: "Categoría Elite FIFA"
  },
  fr: {
    back: "← Retour",
    notFound: "Arbitre Non Trouvé",
    age: "ans",
    country: "Pays",
    yellowCards: "Moy. Cartons Jaunes (Par Match)",
    redCards: "Moy. Cartons Rouges (Par Match)",
    bio: "Profil & Biographie de l'Arbitre",
    importantMatches: "Matchs Importants Arbitrés",
    stats: "Statistiques de Cartons & Discipline",
    confederation: "Confédération",
    personalInfo: "Informations Personnelles",
    eliteBadge: "Catégorie Elite FIFA"
  },
  de: {
    back: "← Zurück",
    notFound: "Schiedsrichter nicht gefunden",
    age: "Jahre",
    country: "Land",
    yellowCards: "Durschn. Gelbe Karten (Pro Spiel)",
    redCards: "Durschn. Rote Karten (Pro Spiel)",
    bio: "Schiedsrichterprofil & Biografie",
    importantMatches: "Wichtige geleitete Spiele",
    stats: "Kartenstatistiken & Disziplin",
    confederation: "Konföderation",
    personalInfo: "Persönliche Daten",
    eliteBadge: "FIFA Elite Kategorie"
  },
  pt: {
    back: "← Voltar",
    notFound: "Árbitro Não Encontrado",
    age: "anos",
    country: "País",
    yellowCards: "Média Cartões Amarelos (Por Jogo)",
    redCards: "Média Cartões Vermelhos (Por Jogo)",
    bio: "Perfil e Biografia do Árbitro",
    importantMatches: "Jogos Importantes Dirigidos",
    stats: "Estatísticas de Cartões e Disciplina",
    confederation: "Confederação",
    personalInfo: "Detalhes Pessoais",
    eliteBadge: "Categoria de Elite da FIFA"
  },
  it: {
    back: "← Torna indietro",
    notFound: "Arbitro non trovato",
    age: "anni",
    country: "Paese",
    yellowCards: "Media Cartellini Gialli (Per Partita)",
    redCards: "Media Cartellini Rossi (Per Partita)",
    bio: "Profilo e biografia dell'arbitro",
    importantMatches: "Partite importanti arbitrate",
    stats: "Statistiche cartellini e disciplina",
    confederation: "Confederazione",
    personalInfo: "Dettagli Personali",
    eliteBadge: "Categoria Elite FIFA"
  },
  ko: {
    back: "← 뒤로 가기",
    notFound: "심판을 찾을 수 없음",
    age: "세",
    country: "국가",
    yellowCards: "경기당 평균 옐로우 카드",
    redCards: "경기당 평균 레드 카드",
    bio: "심판 프로필 및 약력",
    importantMatches: "주요 판정 경기",
    stats: "카드 통계 및 필드 규율",
    confederation: "연맹",
    personalInfo: "개인 정보",
    eliteBadge: "FIFA 엘리트 등급"
  },
  ar: {
    back: "← العودة",
    notFound: "الحكم غير موجود",
    age: "سنة",
    country: "البلد",
    yellowCards: "معدل البطاقات الصفراء (لكل مباراة)",
    redCards: "معدل البطاقات الحمراء (لكل مباراة)",
    bio: "ملف الحكم والسيرة الذاتية",
    importantMatches: "المباريات الهامة التي أدارها",
    stats: "إحصائيات البطاقات والانضباط في الملعب",
    confederation: "الاتحاد",
    personalInfo: "تفاصيل شخصية",
    eliteBadge: "فئة النخبة الفيفا"
  }
};

export default function RefereeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  
  const id = params?.id as string;
  const referee = getRefereeById(id);

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  if (!referee) {
    return (
      <PageShell title={dict.notFound}>
        <div className="text-center py-20">
          <p className="text-zinc-400 mb-6 text-lg">
            {id ? `"${id}" ID'li hakem sistemde bulunamadı.` : "Hakem kodu geçersiz."}
          </p>
          <button
            onClick={() => router.push("/predictions")} // Fallback or return to pred/stats
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            {dict.back}
          </button>
        </div>
      </PageShell>
    );
  }

  const refereeCountry = referee.country[activeLang];

  // Helper percentages for glows (assuming max average yellow is 6, max red is 0.5)
  const yellowPercent = Math.min((referee.yellowCardsAvg / 6) * 100, 100);
  const redPercent = Math.min((referee.redCardsAvg / 0.5) * 100, 100);

  return (
    <PageShell title={referee.name} subtitle={dict.eliteBadge}>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 transition-all text-sm"
        >
          {dict.back}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Referee Portrait Card & Bio Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main profile picture */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative w-40 h-40 mb-6 rounded-full overflow-hidden shadow-xl border-4 border-zinc-800/60">
              <img
                src={referee.image}
                alt={referee.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">
              🏆 {dict.eliteBadge}
            </span>

            <h2 className="text-2xl font-black text-white">{referee.name}</h2>
            <span className="text-zinc-500 text-sm mt-1">{refereeCountry}</span>

            <div className="w-full border-t border-zinc-800/80 my-6" />

            {/* General details list */}
            <div className="w-full space-y-4 text-left">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">
                  {dict.country}
                </span>
                <span className="text-base font-bold text-zinc-200 mt-0.5 block">
                  {refereeCountry}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">
                  {dict.personalInfo}
                </span>
                <span className="text-base font-bold text-zinc-200 mt-0.5 block">
                  {referee.age} {dict.age}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider block">
                  {dict.confederation}
                </span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                  UEFA Elite Referee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Cards & Glowing Card Statistics charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card stats gauge panel */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              📊 {dict.stats}
            </h3>

            <div className="space-y-6">
              {/* Yellow Card Avg */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="w-3 h-4 bg-yellow-400 rounded-sm border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] flex-shrink-0" />
                    {dict.yellowCards}
                  </span>
                  <span className="text-lg font-black text-yellow-400">
                    {referee.yellowCardsAvg}
                  </span>
                </div>
                
                {/* Custom glowing yellow bar meter */}
                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    style={{ width: `${yellowPercent}%` }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                  />
                </div>
              </div>

              {/* Red Card Avg */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="w-3 h-4 bg-red-600 rounded-sm border border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)] flex-shrink-0" />
                    {dict.redCards}
                  </span>
                  <span className="text-lg font-black text-red-500">
                    {referee.redCardsAvg}
                  </span>
                </div>
                
                {/* Custom glowing red bar meter */}
                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    style={{ width: `${redPercent}%` }}
                    className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.8)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biography details */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              📝 {dict.bio}
            </h3>
            <p className="text-zinc-300 leading-relaxed text-base">
              {referee.bio[activeLang]}
            </p>
          </div>

          {/* Important Matches Timetable */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              ⚽ {dict.importantMatches}
            </h3>

            <div className="space-y-4">
              {referee.importantMatches[activeLang].map((matchStr, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {i + 1}
                  </div>
                  
                  <span className="text-zinc-200 text-sm font-medium">
                    {matchStr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
