const rssUrl = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";

async function test() {
  const res = await fetch(rssUrl);
  const xmlText = await res.text();
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let count = 0;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    count++;
    if (count <= 3) {
      const pubDateMatch = match[1].match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const titleMatch = match[1].match(/<title>([\s\S]*?)<\/title>/);
      const rawPubDate = pubDateMatch ? pubDateMatch[1] : "";
      console.log("Raw date:", rawPubDate, "Parsed diff (hours):", (Date.now() - Date.parse(rawPubDate)) / 3600000);
      
      const text = titleMatch ? titleMatch[1] : "";
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
      const tres = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log("Translate ok?", tres.ok, tres.status);
    }
  }
  console.log("Total items found:", count);
}

test();
