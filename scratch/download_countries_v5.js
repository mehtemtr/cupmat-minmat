const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Fetching country data from restcountries v5 API with demo token...");
    const res = await fetch('https://api.restcountries.com/countries/v5', {
      headers: {
        'Authorization': 'Bearer rc_live_demo'
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    const outputPath = path.join(__dirname, 'restcountries_all.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length || (data.data ? data.data.length : 'unknown')} countries to ${outputPath}`);
  } catch (err) {
    console.error("Error fetching country data:", err);
  }
}

run();
