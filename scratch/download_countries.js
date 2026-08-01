const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Fetching country data from restcountries API...");
    const res = await fetch('https://restcountries.com/v3.1/all');
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    const outputPath = path.join(__dirname, 'restcountries_all.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} countries to ${outputPath}`);
  } catch (err) {
    console.error("Error fetching country data:", err);
  }
}

run();
