"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Newspaper,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Globe,
  ChevronDown,
  X,
  Cpu,
  Microscope,
  Stethoscope,
  Leaf,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  source: string;
  category: string;
  link: string;
  published_at: string;
}

// Client-side HTML tag stripper helper
function stripHtmlTags(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 9-Language UI Dictionary for NewsGlo
const UI_TEXT: Record<string, Record<string, string>> = {
  tr: {
    portalTitle: "NewsGlo",
    portalSubtitle: "Matematiğin bir şeyi yoktur; her şeyin bir matematiği vardır. — Bilim, Teknoloji, Sağlık, Çevre ve Küresel Akış",
    searchPlaceholder: "NewsGlo haber başlığı veya kelime ara...",
    allNews: "Tüm Haberler",
    science: "Bilim & Uzay",
    tech: "Teknoloji & AI",
    health: "Sağlık & Tıp",
    env: "Çevre & İklim",
    economy: "Ekonomi",
    loadMore: "Daha Fazla Haber Yükle",
    loading: "Yükleniyor...",
    noNewsTitle: "Haber Bulunamadı",
    noNewsSub: "Seçtiğiniz filtreye uygun haber bulunamadı veya henüz güncellenmedi.",
    inspect: "İncele",
    readSource: "Kaynakta Oku (Orijinal Habere Git)",
    source: "Kaynak",
    testModeTitle: "LOCAL TEST & PREVIEW MODU",
    testModeSub: "NewsGlo akış robotu ve tasarım sadece test alanınızda açıktır. Canlı ortamda yayında değildir 🔒",
    notLive: "Canlıya Alınmadı",
    justNow: "Az önce",
    minAgo: "dk önce",
    hoursAgo: "saat önce",
    daysAgo: "gün önce",
    redirectTitle: "Harici Kaynak Yönlendirme Uyarısı",
    redirectMsg: "Statmatik platformundan ayrılıyorsunuz. Haberin yayıncısı olan resmi web sitesine yönlendirileceksiniz. Devam etmek istiyor musunuz?",
    cancel: "İptal",
    proceed: "Evet, Kaynağa Git",
  },
  en: {
    portalTitle: "NewsGlo",
    portalSubtitle: "Mathematics doesn't have a thing; everything has its mathematics. — Science, Tech, Health & Global Stream",
    searchPlaceholder: "Search NewsGlo headlines or keywords...",
    allNews: "All News",
    science: "Science & Space",
    tech: "Technology & AI",
    health: "Health & Medicine",
    env: "Environment & Climate",
    economy: "Economy",
    loadMore: "Load More News",
    loading: "Loading...",
    noNewsTitle: "No News Found",
    noNewsSub: "No news found matching your query or filter.",
    inspect: "Read Summary",
    readSource: "Read on Source (Open Original)",
    source: "Source",
    testModeTitle: "LOCAL TEST & PREVIEW MODE",
    testModeSub: "NewsGlo engine & portal are active in test mode only. Not published live 🔒",
    notLive: "Not Live",
    justNow: "Just now",
    minAgo: "m ago",
    hoursAgo: "h ago",
    daysAgo: "d ago",
    redirectTitle: "External Site Redirection Notice",
    redirectMsg: "You are leaving the Statmatik platform. You will be redirected to the official publisher's website. Do you wish to continue?",
    cancel: "Cancel",
    proceed: "Yes, Open Source",
  },
  de: {
    portalTitle: "NewsGlo",
    portalSubtitle: "Mathematik hat kein Ding; alles hat seine Mathematik. — Wissenschaft, Technik, Gesundheit & globaler Stream",
    searchPlaceholder: "Schlagzeilen auf NewsGlo suchen...",
    allNews: "Alle Nachrichten",
    science: "Wissenschaft & Weltraum",
    tech: "Technologie & KI",
    health: "Gesundheit & Medizin",
    env: "Umwelt & Klima",
    economy: "Wirtschaft",
    loadMore: "Mehr Nachrichten laden",
    loading: "Wird geladen...",
    noNewsTitle: "Keine Nachrichten gefunden",
    noNewsSub: "Keine Nachrichten gefunden, die Ihrem Filter entsprechen.",
    inspect: "Zusammenfassung",
    readSource: "Auf der Quelle lesen (Original öffnen)",
    source: "Quelle",
    testModeTitle: "LOKALER TEST- UND VORSCHAUMODUS",
    testModeSub: "Die Nachrichten-Engine ist nur im Testmodus aktiv 🔒",
    notLive: "Nicht live",
    justNow: "Gerade eben",
    minAgo: "Min. her",
    hoursAgo: "Std. her",
    daysAgo: "Tage her",
    redirectTitle: "Hinweis zur Weiterleitung auf externe Website",
    redirectMsg: "Sie verlassen die Statmatik-Plattform. Sie werden zur offiziellen Website des Herausgebers weitergeleitet. Möchten Sie fortfahren?",
    cancel: "Abbrechen",
    proceed: "Ja, Quelle öffnen",
  },
  fr: {
    portalTitle: "NewsGlo",
    portalSubtitle: "Les mathématiques n'ont pas de chose; tout a sa mathématique. — Science, Technologie & Flux Mondial",
    searchPlaceholder: "Rechercher des titres sur NewsGlo...",
    allNews: "Toutes les Nouvelles",
    science: "Science & Espace",
    tech: "Technologie & IA",
    health: "Santé & Médecine",
    env: "Environnement & Climat",
    economy: "Économie",
    loadMore: "Charger plus d'actualités",
    loading: "Chargement...",
    noNewsTitle: "Aucune actualité trouvée",
    noNewsSub: "Aucune actualité ne correspond à votre filtre.",
    inspect: "Consulter",
    readSource: "Lire sur la source (Ouvrir l'original)",
    source: "Source",
    testModeTitle: "MODE TEST & APERÇU LOCAL",
    testModeSub: "NewsGlo est actif en mode test uniquement 🔒",
    notLive: "Non publié",
    justNow: "À l'instant",
    minAgo: "min",
    hoursAgo: "h",
    daysAgo: "j",
    redirectTitle: "Avis de rédirection vers un site externe",
    redirectMsg: "Vous quittez la plateforme Statmatik. Vous serez réorienté vers le site web officiel de l'éditeur. Voulez-vous continuer ?",
    cancel: "Annuler",
    proceed: "Oui, ouvrir la source",
  },
  es: {
    portalTitle: "NewsGlo",
    portalSubtitle: "La matemática no tiene una cosa; todo tiene su matemática. — Ciencia, Tecnología & Flujo Global",
    searchPlaceholder: "Buscar titulares en NewsGlo...",
    allNews: "Todas las Noticias",
    science: "Ciencia y Espacio",
    tech: "Tecnología e IA",
    health: "Salud y Medicina",
    env: "Medio Ambiente y Clima",
    economy: "Economía",
    loadMore: "Cargar más noticias",
    loading: "Cargando...",
    noNewsTitle: "No se encontraron noticias",
    noNewsSub: "No hay noticias que coincidan con su búsqueda.",
    inspect: "Leer resumen",
    readSource: "Leer en la fuente (Abrir original)",
    source: "Fuente",
    testModeTitle: "MODO DE PRUEBA Y VISTA PREVIA LOCAL",
    testModeSub: "El motor NewsGlo está activo solo en modo de prueba 🔒",
    notLive: "No activo",
    justNow: "Justo ahora",
    minAgo: "m",
    hoursAgo: "h",
    daysAgo: "d",
    redirectTitle: "Aviso de redirección a sitio externo",
    redirectMsg: "Está saliendo de la plataforma Statmatik. Serás redirigido al sitio web oficial del editor. ¿Deseas continuar?",
    cancel: "Cancelar",
    proceed: "Sí, ir a la fuente",
  },
  it: {
    portalTitle: "NewsGlo",
    portalSubtitle: "La matematica non ha una cosa; ogni cosa ha la sua matematica. — Scienza, Tecnologia & Flusso Globale",
    searchPlaceholder: "Cerca titoli su NewsGlo...",
    allNews: "Tutte le Notizie",
    science: "Scienza e Spazio",
    tech: "Tecnologia e IA",
    health: "Salute e Medicina",
    env: "Ambiente e Clima",
    economy: "Economia",
    loadMore: "Carica altre notizie",
    loading: "Caricamento...",
    noNewsTitle: "Nessuna notizia trovata",
    noNewsSub: "Nessuna notizia corrisponde al tuo filtro.",
    inspect: "Leggi sintesi",
    readSource: "Leggi sulla fonte (Apri originale)",
    source: "Fonte",
    testModeTitle: "MODALITÀ TEST E ANTEPRIMA LOCALE",
    testModeSub: "Il motore NewsGlo è attivo solo in modalità test 🔒",
    notLive: "Non in onda",
    justNow: "Proprio ora",
    minAgo: "m fa",
    hoursAgo: "h fa",
    daysAgo: "g fa",
    redirectTitle: "Avviso di reindirizzamento a sito esterno",
    redirectMsg: "Stai uscendo dalla piattaforma Statmatik. Verrai reindirizzato al sito web ufficiale dell'editore. Desideri proseguire?",
    cancel: "Annulla",
    proceed: "Sì, vai alla fonte",
  },
  pt: {
    portalTitle: "NewsGlo",
    portalSubtitle: "A matemática não tem uma coisa; tudo tem sua matemática. — Ciência, Tecnologia & Fluxo Global",
    searchPlaceholder: "Buscar manchetes no NewsGlo...",
    allNews: "Todas as Notícias",
    science: "Ciência e Espaço",
    tech: "Tecnologia e IA",
    health: "Saúde e Medicina",
    env: "Meio Ambiente e Clima",
    economy: "Economia",
    loadMore: "Carregar mais notícias",
    loading: "Carregando...",
    noNewsTitle: "Nenhuma notícia encontrada",
    noNewsSub: "Nenhuma notícia corresponde ao seu filtro.",
    inspect: "Ler resumo",
    readSource: "Ler na fonte (Abrir original)",
    source: "Fonte",
    testModeTitle: "MODO DE TESTE E PRÉ-VIZUALIZAÇÃO LOCAL",
    testModeSub: "O motor NewsGlo está ativo apenas em modo de teste 🔒",
    notLive: "Não ao vivo",
    justNow: "Agora mesmo",
    minAgo: "m atrás",
    hoursAgo: "h atrás",
    daysAgo: "d atrás",
    redirectTitle: "Aviso de redirecionamento para site externo",
    redirectMsg: "Você está saindo da plataforma Statmatik. Você será redirecionado para o site oficial do editor. Deseja continuar?",
    cancel: "Cancelar",
    proceed: "Sim, ir para a fonte",
  },
  ar: {
    portalTitle: "NewsGlo",
    portalSubtitle: "لا تملك الرياضيات شيئاً؛ كل شيء له رياضيات. — العلوم، التكنولوجيا والتدفق العالمي",
    searchPlaceholder: "ابحث في عناوين NewsGlo...",
    allNews: "جميع الأخبار",
    science: "العلوم والفضاء",
    tech: "التكنولوجيا والذكاء الاصطناعي",
    health: "الصحة والطب",
    env: "البيئة والمناخ",
    economy: "الاقتصاد",
    loadMore: "تحميل المزيد من الأخبار",
    loading: "جاري التحميل...",
    noNewsTitle: "لم يتم العثور على أخبار",
    noNewsSub: "لا توجد أخبار تطابق الفلتر المحدد.",
    inspect: "قراءة الملخص",
    readSource: "قراءة المصدر الأصلي (فتح الرابط)",
    source: "المصدر",
    testModeTitle: "وضع الاختبار والمعاينة المحلي",
    testModeSub: "محرك NewsGlo يعمل في وضع الاختبار المحلي فقط 🔒",
    notLive: "غير مباشر",
    justNow: "الآن",
    minAgo: "دقيقة",
    hoursAgo: "ساعة",
    daysAgo: "يوم",
    redirectTitle: "تنبيه إعادة التوجيه إلى موقع خارجي",
    redirectMsg: "أنت على وشك مغادرة منصة ستاتماتيك والانتقال إلى الموقع الرسمي للناشر الأصلي. هل ترغب في الاستمرار؟",
    cancel: "إلغاء",
    proceed: "نعم، الذهاب إلى المصدر",
  },
  ko: {
    portalTitle: "NewsGlo",
    portalSubtitle: "수학에는 특정 대상이 없습니다; 모든 것에는 수학이 있습니다. — 과학, 기술, 건강 및 글로벌 스트림",
    searchPlaceholder: "NewsGlo 헤드라인 또는 키워드 검색...",
    allNews: "전체 뉴스",
    science: "과학 및 우주",
    tech: "기술 및 AI",
    health: "건강 및 의학",
    env: "환경 및 기후",
    economy: "경제",
    loadMore: "뉴스 더 불러오기",
    loading: "로딩 중...",
    noNewsTitle: "뉴스를 찾을 수 없습니다",
    noNewsSub: "검색 조건에 맞는 뉴스가 없습니다.",
    inspect: "요약 보기",
    readSource: "원문 출처 보기 (원본 열기)",
    source: "출처",
    testModeTitle: "로컬 테스트 및 미리보기 모드",
    testModeSub: "NewsGlo 엔진은 로컬 테스트 모드에서만 활성화됩니다 🔒",
    notLive: "라이브 미적용",
    justNow: "방금 전",
    minAgo: "분 전",
    hoursAgo: "시간 전",
    daysAgo: "일 전",
    redirectTitle: "외부 웹사이트 이동 안내",
    redirectMsg: "스탯매틱 플랫폼을 떠나 언론사 공식 웹사이트로 이동합니다. 계속하시겠습니까?",
    cancel: "취소",
    proceed: "예, 원문 보기",
  },
};

export default function HaberlerPage() {
  const { locale } = useLocale();
  const lang = (locale as string) || "tr";
  const t = UI_TEXT[lang] || UI_TEXT["tr"];

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmRedirectArticle, setConfirmRedirectArticle] = useState<NewsArticle | null>(null);

  // Production Guard: Removed. NewsGlo is now active.
  const isNewsEnabled = true;

  useEffect(() => {
    if (!isNewsEnabled) return;
    fetchNews(1, activeCategory, searchQuery, lang, true);
  }, [activeCategory, lang, isNewsEnabled]);

  const fetchNews = async (
    targetPage: number,
    category: string,
    query: string,
    language: string,
    reset: boolean = false
  ) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = `/api/news?page=${targetPage}&limit=12&category=${category}&lang=${language}&search=${encodeURIComponent(
        query
      )}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.articles) {
        const sanitized = data.articles.map((art: NewsArticle) => ({
          ...art,
          title: stripHtmlTags(art.title),
          snippet: stripHtmlTags(art.snippet),
        }));

        if (reset) {
          setArticles(sanitized);
        } else {
          setArticles((prev) => [...prev, ...sanitized]);
        }
        setHasMore(data.hasMore);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(1, activeCategory, searchQuery, lang, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNews(page + 1, activeCategory, searchQuery, lang, false);
    }
  };

  const handleConfirmRedirect = () => {
    if (confirmRedirectArticle && typeof window !== "undefined") {
      window.open(confirmRedirectArticle.link, "_blank", "noopener,noreferrer");
      setConfirmRedirectArticle(null);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMin < 1) return t.justNow;
    if (diffMin < 60) return `${diffMin} ${t.minAgo}`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t.daysAgo}`;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Science":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Technology":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "Health":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Environment":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Economy":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getCategoryNameLocalized = (category: string) => {
    switch (category) {
      case "Science":
        return t.science;
      case "Technology":
        return t.tech;
      case "Health":
        return t.health;
      case "Environment":
        return t.env;
      case "Economy":
        return t.economy;
      default:
        return category;
    }
  };

  const categoryTabs = [
    { id: "all", label: t.allNews, icon: Globe },
    { id: "Science", label: t.science, icon: Microscope },
    { id: "Technology", label: t.tech, icon: Cpu },
    { id: "Health", label: t.health, icon: Stethoscope },
    { id: "Environment", label: t.env, icon: Leaf },
    { id: "Economy", label: t.economy, icon: TrendingUp },
  ];

  if (!isNewsEnabled) {
    return (
      <div className="min-h-screen bg-[#04080e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-cyan-500/20">
          🔒
        </div>
        <h1 className="text-2xl font-black text-white mb-2">{t.portalTitle} — Yakında!</h1>
        <p className="text-sm text-slate-400 max-w-md mb-6">{t.testModeSub}</p>
        <a
          href="/"
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04080e] text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glows */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Portal Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Newspaper className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {t.portalTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">{t.portalSubtitle}</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Category Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categoryTabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* News Grid (12 Items per Page) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-12 bg-slate-800/60 rounded w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">{t.noNewsTitle}</h3>
            <p className="text-xs text-slate-400">{t.noNewsSub}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {articles.map((article) => {
                const isInternal = article.link && article.link.includes("statmatik.com");
                const isJustAnnouncement = !article.link || article.link === "https://statmatik.com" || article.link === "https://news.statmatik.com" || article.link === "https://statmatik.com/";
                const isClickable = !isJustAnnouncement;

                return (
                <div
                  key={article.id}
                  onClick={() => {
                    if (!isClickable) return;
                    if (isInternal) {
                      window.location.href = article.link;
                    } else {
                      setConfirmRedirectArticle(article);
                    }
                  }}
                  className={`bg-[#060b14] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between group ${
                    isClickable
                      ? "hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getCategoryBadgeColor(
                          article.category
                        )}`}
                      >
                        {getCategoryNameLocalized(article.category)}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(article.published_at) > new Date() ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            📌 {currentLang === 'tr' ? 'Sabitlendi' : 'Pinned'}
                          </span>
                        ) : (
                          formatRelativeTime(article.published_at)
                        )}
                      </div>
                    </div>

                    {/* Title (HTML Sanitized) */}
                    <h3 className={`text-sm font-black text-slate-100 mb-2 leading-snug line-clamp-2 ${
                      isClickable ? "group-hover:text-cyan-400 transition-colors" : ""
                    }`}>
                      {article.title}
                    </h3>

                    {/* Snippet Summary (HTML Sanitized) */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal">
                      {article.snippet}
                    </p>
                  </div>

                  {/* Footer Source & Read Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-500" />
                      {article.source || "NewsGlo"}
                    </span>
                    {isClickable && (
                      <span className="text-xs text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {t.inspect} <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-xs font-black text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {t.loadMore}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Single Unified 1-Click News Summary & External Redirect Confirmation Modal */}
        {confirmRedirectArticle && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#080d1a] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setConfirmRedirectArticle(null)}
                className="absolute top-4 right-4 p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Category & Time */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getCategoryBadgeColor(
                    confirmRedirectArticle.category
                  )}`}
                >
                  {getCategoryNameLocalized(confirmRedirectArticle.category)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {formatRelativeTime(confirmRedirectArticle.published_at)}
                </span>
              </div>

              {/* News Title */}
              <h2 className="text-base sm:text-lg font-black text-white leading-snug mb-3">
                {confirmRedirectArticle.title}
              </h2>

              {/* Summary Snippet */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-5 max-h-48 overflow-y-auto">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {confirmRedirectArticle.snippet}
                </p>
              </div>

              {/* Legal Redirect Notice Box */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="text-xs font-bold text-amber-300 block mb-0.5">
                    {t.redirectTitle}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {t.redirectMsg}
                  </p>
                  <div className="mt-1 text-[11px] text-slate-400 font-semibold">
                    {t.source}: <span className="text-white">{confirmRedirectArticle.source || "Official Agency"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmRedirectArticle(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmRedirect}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {t.proceed} <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
