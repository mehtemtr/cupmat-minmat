async function run() {
  const adminSecret = 'minmat_odul_2026';
  const url = 'https://statmatik.com/api/cron/sync-api-football';

  console.log("Triggering sync for matchday_1 on production...");
  try {
    const res1 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify({ stage: 'matchday_1' })
    });
    
    if (res1.ok) {
      const data1 = await res1.json();
      console.log("Matchday 1 Sync response:", JSON.stringify(data1, null, 2));
    } else {
      console.error("Matchday 1 Sync failed:", res1.status, await res1.text());
    }
  } catch (err) {
    console.error("Matchday 1 Sync fetch failed:", err);
  }

  console.log("Triggering sync for matchday_2 on production...");
  try {
    const res2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify({ stage: 'matchday_2' })
    });
    
    if (res2.ok) {
      const data2 = await res2.json();
      console.log("Matchday 2 Sync response:", JSON.stringify(data2, null, 2));
    } else {
      console.error("Matchday 2 Sync failed:", res2.status, await res2.text());
    }
  } catch (err) {
    console.error("Matchday 2 Sync fetch failed:", err);
  }
}

run();
