import Link from "next/link";
import { Metadata } from "next";

// Dictionaries for all 9 supported languages
const translations = {
  tr: {
    title: "MinMat Rekor Paylaşımı — StatMatik",
    headline: "Harika Bir Skor! 🏆",
    congrats: "{name} yeni bir MinMat rekoru kırdı!",
    congratsGuest: "Bir Misafir yeni bir MinMat rekoru kırdı!",
    scoreText: "Puan",
    categoryText: "Kategori",
    playBtn: "Hemen Oyna & Skoru Geç! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Toplama",
      sub: "Çıkarma",
      mul: "Çarpma",
      div: "Bölme",
      mix: "4 İşlem (Karışık)",
    },
  },
  en: {
    title: "MinMat Score Sharing — StatMatik",
    headline: "Awesome Score! 🏆",
    congrats: "{name} broke a new MinMat record!",
    congratsGuest: "A Guest broke a new MinMat record!",
    scoreText: "Score",
    categoryText: "Category",
    playBtn: "Play Now & Beat the Record! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Addition",
      sub: "Subtraction",
      mul: "Multiplication",
      div: "Division",
      mix: "Mixed",
    },
  },
  de: {
    title: "MinMat Ergebnis teilen — StatMatik",
    headline: "Hervorragendes Ergebnis! 🏆",
    congrats: "{name} hat einen neuen MinMat-Rekord aufgestellt!",
    congratsGuest: "Ein Gast hat einen neuen MinMat-Rekord aufgestellt!",
    scoreText: "Punkte",
    categoryText: "Kategorie",
    playBtn: "Jetzt spielen & Rekord schlagen! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Addition",
      sub: "Subtraktion",
      mul: "Multiplikation",
      div: "Division",
      mix: "Gemischt",
    },
  },
  fr: {
    title: "MinMat Partager le score — StatMatik",
    headline: "Score Incroyable ! 🏆",
    congrats: "{name} a battu un nouveau record MinMat !",
    congratsGuest: "Un invité a battu un nouveau record MinMat !",
    scoreText: "Score",
    categoryText: "Catégorie",
    playBtn: "Jouer maintenant & battre le record ! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Addition",
      sub: "Soustraction",
      mul: "Multiplication",
      div: "Division",
      mix: "Mélangé",
    },
  },
  es: {
    title: "MinMat Compartir puntuación — StatMatik",
    headline: "¡Increíble puntuación! 🏆",
    congrats: "¡{name} rompió un nuevo récord de MinMat!",
    congratsGuest: "¡Un invitado rompió un nuevo récord de MinMat!",
    scoreText: "Puntos",
    categoryText: "Categoría",
    playBtn: "¡Juega ahora y supera el récord! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Suma",
      sub: "Resta",
      mul: "Multiplicación",
      div: "División",
      mix: "Mixto",
    },
  },
  pt: {
    title: "MinMat Compartilhar pontuação — StatMatik",
    headline: "Pontuação Incrível! 🏆",
    congrats: "{name} quebrou um novo recorde do MinMat!",
    congratsGuest: "Um convidado quebrou um novo recorde do MinMat!",
    scoreText: "Pontos",
    categoryText: "Categoria",
    playBtn: "Jogar agora e superar o recorde! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Adição",
      sub: "Subtração",
      mul: "Multiplicação",
      div: "Divisão",
      mix: "Misto",
    },
  },
  it: {
    title: "MinMat Condividi punteggio — StatMatik",
    headline: "Punteggio Straordinario! 🏆",
    congrats: "{name} ha stabilito un nuovo record MinMat!",
    congratsGuest: "Un ospite ha stabilito un nuovo record MinMat!",
    scoreText: "Punteggio",
    categoryText: "Categoria",
    playBtn: "Gioca ora e batti il record! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "Addizione",
      sub: "Sottrazione",
      mul: "Moltiplicazione",
      div: "Divisione",
      mix: "Misto",
    },
  },
  ko: {
    title: "MinMat 점수 공유 — StatMatik",
    headline: "놀라운 점수입니다! 🏆",
    congrats: "{name}님이 새로운 MinMat 기록을 경신했습니다!",
    congratsGuest: "게스트가 새로운 MinMat 기록을 경신했습니다!",
    scoreText: "점수",
    categoryText: "카테고리",
    playBtn: "지금 플레이하여 기록을 깨보세요! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "더하기",
      sub: "빼기",
      mul: "곱하기",
      div: "나누기",
      mix: "종합 (사칙연산)",
    },
  },
  ar: {
    title: "مشاركة نتيجة MinMat — StatMatik",
    headline: "نتيجة رائعة! 🏆",
    congrats: "حطم {name} رقمًا قياسيًا جديدًا في MinMat!",
    congratsGuest: "حطم ضيف رقمًا قياسيًا جديدًا في MinMat!",
    scoreText: "النقاط",
    categoryText: "الفئة",
    playBtn: "العب الآن وحطم الرقم القياسي! 🧠",
    footerText: "StatMatik — 2026 World Championship & Math Playground",
    modes: {
      add: "الجمع",
      sub: "الطرح",
      mul: "الضرب",
      div: "القسمة",
      mix: "مختلط (العمليات الأربع)",
    },
  },
};

interface SharePageProps {
  searchParams: Promise<{
    score?: string;
    mode?: string;
    name?: string;
    lang?: string;
  }>;
}

// Generate dynamic metadata for the sharing page
export async function generateMetadata(props: SharePageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const langParam = (searchParams.lang || "tr").toLowerCase();
  const lang = (translations[langParam as keyof typeof translations] ? langParam : "tr") as keyof typeof translations;
  const t = translations[lang];

  const name = searchParams.name || "";
  const score = searchParams.score || "0";
  const mode = (searchParams.mode || "mix") as keyof typeof t.modes;
  const modeText = t.modes[mode] || t.modes.mix;

  const congratMessage = name
    ? t.congrats.replace("{name}", name)
    : t.congratsGuest;

  const description = `${congratMessage} | ${t.scoreText}: ${score} - ${t.categoryText}: ${modeText}.`;

  const ogImageUrl = `/api/og/minmat?score=${score}&mode=${mode}&name=${encodeURIComponent(name)}&lang=${lang}`;

  return {
    title: t.title,
    description: description,
    openGraph: {
      title: t.title,
      description: description,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: t.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage(props: SharePageProps) {
  const searchParams = await props.searchParams;
  const score = searchParams.score || "0";
  const mode = searchParams.mode || "mix";
  const name = searchParams.name || "";
  const langParam = (searchParams.lang || "tr").toLowerCase();
  const lang = (translations[langParam as keyof typeof translations] ? langParam : "tr") as keyof typeof translations;

  const t = translations[lang];
  const modeTr = t.modes[mode as keyof typeof t.modes] || t.modes.mix;

  const congratMessage = name
    ? t.congrats.replace("{name}", name)
    : t.congratsGuest;

  return (
    <div className="min-h-screen bg-[#04080e] text-white flex flex-col justify-between items-center px-4 py-8 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background glowing decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-xl text-center mt-6">
        <Link href="/" className="inline-block">
          <span className="text-2xl md:text-3xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
            STATMATIK
          </span>
        </Link>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center my-auto relative overflow-hidden group">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
        
        {/* Trophy Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-pulse">
          <span className="text-4xl">🏆</span>
        </div>

        {/* Headline */}
        <h2 className="text-emerald-400 font-extrabold text-lg tracking-wide uppercase mb-3">
          {t.headline}
        </h2>

        {/* Message */}
        <p className="text-zinc-300 font-medium text-lg leading-relaxed mb-8 px-2">
          {congratMessage}
        </p>

        {/* Details Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10">
          {/* Category */}
          <div className="bg-zinc-950/50 border border-zinc-800/40 rounded-2xl p-4 flex flex-col justify-center items-center">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
              {t.categoryText}
            </span>
            <span className="text-zinc-200 text-base font-extrabold truncate max-w-full">
              {modeTr}
            </span>
          </div>

          {/* Score */}
          <div className="bg-zinc-950/50 border border-zinc-800/40 rounded-2xl p-4 flex flex-col justify-center items-center">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
              {t.scoreText}
            </span>
            <span className="text-emerald-400 text-2xl font-black drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)]">
              {score}
            </span>
          </div>
        </div>

        {/* Play Button */}
        <Link
          href="/minmat"
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] transition-all duration-200 rounded-2xl text-white font-extrabold text-base md:text-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          {t.playBtn}
        </Link>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center text-zinc-600 text-xs font-semibold mt-6 tracking-wide">
        {t.footerText}
      </footer>
    </div>
  );
}
