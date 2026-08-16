async function translateText(text, targetLang) {
  if (!text || targetLang === "tr") return text;
  try {
    const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=\${targetLang}&dt=t&q=\${encodeURIComponent(text)}\`;
    console.log("Fetching", url);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log("Not ok:", res.status, res.statusText);
      return text;
    }
    const data = await res.json();
    return data[0].map(item => item[0]).join("");
  } catch (e) {
    console.log("Error:", e);
    return text;
  }
}

async function run() {
  const result = await translateText("Toronto Star'a göre Ontario'da yeni gelişmeler yaşandı.", "en");
  console.log("Result:", result);
}
run();
