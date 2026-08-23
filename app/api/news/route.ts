import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchAndStoreNews, cleanText, calculateTitleSimilarity } from "@/lib/news-fetcher";

// Minimum interval between background news fetches (2 hours = 120 minutes)
const LAZY_FETCH_INTERVAL_MS = 2 * 60 * 60 * 1000;

// Track in-memory lock to prevent concurrent triggers in same server instance
let isFetchingNews = false;

// Expanded 9-Language Article Dictionaries (NewsGlo Multilingual Dataset)
const MULTILINGUAL_NEWS_DATASET: Array<{
  id: string;
  category: string;
  source: string;
  link: string;
  published_at: string;
  translations: Record<string, { title: string; snippet: string }>;
}> = [
  {
    id: "newsglo-statmatik-update",
    category: "Technology",
    source: "StatMatik Platform",
    link: "/minmat",
    published_at: new Date().toISOString(),
    translations: {
      tr: {
        title: "StatMatik'ten Büyük Güncelleme: Oyunlarda Yeni Dönem Başladı!",
        snippet: "MinMat ve MinLan büyük bir güncelleme aldı. Menüleri kaldıran yeni 'Tek Ekran' tasarımı ve ekranı aşağı kaydırmanıza gerek bırakmayan akıllı oyun tahtası ile oyunlar artık çok daha akıcı. Yenilenen dengelemelerle daha ileri turlara ulaşın ve yeni rekorlar kırın!"
      },
      en: {
        title: "Major Update from StatMatik: A New Era in Games Begins!",
        snippet: "MinMat and MinLan received a major update! With the new 'Single Screen' design bypassing menus and a smart board that eliminates the need to scroll down, gameplay is smoother than ever. Reach higher rounds and set new records!"
      },
      de: {
        title: "Großes Update von StatMatik: Eine neue Ära beginnt!",
        snippet: "MinMat und MinLan haben ein Update erhalten! Mit dem neuen 'Single Screen'-Design ohne Menüs und einem intelligenten Spielfeld, das lästiges Scrollen überflüssig macht, läuft das Spiel flüssiger denn je. Erreichen Sie höhere Runden!"
      },
      fr: {
        title: "Mise à jour majeure de StatMatik : Une nouvelle ère commence !",
        snippet: "MinMat et MinLan ont reçu une mise à jour ! Avec un design 'Écran Unique' sans menu et un plateau intelligent qui élimine le besoin de faire défiler l'écran, le jeu est plus fluide. Atteignez des niveaux supérieurs et battez des records !"
      },
      es: {
        title: "Gran actualización de StatMatik: ¡Comienza una nueva era!",
        snippet: "¡MinMat y MinLan han recibido una gran actualización! Con un diseño de 'Pantalla Única' sin menús y un tablero inteligente que elimina la necesidad de desplazarse hacia abajo, el juego es más fluido. ¡Alcanza rondas más altas y establece récords!"
      },
      pt: {
        title: "Grande Atualização do StatMatik: Uma Nova Era Começa!",
        snippet: "MinMat e MinLan receberam uma atualização! Com o novo design de 'Tela Única' sem menus e um tabuleiro inteligente que elimina a necessidade de rolar a página, a jogabilidade está mais fluida. Alcance rodadas mais altas e bata novos recordes!"
      },
      it: {
        title: "Grande Aggiornamento da StatMatik: Inizia una Nuova Era!",
        snippet: "MinMat e MinLan hanno ricevuto un aggiornamento! Con il nuovo design 'Schermo Singolo' senza menu e un tabellone intelligente che elimina la necessità di scorrere verso il basso, il gioco è più fluido. Raggiungi round più alti!"
      },
      ar: {
        title: "تحديث كبير من StatMatik: حقبة جديدة في الألعاب تبدأ!",
        snippet: "حصلت MinMat و MinLan على تحديث كبير! مع تصميم 'الشاشة الواحدة' الذي يتخطى القوائم ولوحة ذكية تلغي الحاجة إلى التمرير لأسفل، أصبحت اللعبة أكثر سلاسة. صل إلى جولات أعلى وحقق أرقاماً قياسية جديدة!"
      },
      ko: {
        title: "StatMatik의 대규모 업데이트: 게임의 새로운 시대가 시작됩니다!",
        snippet: "MinMat과 MinLan이 대대적으로 업데이트되었습니다! 메뉴를 생략한 '단일 화면' 디자인과 스크롤할 필요가 없는 스마트 보드 덕분에 게임 플레이가 훨씬 부드러워졌습니다. 더 높은 라운드에 도달하고 새로운 기록을 세우세요!"
      }
    }
  },
  {
    id: "newsglo-1",
    category: "Science",
    source: "NASA / Deep Space Mission",
    link: "https://www.nasa.gov",
    published_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "James Webb Teleskobu Derin Uzayda Su Buharı Demetleri Keşfetti",
        snippet: "Gökbilimciler, James Webb Uzay Teleskobu'nu kullanarak uzak bir ötegezegende yaşamın temel yapı taşlarından su buharı tespit etti.",
      },
      en: {
        title: "James Webb Telescope Discovers Water Vapor Plumes in Deep Space",
        snippet: "Astronomers using the James Webb Space Telescope detected water vapor and atmospheric layers on a distant exoplanet.",
      },
      de: {
        title: "James-Webb-Teleskop entdeckt Wasserdampfwolken im tiefen Weltraum",
        snippet: "Astronomen haben mit dem James-Webb-Weltraumteleskop Wasserdampf und atmosphärische Schichten auf einem fernen Exoplaneten nachgewiesen.",
      },
      fr: {
        title: "Le télescope James Webb découvre des panaches de vapeur d'eau dans l'espace profond",
        snippet: "Les astronomes utilisant le télescope spatial James Webb ont détecté de la vapeur d'eau sur une exoplanète lointaine.",
      },
      es: {
        title: "El telescopio James Webb descubre columnas de vapor de agua en el espacio profundo",
        snippet: "Los astrónomos que utilizan el telescopio espacial James Webb detectaron vapor de agua en un exoplaneta lejano.",
      },
      it: {
        title: "Il telescopio James Webb scopre pennacchi di vapore acqueo nello spazio profondo",
        snippet: "Gli astronomi che utilizzano il telescopio spaziale James Webb hanno rilevato vapore acqueo su un esopianeta lontano.",
      },
      pt: {
        title: "O telescópio James Webb descobre plumas de vapor de água no espaço profundo",
        snippet: "Astrônomos usando o Telescópio Espacial James Webb detectaram vapor de água em um exoplaneta distante.",
      },
      ar: {
        title: "تلسكوب جيمس ويب يكتشف أعمدة من بخار الماء في الفضاء العميق",
        snippet: "رصد علماء الفلك باستخدام تلسكوب جيمس ويب الفضائي بخار الماء وطبقات غلاف جوي على كوكب خارج المجموعة الشمسية.",
      },
      ko: {
        title: "제임스 웹 망원경, 심우주에서 수증기 기둥 발견",
        snippet: "천문학자들은 제임스 웹 우주망원경을 사용하여 먼 외계 행성에서 생명체의 핵심 요소인 수증기와 대기층을 포착했습니다.",
      },
    },
  },
  {
    id: "newsglo-2",
    category: "Technology",
    source: "Global AI Review",
    link: "https://www.reuters.com",
    published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Çin ve ABD Arasında Yapay Zeka Yarışı: Yeni Nesil Model Dengeleri Değiştiriyor",
        snippet: "Yapay zeka alanındaki son teknolojik gelişmeler, küresel yazılım rekabetini yeni bir seviyeye taşıdı.",
      },
      en: {
        title: "AI Race Escalates Between US & China: Next-Gen Models Shift Global Balance",
        snippet: "Recent technological breakthroughs in artificial intelligence are driving global software competition to unprecedented heights.",
      },
      de: {
        title: "KI-Wettlauf zwischen USA & China: Modelle der nächsten Generation verändern das Gleichgewicht",
        snippet: "Jüngste technologische Durchbrüche in der künstlichen Intelligenz heben den globalen Softwarewettbewerb auf ein neues Niveau.",
      },
      fr: {
        title: "La course à l'IA s'intensifie entre les États-Unis et la Chine : les nouveaux modèles redéfinissent la donne",
        snippet: "Les récentes avancées technologiques en intelligence artificielle propulsent la compétition logicielle mondiale à un niveau supérieur.",
      },
      es: {
        title: "La carrera de IA se intensifica entre EE.UU. y China: Nuevos modelos cambian el equilibrio global",
        snippet: "Los avances recientes en inteligencia artificial están llevando la competencia mundial de software a un nivel sin precedentes.",
      },
      it: {
        title: "Corsa all'IA tra USA e Cina: I modelli di nuova generazione cambiano gli equilibri globali",
        snippet: "I recenti sviluppi tecnologici nell'intelligenza artificiale stanno portando la competizione globale sui software a nuovi livelli.",
      },
      pt: {
        title: "Corrida de IA se intensifica entre EUA e China: Novos modelos mudam o equilíbrio global",
        snippet: "Avanços recentes em inteligência artificial estão elevando a competição global de software a patamares inéditos.",
      },
      ar: {
        title: "سباق الذكاء الاصطناعي بين الولايات المتحدة والصين: النماذج الجديدة تعيد توازن القوى العالمية",
        snippet: "تؤدي التطورات التكنولوجية الأخيرة في مجال الذكاء الاصطناعي إلى رفع مستوى المنافسة البرمجية العالمية إلى آفاق غير سبقت.",
      },
      ko: {
        title: "미국-중국 AI 경쟁 심화: 차세대 모델이 글로벌 균형을 변화시키다",
        snippet: "최근 인공지능 분야의 기술적 대도약으로 전 세계 소프트웨어 경쟁이 새로운 차원으로 진입했습니다.",
      },
    },
  },
  {
    id: "newsglo-3",
    category: "Statmatik",
    source: "StatMatik / NewsGlo",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "StatMatik ekosistemi büyüyor: NewsGlo yayında",
        snippet: "MinMat ve diğer StatMatik projelerinin ardından geliştirilen NewsGlo kullanıma açıldı. Platform, farklı ülkelerden güvenilir kaynakları bir araya getirerek teknoloji, bilim, sağlık, ekonomi ve çevre alanlarında güncel haberler sunuyor.",
      },
      en: {
        title: "The StatMatik Ecosystem Grows: NewsGlo Is Live",
        snippet: "Developed following MinMat and other StatMatik projects, NewsGlo is officially launched. The platform aggregates trusted global publishers covering tech, science, health, economy, and environment.",
      },
      de: {
        title: "Das StatMatik-Ökosystem wächst: NewsGlo ist online",
        snippet: "Nach MinMat und anderen StatMatik-Projekten wurde NewsGlo veröffentlicht. Die Plattform bündelt vertrauenswürdige globale Quellen für Technologie, Wissenschaft, Gesundheit, Wirtschaft und Umwelt.",
      },
      fr: {
        title: "L'écosystème StatMatik s'agrandit : NewsGlo est en ligne",
        snippet: "Développé dans la foulée de MinMat et des autres projets StatMatik, NewsGlo est officiellement disponible. La plateforme rassemble des sources fiables mondiales en technologie, science, santé, économie et environnement.",
      },
      es: {
        title: "El ecosistema StatMatik crece: NewsGlo ya está disponible",
        snippet: "Desarrollado tras MinMat y otros proyectos de StatMatik, NewsGlo ha sido lanzado oficialmente. La plataforma reúne fuentes confiables globales en tecnología, ciencia, salud, economía y medio ambiente.",
      },
      it: {
        title: "L'ecosistema StatMatik cresce: NewsGlo è online",
        snippet: "Sviluppato dopo MinMat e gli altri progetti StatMatik, NewsGlo è ora disponibile. La piattaforma raccoglie fonti globali affidabili su tecnologia, scienza, salute, economia e ambiente.",
      },
      pt: {
        title: "O ecossistema StatMatik cresce: NewsGlo está no ar",
        snippet: "Desenvolvido após o MinMat e outros projetos StatMatik, o NewsGlo está oficialmente disponível. A plataforma reúne fontes confiáveis globais de tecnologia, ciência, saúde, economia e meio ambiente.",
      },
      ar: {
        title: "منظومة StatMatik تتوسع: إطلاق منصة NewsGlo الإخبارية",
        snippet: "تم إطلاق منصة NewsGlo رسميًا بعد نجاح MinMat ومشاريع StatMatik الأخرى. تجمع المنصة مصادر عالمية موثوقة في مجالات التكنولوجيا والعلوم والصحة والاقتصاد والبيئة.",
      },
      ko: {
        title: "StatMatik 생태계 확장: NewsGlo 공식 오픈",
        snippet: "MinMat 및 기타 StatMatik 프로젝트에 이어 개발된 NewsGlo가 공식 출시되었습니다. 이 플랫폼은 기술, 과학, 건강, 경제, 환경 분야의 전 세계 신뢰할 수 있는 출처를 제공합니다.",
      },
    },
  },
];

// Lazy fetch has been disabled to prevent Vercel CPU limit issues.
// Cloudflare Workers (custom-worker.js) now handles automated fetching.

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' 
      },
      // Ensure we don't cache translation errors
      cache: "no-store" 
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join("");
  } catch (e) {
    return text;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const category = searchParams.get("category") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const lang = searchParams.get("lang") || "tr";

    // Lazy fetch is handled by Cloudflare Workers cron now.

    const offset = (page - 1) * limit;

    // 1. Try querying Supabase live DB news feed safely
    try {
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (key && key.includes(".")) {
          // Cloudflare environment base64 decode safe
          const b64 = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = Buffer.from(b64, "base64").toString("utf8");
          const claims = JSON.parse(payload);
          const supabaseUrl = `https://${claims.ref}.supabase.co`;

          let fetchUrl = `${supabaseUrl}/rest/v1/news?select=id,title,snippet,source,category,link,published_at,featured_order&order=featured_order.asc.nullslast,published_at.desc&limit=${limit * 2}&offset=${offset}`;
          if (category !== "all") fetchUrl += `&category=eq.${encodeURIComponent(category)}`;
          if (search) fetchUrl += `&title=ilike.*${encodeURIComponent(search)}*`;

          const res = await fetch(fetchUrl, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            cache: "no-store"
          });
          
          if (res.ok) {
            const dbNews = await res.json();
            if (dbNews && dbNews.length > 0) {
              const countRes = await fetch(`${supabaseUrl}/rest/v1/news?select=id&limit=1`, {
                headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" }
              });
              let count = dbNews.length;
              if (countRes.ok) {
                const range = countRes.headers.get("content-range");
                if (range) count = parseInt(range.split("/")[1], 10) || count;
              }
            
            // Ön yüzde tekrar eden haberleri engellemek için benzerlik filtresi (Similarity Filter)
            const uniqueDbNews: any[] = [];
            for (const item of dbNews) {
              let isDuplicate = false;
              for (const existing of uniqueDbNews) {
                if (calculateTitleSimilarity(item.title || "", existing.title || "") >= 0.55) {
                  isDuplicate = true;
                  break;
                }
              }
              if (!isDuplicate) {
                uniqueDbNews.push(item);
              }
            }

            // İstenen limit kadarını alıyoruz
            const paginatedUniqueNews = uniqueDbNews.slice(0, limit);

            const cleanedDbNews = [];
            for (const item of paginatedUniqueNews) {
              const translatedTitle = await translateText(item.title || "", lang);
              const translatedSnippet = await translateText(item.snippet || "", lang);
              cleanedDbNews.push({
                ...item,
                title: cleanText(translatedTitle),
                snippet: cleanText(translatedSnippet),
              });
              // Small delay to prevent Google Translate rate limiting
            }

            // INJECT STATMATIK UPDATE AT THE TOP (IF FIRST PAGE)
            if (page === 1) {
              const statMatikUpdate = MULTILINGUAL_NEWS_DATASET.find(n => n.id === "newsglo-statmatik-update");
              if (statMatikUpdate) {
                const smTrans = statMatikUpdate.translations[lang] || statMatikUpdate.translations["en"];
                cleanedDbNews.unshift({
                  id: statMatikUpdate.id,
                  category: statMatikUpdate.category,
                  source: statMatikUpdate.source,
                  link: statMatikUpdate.link,
                  published_at: statMatikUpdate.published_at,
                  title: smTrans.title,
                  snippet: smTrans.snippet,
                  image_url: null,
                });
              }
            }

            return NextResponse.json({
              success: true,
              articles: cleanedDbNews,
              page,
              limit,
              total: count || cleanedDbNews.length,
              hasMore: offset + cleanedDbNews.length < (count || cleanedDbNews.length),
              isMock: false,
            });
            }
          }
        }
      } catch (dbErr) {
        // Fallback
      }

    // 2. Multilingual Dataset Fallback (100% safe)
    let formattedDataset = MULTILINGUAL_NEWS_DATASET.map((base) => {
      const trans =
        base.translations[lang] ||
        base.translations["en"] ||
        base.translations["tr"] ||
        { title: "NewsGlo", snippet: "" };

      return {
        id: base.id,
        source: base.source,
        category: base.category,
        link: base.link,
        published_at: base.published_at,
        title: cleanText(trans.title || ""),
        snippet: cleanText(trans.snippet || ""),
      };
    });

    if (category !== "all") {
      formattedDataset = formattedDataset.filter(
        (n) => n.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      formattedDataset = formattedDataset.filter(
        (n) => n.title.toLowerCase().includes(search) || n.snippet.toLowerCase().includes(search)
      );
    }

    const paginated = formattedDataset.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      articles: paginated,
      page,
      limit,
      total: formattedDataset.length,
      hasMore: offset + paginated.length < formattedDataset.length,
      isMock: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      articles: [],
      page: 1,
      limit: 12,
      total: 0,
      hasMore: false,
      isMock: true,
    });
  }
}
