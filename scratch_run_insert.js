const url = "https://ewdfexbuhgtsnsxveobc.supabase.co/rest/v1/news";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE";

async function run() {
  const countryRes = await fetch("https://ewdfexbuhgtsnsxveobc.supabase.co/rest/v1/countries?iso2=eq.TR&select=id", {
    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
  });
  const countries = await countryRes.json();
  const country_id = countries[0] ? countries[0].id : null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      title: "Minlan Çok Yakında Yayında: 9 Dilde Karşılıklı Mücadele Başlıyor!",
      snippet: "Oyunla eğitim ekosistemimiz Statmatik'in en yeni üyesi Minlan, 19 Mart'ta (19.03) kullanıma açılıyor. Artık oyuncular 9 farklı dilde, çapraz ödül sistemiyle karşılıklı kelime ve dil yeteneklerini yarıştırabilecekler.",
      source: "StatMatik",
      category: "Statmatik",
      link: "https://statmatik.com/minlan-19-mart-yayinda",
      published_at: new Date().toISOString(),
      featured_order: 1,
      country_id: country_id
    })
  });
  console.log("Response:", await res.text());
}
run();
