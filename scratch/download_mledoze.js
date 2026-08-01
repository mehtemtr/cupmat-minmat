const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Fetching mledoze countries.json...");
    const res = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    const outputPath = path.join(__dirname, 'mledoze_countries.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} countries to ${outputPath}`);
    
    // Print the first country as a sample
    if (data.length > 0) {
      console.log("First country sample:", JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error("Error fetching mledoze countries:", err);
  }
}

run();
