import { NextResponse } from "next/server";
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

async function checkAndTriggerLazyFetch() {
  if (isFetchingNews) return;
  try {
    const { data: lastLog } = await supabaseAdmin
      .from("news_fetch_logs")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastFetchTime = lastLog?.created_at ? new Date(lastLog.created_at).getTime() : 0;
    const timeSinceLastFetch = Date.now() - lastFetchTime;

    if (timeSinceLastFetch >= LAZY_FETCH_INTERVAL_MS) {
      isFetchingNews = true;
      fetchAndStoreNews()
        .catch((err) => console.error("[Cloudflare LazyFetch] Error:", err))
        .finally(() => { isFetchingNews = false; });
    }
  } catch (err) {
    // Ignore error
  }
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "tr") return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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

    // Safely trigger background lazy fetch
    checkAndTriggerLazyFetch().catch(() => {});

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

            const cleanedDbNews = await Promise.all(
              paginatedUniqueNews.map(async (item: any) => ({
                ...item,
                title: cleanText(await translateText(item.title || "", lang)),
                snippet: cleanText(await translateText(item.snippet || "", lang)),
              }))
            );

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
