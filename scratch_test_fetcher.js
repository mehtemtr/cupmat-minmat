const { cleanText, trLower, normalizeTitle, getPublisherRank, detectCategory, isRoutineLowPriorityNews, calculateSelectionScore } = require('./lib/news-fetcher.js');
// Wait, lib/news-fetcher.ts is TypeScript! I can't require it in a JS script easily.
