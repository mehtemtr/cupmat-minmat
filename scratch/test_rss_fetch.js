const fs = require('fs');

async function run() {
  try {
    const query = "Türkiye futbol haberleri";
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&ceid=TR:tr`;
    console.log("Fetching RSS from:", url);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    console.log(`Fetched RSS text (${text.length} bytes).`);
    
    // Parse items using regex
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      let link = linkMatch ? linkMatch[1].trim() : '';
      let pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : '';
      let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';

      // Unescape HTML entities in title/source
      title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      source = source.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

      // Convert pubDate to ISO UTC string
      const published_at = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();

      if (title && link) {
        items.push({
          title,
          link,
          source,
          published_at
        });
      }
    }

    console.log(`Parsed ${items.length} news items:`);
    console.log(JSON.stringify(items.slice(0, 3), null, 2));

  } catch (err) {
    console.error("RSS fetch error:", err);
  }
}

run();
