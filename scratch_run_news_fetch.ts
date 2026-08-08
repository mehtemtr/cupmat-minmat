import { fetchAndStoreNews } from "./lib/news-fetcher";

async function run() {
  console.log("Haber çekimi başlatılıyor...");
  const result = await fetchAndStoreNews();
  console.log("Sonuç:", JSON.stringify(result, null, 2));
}

run().catch(console.error);
