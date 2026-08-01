import { supabaseAdmin } from "@/lib/supabase";

export type NewsCategory =
  | "Science"
  | "Technology"
  | "Health"
  | "Environment"
  | "Economy"
  | "General"
  | "Statmatik"
  | "Sports"
  | "Politics";

export interface NewsFetchResult {
  success: boolean;
  countriesScanned: number;
  newsFound: number;
  newsInserted: number;
  newsSkipped: number;
  logs: string[];
  error?: string;
}

/**
 * Publisher Authority & Reliability Ranks
 */
const PUBLISHER_RANKS = [
  {
    keywords: [
      "anadolu ajansı",
      "aa.com.tr",
      "trt",
      "bbc",
      "reuters",
      "bloomberg",
      "dw.com",
      "euronews",
      "afp",
      "ap news",
    ],
    rank: 100,
  },
  {
    keywords: [
      "hürriyet",
      "milliyet",
      "sabah",
      "ntv",
      "habertürk",
      "cumhuriyet",
      "sözcü",
      "dünya",
      "ekonomim",
      "trt haber",
    ],
    rank: 80,
  },
  {
    keywords: [
      "ilke haber",
      "medyaloji",
      "vatan",
      "akşam",
      "star",
      "yeni şafak",
      "gazete duvar",
      "t24",
      "webrazzi",
      "fintechtime",
      "doviz.com",
    ],
    rank: 50,
  },
];

/**
 * Get Publisher Reliability Rank score (0 - 100)
 */
export function getPublisherRank(source: string | null): number {
  if (!source) return 10;
  const srcLower = trLower(source);
  for (const group of PUBLISHER_RANKS) {
    for (const kw of group.keywords) {
      if (srcLower.includes(kw)) {
        return group.rank;
      }
    }
  }
  return 20; // Default rank for niche blogs/aggregators
}

/**
 * Turkish-aware Lowercase Converter
 */
export function trLower(str: string): string {
  return str
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ö/g, "ö")
    .replace(/Ü/g, "ü")
    .replace(/Ş/g, "ş")
    .replace(/Ç/g, "ç")
    .toLowerCase();
}

/**
 * Normalize title for near-duplicate comparison:
 * Removes trailing publisher suffix (" - EmlakDream"), punctuation, and extra whitespace.
 */
export function normalizeTitle(title: string): string {
  if (!title) return "";
  // Strip publisher suffix e.g. " - EmlakDream" or " - turkchem.net"
  let clean = title.replace(/\s*-\s*[^-]+$/, "").trim();
  clean = trLower(clean);
  // Remove non-alphanumeric chars
  clean = clean.replace(/[^\w\sğüşıöç]/g, " ");
  return clean.replace(/\s+/g, " ").trim();
}

/**
 * Extract word tokens from normalized text
 */
function getWordTokens(text: string): Set<string> {
  return new Set(text.split(" ").filter((w) => w.length > 1));
}

/**
 * Extract character trigrams for stem-insensitive matching
 */
function getCharTrigrams(text: string): Set<string> {
  const trigrams = new Set<string>();
  const clean = text.replace(/\s+/g, "");
  for (let i = 0; i <= clean.length - 3; i++) {
    trigrams.add(clean.substring(i, i + 3));
  }
  return trigrams;
}

/**
 * Calculate similarity ratio (0.0 to 1.0) between two headlines
 */
export function calculateTitleSimilarity(title1: string, title2: string): number {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  // 1. Word Token Jaccard & Min Overlap
  const words1 = getWordTokens(norm1);
  const words2 = getWordTokens(norm2);

  let wordIntersect = 0;
  words1.forEach((w) => {
    if (words2.has(w)) wordIntersect++;
  });
  const wordUnion = new Set([...words1, ...words2]).size;
  const wordJaccard = wordUnion > 0 ? wordIntersect / wordUnion : 0;
  const minWordOverlap =
    Math.min(words1.size, words2.size) > 0
      ? wordIntersect / Math.min(words1.size, words2.size)
      : 0;

  // 2. Character Trigram Jaccard
  const tri1 = getCharTrigrams(norm1);
  const tri2 = getCharTrigrams(norm2);

  let triIntersect = 0;
  tri1.forEach((t) => {
    if (tri2.has(t)) triIntersect++;
  });
  const triUnion = new Set([...tri1, ...tri2]).size;
  const triJaccard = triUnion > 0 ? triIntersect / triUnion : 0;

  // Weighted score
  const score = wordJaccard * 0.4 + minWordOverlap * 0.3 + triJaccard * 0.3;
  return score;
}

/**
 * Clean HTML entities from string
 */
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Check if the headline, snippet, or source matches any active database filters (news_filters)
 */
function isFilteredOut(
  title: string,
  snippet: string | null,
  source: string | null,
  sourceFilters: string[],
  keywordFilters: string[]
): boolean {
  const titleLower = title.toLowerCase();
  const sourceLower = (source || "").toLowerCase();
  const snippetLower = (snippet || "").toLowerCase();

  // 1. Check Source Filters (filter_type = 'source')
  for (const sFilter of sourceFilters) {
    if (sourceLower.includes(sFilter)) {
      return true;
    }
  }

  // 2. Check Keyword Filters (filter_type = 'keyword')
  for (const kwFilter of keywordFilters) {
    if (titleLower.includes(kwFilter) || snippetLower.includes(kwFilter) || sourceLower.includes(kwFilter)) {
      return true;
    }
  }

  return false;
}

/**
 * Category Priority Weights:
 * Tier 1 (100): Science, Technology, Health, Environment (Primary Focus)
 * Tier 2 (50) : Economy, General, Statmatik (Secondary / Fallback)
 * Tier 3 (10) : Sports, Politics (Strictly filtered, low priority)
 */
export function getCategoryPriority(category: NewsCategory): number {
  switch (category) {
    case "Science":
    case "Technology":
    case "Health":
    case "Environment":
      return 100;
    case "Economy":
    case "General":
    case "Statmatik":
      return 50;
    case "Sports":
    case "Politics":
      return 10;
    default:
      return 30;
  }
}

/**
 * Filter out routine local sports/politics news.
 * Only allow sports or politics through if they contain major global breakthrough/impact keywords.
 */
export function isRoutineLowPriorityNews(
  category: NewsCategory,
  title: string,
  snippet: string | null
): boolean {
  if (category !== "Sports" && category !== "Politics") {
    return false;
  }

  const text = `${title} ${snippet || ""}`.toLowerCase();

  const majorImpactKeywords = [
    "dünya kupası",
    "olimpiyat",
    "dünya şampiyonası",
    "tarihi antlaşma",
    "barış anlaşması",
    "bm genel kurulu",
    "g7 zirvesi",
    "g20 zirvesi",
    "nato zirvesi",
    "iklim zirvesi",
    "uluslararası sözleşme",
    "tarihi zirve",
  ];

  for (const kw of majorImpactKeywords) {
    if (text.includes(kw)) {
      return false; // Major event -> Allow!
    }
  }

  // Filter out routine sports/politics news
  return true;
}

/**
 * Calculate multi-factor selection score:
 * Combines Category Priority (Tier 1 vs 2 vs 3), Publisher Rank, and Recency Bonus (24-48h window).
 */
export function calculateSelectionScore(candidate: {
  category: NewsCategory;
  source: string | null;
  published_at: string;
}): number {
  const catScore = getCategoryPriority(candidate.category) * 100000; // Tier 1: 10M | Tier 2: 5M | Tier 3: 1M
  const pubRank = getPublisherRank(candidate.source) * 100;           // 1,000 - 10,000
  const ageHours = (Date.now() - new Date(candidate.published_at).getTime()) / (60 * 60 * 1000);
  const recencyBonus = Math.max(0, Math.floor((48 - ageHours) * 100)); // Recency decay over 48h

  return catScore + pubRank + recencyBonus;
}

/**
 * Detect news category based on title, snippet & source text.
 */
export function detectCategory(
  title: string,
  snippet: string | null,
  source: string | null
): NewsCategory {
  const text = `${title} ${snippet || ""} ${source || ""}`.toLowerCase();

  // 1. Statmatik
  if (/statmatik|cupmat|minmat|minlan/.test(text)) {
    return "Statmatik";
  }

  // 2. Science (Priority Tier 1)
  if (
    /bilim|araştırma|keşif|fizik|kimya|biyoloji|genetik|akademik|makale|laboratuvar|nasa|esa\b|science|uzay teleskobu|bilim insanı|bilim insanları|astronomi|nöroloji|kuantum|arkeoloji|biyoteknoloji/.test(
      text
    )
  ) {
    return "Science";
  }

  // 3. Technology (Priority Tier 1)
  if (
    /teknoloji|yazılım|yapay zeka|ai\b|openai|dijital|siber|uzay|robot|çip|chip|internet|uygulama|mobil|cyber|tech\b|software|otomasyon|bilişim|yarı iletken|kodlama|siber güvenlik|donanım|algoritma/.test(
      text
    )
  ) {
    return "Technology";
  }

  // 4. Health (Priority Tier 1)
  if (
    /sağlık|hastalık|tıp\b|hastane|doktor|sağlık bakanlığı|aşı\b|tedavi|ilaç|virüs|salgın|kanser|ameliyat|beslenme|obezite|diyabet|bulaşıcı|gen tedavisi|klinik|terapi|organ nakli/.test(
      text
    )
  ) {
    return "Health";
  }

  // 5. Environment (Priority Tier 1)
  if (
    /çevre|iklim|doğa\b|sıcaklık|küresel ısınma|yenilenebilir|yeşil enerji|karbon|emisyon|deprem|afet|orman|yangın|kuraklık|deniz|hava\b|hazar|yeşil ekonomi|atık|geri dönüşüm|ekoloji|biyoçeşitlilik|güneş paneli|rüzgar santrali/.test(
      text
    )
  ) {
    return "Environment";
  }

  // 6. Economy (Priority Tier 2)
  if (
    /ekonomi|büyüme|enflasyon|faiz|merkez bankası|dolar|euro|borsa|hisse|piyasa|ticaret|ihracat|ithalat|vergi|bütçe|finans|banka|yatırım|kredi|hasılat|ekonomim|döviz|fintech|gdp|portföy/.test(
      text
    )
  ) {
    return "Economy";
  }

  // 7. Sports (Priority Tier 3 - Filtered)
  if (
    /spor|futbol|basketbol|voleybol|maç\b|derbi|lig\b|şampiyonluk|transfer|gol\b|kulüp|stadyum|antrenör|teknik direktör|fenerbahçe|galatasaray|beşiktaş|trabzonspor|nba|uefa|fifa|skor|puan durumu/.test(
      text
    )
  ) {
    return "Sports";
  }

  // 8. Politics (Priority Tier 3 - Filtered)
  if (
    /siyaset|politika|seçim|parti\b|hükümet|cumhurbaşkanı|başbakan|bakan\b|parlamento|meclis|milletvekili|muhalefet|dışişleri|büyükelçi|yasa tasarısı|diplomasi/.test(
      text
    )
  ) {
    return "Politics";
  }

  // Fallback to General
  return "General";
}

/**
 * Deduplicate news candidates using Near-Duplicate Detection (>= 60% similarity threshold).
 * When near-duplicates are found, keeps the candidate with higher publisher authority rank.
 */
function deduplicateNearDuplicates<
  T extends { title: string; source: string | null; published_at: string }
>(candidates: T[], existingDbTitles: Array<{ title: string; source: string | null }>): T[] {
  const SIMILARITY_THRESHOLD = 0.6; // 60% similarity threshold for near-duplicates
  const uniqueItems: T[] = [];

  for (const candidate of candidates) {
    // 1. Check against existing items in database
    let isNearDuplicateOfDb = false;
    for (const dbItem of existingDbTitles) {
      const sim = calculateTitleSimilarity(candidate.title, dbItem.title);
      if (sim >= SIMILARITY_THRESHOLD) {
        isNearDuplicateOfDb = true;
        break;
      }
    }
    if (isNearDuplicateOfDb) continue;

    // 2. Check against already selected items in the current batch
    let duplicateIndex = -1;
    for (let i = 0; i < uniqueItems.length; i++) {
      const sim = calculateTitleSimilarity(candidate.title, uniqueItems[i].title);
      if (sim >= SIMILARITY_THRESHOLD) {
        duplicateIndex = i;
        break;
      }
    }

    if (duplicateIndex === -1) {
      uniqueItems.push(candidate);
    } else {
      // Near-duplicate found in current batch! Keep the higher authority publisher.
      const existingCandidate = uniqueItems[duplicateIndex];
      const rankExisting = getPublisherRank(existingCandidate.source);
      const rankCandidate = getPublisherRank(candidate.source);

      if (rankCandidate > rankExisting) {
        // Replace with higher authority publisher
        uniqueItems[duplicateIndex] = candidate;
      }
    }
  }

  return uniqueItems;
}

/**
 * Background News Fetcher Engine (Database-Driven Filters + Near-Duplicate Prevention)
 */
export async function fetchAndStoreNews(): Promise<NewsFetchResult> {
  const logs: string[] = [];
  let totalScanned = 0;
  let totalFound = 0;
  let totalInserted = 0;
  let totalSkipped = 0;

  try {
    logs.push("[NewsFetcher] Starting collection with Near-Duplicate Prevention...");

    // 1. Fetch active database filters from news_filters table (enabled = true)
    const { data: dbFilters, error: filterError } = await supabaseAdmin
      .from("news_filters")
      .select("filter_type, filter_value")
      .eq("enabled", true);

    if (filterError) {
      logs.push(`[NewsFetcher] Warning: Failed to query news_filters table: ${filterError.message}`);
    }

    const sourceFilters: string[] = [];
    const keywordFilters: string[] = [];

    if (dbFilters && dbFilters.length > 0) {
      dbFilters.forEach((f) => {
        const val = (f.filter_value || "").toLowerCase().trim();
        if (val) {
          if (f.filter_type === "source") {
            sourceFilters.push(val);
          } else if (f.filter_type === "keyword") {
            keywordFilters.push(val);
          }
        }
      });
    }

    logs.push(
      `[NewsFetcher] Loaded ${sourceFilters.length} source filter(s) and ${keywordFilters.length} keyword filter(s) from news_filters table.`
    );

    // 2. Fetch active countries where news_enabled = true
    const { data: activeCountries, error: countryError } = await supabaseAdmin
      .from("countries")
      .select("id, name_tr, short_name_tr, name_en, short_name_en, iso2")
      .eq("news_enabled", true);

    if (countryError) {
      throw new Error(`Failed to fetch active countries: ${countryError.message}`);
    }

    if (!activeCountries || activeCountries.length === 0) {
      const msg = "No countries found with news_enabled = true.";
      logs.push(`[NewsFetcher] ${msg}`);

      await supabaseAdmin.from("news_fetch_logs").insert({
        countries_scanned: 0,
        news_found: 0,
        news_inserted: 0,
        news_skipped: 0,
        status: "success",
        error_message: msg,
      });

      return {
        success: true,
        countriesScanned: 0,
        newsFound: 0,
        newsInserted: 0,
        newsSkipped: 0,
        logs,
      };
    }

    totalScanned = activeCountries.length;
    logs.push(`[NewsFetcher] Found ${totalScanned} active country/countries for news collection.`);

    // 3. Loop over active countries
    for (const country of activeCountries) {
      const queryTerm = country.short_name_tr || country.name_tr || country.name_en;
      const searchQuery = `"${queryTerm}" (bilim OR teknoloji OR "yapay zeka" OR sağlık OR çevre OR iklim OR keşif OR ekonomi OR yenilik -futbol -derbi -transfer -lig)`;
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=tr&gl=TR&ceid=TR:tr`;

      logs.push(`[NewsFetcher] Fetching news for '${queryTerm}'...`);

      // Fetch recent existing titles from DB for this country to prevent near-duplicates
      const { data: existingDbItems } = await supabaseAdmin
        .from("news")
        .select("title, source")
        .eq("country_id", country.id)
        .order("published_at", { ascending: false })
        .limit(100);

      const existingDbTitles = existingDbItems || [];

      try {
        const res = await fetch(rssUrl);
        if (!res.ok) {
          logs.push(`[NewsFetcher] Warning: Failed RSS fetch for '${queryTerm}' (${res.status})`);
          continue;
        }

        const xmlText = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        const rawCandidates: Array<{
          country_id: string;
          category: NewsCategory;
          title: string;
          link: string;
          source: string | null;
          snippet: string | null;
          published_at: string;
        }> = [];

        while ((match = itemRegex.exec(xmlText)) !== null) {
          const itemXml = match[1];
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
          const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);
          const descriptionMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

          const rawTitle = titleMatch ? titleMatch[1] : "";
          const rawLink = linkMatch ? linkMatch[1] : "";
          const rawPubDate = pubDateMatch ? pubDateMatch[1] : "";
          const rawSource = sourceMatch ? sourceMatch[1] : "";
          const rawSnippet = descriptionMatch ? descriptionMatch[1] : "";

          const title = cleanText(rawTitle);
          const link = cleanText(rawLink);
          const source = cleanText(rawSource) || null;
          const snippet = cleanText(rawSnippet) || null;

          if (title && link) {
            // Check 48-hour published_at cutoff limit (24-48h freshness window)
            const nowMs = Date.now();
            const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
            const pubTime = rawPubDate ? Date.parse(rawPubDate) : nowMs;

            // Skip invalid pubDate or news older than 48 hours
            if (isNaN(pubTime) || (nowMs - pubTime) > FORTY_EIGHT_HOURS_MS) {
              continue;
            }

            // Apply database-driven filter check from news_filters table
            const rejectedByDbFilter = isFilteredOut(
              title,
              snippet,
              source,
              sourceFilters,
              keywordFilters
            );

            if (!rejectedByDbFilter) {
              const category = detectCategory(title, snippet, source);

              // Filter out routine local sports/politics news
              if (isRoutineLowPriorityNews(category, title, snippet)) {
                continue;
              }

              const published_at = new Date(pubTime).toISOString();

              rawCandidates.push({
                country_id: country.id,
                category,
                title,
                link,
                source,
                snippet,
                published_at,
              });
            }
          }
        }

        // Sort candidates by Selection Score (Category Tier 1 > Tier 2 > Tier 3, Publisher Rank, Recency)
        rawCandidates.sort((a, b) => calculateSelectionScore(b) - calculateSelectionScore(a));

        // Apply Near-Duplicate Deduplication Engine (keeps higher authority publishers)
        const uniqueCandidates = deduplicateNearDuplicates(rawCandidates, existingDbTitles);

        // Limit to top 10 prioritized items per country per run
        const qualityItems = uniqueCandidates.slice(0, 10);

        const countForCountry = qualityItems.length;
        totalFound += countForCountry;

        if (countForCountry > 0) {
          const { data: insertedData, error: insertError } = await supabaseAdmin
            .from("news")
            .upsert(qualityItems, { onConflict: "link", ignoreDuplicates: true })
            .select("id");

          if (insertError) {
            logs.push(`[NewsFetcher] Upsert error for '${queryTerm}': ${insertError.message}`);
          } else {
            const insertedCount = insertedData ? insertedData.length : 0;
            const skippedCount = countForCountry - insertedCount;

            totalInserted += insertedCount;
            totalSkipped += skippedCount;

            logs.push(
              `[NewsFetcher] '${queryTerm}': ${insertedCount} new inserted, ${skippedCount} duplicates skipped.`
            );
          }
        }
      } catch (err: any) {
        logs.push(`[NewsFetcher] Error processing '${queryTerm}': ${err.message || err}`);
      }
    }

    // 4. Log execution run in news_fetch_logs
    await supabaseAdmin.from("news_fetch_logs").insert({
      countries_scanned: totalScanned,
      news_found: totalFound,
      news_inserted: totalInserted,
      news_skipped: totalSkipped,
      status: "success",
      error_message: null,
    });

    logs.push(
      `[NewsFetcher] Completed run: ${totalScanned} countries scanned, ${totalFound} found, ${totalInserted} inserted, ${totalSkipped} skipped.`
    );

    return {
      success: true,
      countriesScanned: totalScanned,
      newsFound: totalFound,
      newsInserted: totalInserted,
      newsSkipped: totalSkipped,
      logs,
    };
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    logs.push(`[NewsFetcher] FATAL ERROR: ${errorMsg}`);

    await supabaseAdmin.from("news_fetch_logs").insert({
      countries_scanned: totalScanned,
      news_found: totalFound,
      news_inserted: totalInserted,
      news_skipped: totalSkipped,
      status: "error",
      error_message: errorMsg,
    });

    return {
      success: false,
      countriesScanned: totalScanned,
      newsFound: totalFound,
      newsInserted: totalInserted,
      newsSkipped: totalSkipped,
      logs,
      error: errorMsg,
    };
  }
}
