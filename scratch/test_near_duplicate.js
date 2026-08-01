function trLower(str) {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ö/g, 'ö')
    .replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

function normalizeTitle(title) {
  if (!title) return '';
  // Remove publisher suffix e.g. " - EmlakDream" or " - turkchem.net"
  let clean = title.replace(/\s*-\s*[^-]+$/, '').trim();
  clean = trLower(clean);
  // Remove punctuation
  clean = clean.replace(/[^\w\sğüşıöç]/g, ' ');
  // Collapse whitespace
  return clean.replace(/\s+/g, ' ').trim();
}

function getCharTrigrams(text) {
  const trigrams = new Set();
  const clean = text.replace(/\s+/g, '');
  for (let i = 0; i <= clean.length - 3; i++) {
    trigrams.add(clean.substring(i, i + 3));
  }
  return trigrams;
}

function getWordTokens(text) {
  return new Set(text.split(' ').filter(w => w.length > 1));
}

function calculateSimilarity(title1, title2) {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);

  if (norm1 === norm2) return 1.0;

  // 1. Word Token Jaccard
  const words1 = getWordTokens(norm1);
  const words2 = getWordTokens(norm2);

  let wordIntersect = 0;
  words1.forEach(w => { if (words2.has(w)) wordIntersect++; });
  const wordUnion = new Set([...words1, ...words2]).size;
  const wordJaccard = wordUnion > 0 ? wordIntersect / wordUnion : 0;
  const minWordOverlap = Math.min(words1.size, words2.size) > 0 ? wordIntersect / Math.min(words1.size, words2.size) : 0;

  // 2. Char Trigram Jaccard
  const tri1 = getCharTrigrams(norm1);
  const tri2 = getCharTrigrams(norm2);

  let triIntersect = 0;
  tri1.forEach(t => { if (tri2.has(t)) triIntersect++; });
  const triUnion = new Set([...tri1, ...tri2]).size;
  const triJaccard = triUnion > 0 ? triIntersect / triUnion : 0;

  // Combined score (weighted average)
  const score = (wordJaccard * 0.4) + (minWordOverlap * 0.3) + (triJaccard * 0.3);
  return score;
}

const PUBLISHER_RANKS = [
  { keywords: ['anadolu ajansı', 'aa.com.tr', 'trt', 'bbc', 'reuters', 'bloomberg', 'dw.com', 'euronews'], rank: 100 },
  { keywords: ['hürriyet', 'milliyet', 'sabah', 'ntv', 'habertürk', 'cumhuriyet', 'sözcü', 'dünya', 'ekonomim'], rank: 80 },
  { keywords: ['ilke haber', 'medyaloji', 'vatan', 'akşam', 'star', 'yenisafak'], rank: 50 },
];

function getPublisherRank(source) {
  if (!source) return 10;
  const srcLower = trLower(source);
  for (const group of PUBLISHER_RANKS) {
    for (const kw of group.keywords) {
      if (srcLower.includes(kw)) return group.rank;
    }
  }
  return 20; // Default rank for smaller blogs/niche sites
}

// Test on user's exact example:
const t1 = "YEO Teknoloji’den Birleşik Krallık’ta 100 milyon doları aşan güneş enerjisi sözleşmesi.. - EmlakDream";
const s1 = "EmlakDream";

const t2 = "YEO Teknoloji’den Birleşik Krallık’ta 100 Milyon Dolarlık Güneş Enerjisi Projesi - turkchem.net";
const s2 = "turkchem.net";

const t3 = "Japonya Merkez Bankası faizi sabit tuttu - Doviz.com";
const s3 = "Doviz.com";

console.log("Normalized T1:", normalizeTitle(t1));
console.log("Normalized T2:", normalizeTitle(t2));
const sim12 = calculateSimilarity(t1, t2);
console.log(`Similarity (T1 vs T2): ${(sim12 * 100).toFixed(1)}%`);

const sim13 = calculateSimilarity(t1, t3);
console.log(`Similarity (T1 vs T3): ${(sim13 * 100).toFixed(1)}%`);

console.log("Publisher Rank S1 (EmlakDream):", getPublisherRank(s1));
console.log("Publisher Rank S2 (turkchem.net):", getPublisherRank(s2));
