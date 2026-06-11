async function run() {
  const url = 'http://localhost:3000/api/fantasy/trigger-matchday';
  console.log(`Sending POST request to ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': 'minmat_odul_2026'
      },
      body: JSON.stringify({
        stage: 'matchday_1',
        action: 'all'
      })
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error calling API:", error);
  }
}

run();
