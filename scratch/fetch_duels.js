async function run() {
  const url = 'http://localhost:3000/api/fantasy/duels?stage=matchday_1';
  console.log(`Sending GET request to ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Response success:", data.success);
    if (data.success) {
      console.log(`Standings count: ${data.standings.length}`);
      console.log(`Duels count: ${data.duels.length}`);
      console.log(`Registered teams count: ${data.registeredTeams.length}`);
      if (data.duels.length > 0) {
        console.log("First 3 duels:");
        data.duels.slice(0, 3).forEach(d => {
          console.log(` - ${d.name1} (${d.score1}) vs ${d.name2} (${d.score2}) -> Result: ${d.result}`);
        });
      }
    } else {
      console.log("Error details:", data);
    }
  } catch (error) {
    console.error("Error calling API:", error);
  }
}

run();
