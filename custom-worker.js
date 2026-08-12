import openNextWorker from "./.open-next/worker.js";

export default {
  fetch(request, env, ctx) {
    return openNextWorker.fetch(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    let paths = [];
    
    switch (event.cron) {
      case "0 0 */3 * *":
        paths.push("/api/cron/period-reset");
        break;
      case "*/15 * * * *":
        paths.push("/api/cron/cupmat-fetch");
        break;
      case "*/30 * * * *":
        paths.push("/api/cron/fetch-news");
        break;
      default:
        console.log("Bilinmeyen cron:", event.cron);
        return;
    }

    for (const path of paths) {
      console.log(`Tetikleniyor: ${path}`);
      const request = new Request(`http://localhost${path}`, {
        headers: {
          "Authorization": `Bearer ${env.CRON_SECRET || ""}`
        }
      });
      
      const response = await openNextWorker.fetch(request, env, ctx);
      console.log(`Sonuç (${path}): ${response.status}`);
    }
  }
};
