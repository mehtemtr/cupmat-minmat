import { cleanText, detectCategory, isRoutineLowPriorityNews } from './lib/news-fetcher';

async function run() {
  const rssUrl = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
  const res = await fetch(rssUrl);
  const xmlText = await res.text();
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  
  let match;
  let count = 0;
  let validCount = 0;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    count++;
    const pubDateMatch = match[1].match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const titleMatch = match[1].match(/<title>([\s\S]*?)<\/title>/);
    const sourceMatch = match[1].match(/<source[^>]*>([\s\S]*?)<\/source>/);
    const descriptionMatch = match[1].match(/<description>([\s\S]*?)<\/description>/);
    
    const rawTitle = titleMatch ? titleMatch[1] : "";
    const rawPubDate = pubDateMatch ? pubDateMatch[1] : "";
    const rawSource = sourceMatch ? sourceMatch[1] : "";
    const rawSnippet = descriptionMatch ? descriptionMatch[1] : "";
    
    const enTitle = cleanText(rawTitle);
    const source = cleanText(rawSource) || null;
    const enSnippet = cleanText(rawSnippet) || null;
    
    const nowMs = Date.now();
    const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
    const pubTime = rawPubDate ? Date.parse(rawPubDate) : nowMs;

    if (isNaN(pubTime) || (nowMs - pubTime) > FORTY_EIGHT_HOURS_MS) {
      continue;
    }
    
    // Test logic: without translation, they are English.
    const title = enTitle; 
    const snippet = enSnippet;
    
    const category = detectCategory(title, snippet, source);
    if (isRoutineLowPriorityNews(category, title, snippet)) {
      continue;
    }
    
    validCount++;
  }
  console.log(`Parsed ${count} items. Valid without translation: ${validCount}`);
}

run().catch(console.error);
