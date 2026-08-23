import { fetchAndStoreDailyMatches } from "./lib/api-football-cupmat";

async function run() {
  const dates = ['2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20'];
  for (const d of dates) {
    console.log(`Fetching for ${d}`);
    const res = await fetchAndStoreDailyMatches(d);
    console.log(res);
  }
}
run();
