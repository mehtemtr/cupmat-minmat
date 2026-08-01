const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log("Fetching dr5hn countries.json...");
    // Let's try master branch first, then main if it fails
    let url = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json';
    let res = await fetch(url);
    if (!res.ok) {
      console.log("Master branch failed, trying main branch...");
      url = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/main/json/countries.json';
      res = await fetch(url);
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    const outputPath = path.join(__dirname, 'dr5hn_countries.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${data.length} countries to ${outputPath}`);
    
    // Print the first country keys and sample
    if (data.length > 0) {
      console.log("First country sample keys:", Object.keys(data[0]));
      console.log("First country sample translations keys:", data[0].translations ? Object.keys(data[0].translations) : 'none');
      console.log("First country sample details:", {
        name: data[0].name,
        iso2: data[0].iso2,
        iso3: data[0].iso3,
        population: data[0].population,
        emoji: data[0].emoji,
        tr_translation: data[0].translations ? data[0].translations.tr : 'none'
      });
    }
  } catch (err) {
    console.error("Error fetching dr5hn countries:", err);
  }
}

run();
