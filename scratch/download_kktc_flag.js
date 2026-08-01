const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const dir = path.join(path.resolve(__dirname, '..'), 'public', 'flags');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const dest = path.join(dir, 'kktc.svg');
    console.log("Fetching KKTC flag from Wikimedia...");
    const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg');
    if (!res.ok) {
      throw new Error(`Failed to fetch flag: ${res.statusText}`);
    }
    const svgText = await res.text();
    fs.writeFileSync(dest, svgText);
    console.log(`Saved KKTC flag to ${dest} (${svgText.length} bytes)`);
  } catch (err) {
    console.error("Error downloading KKTC flag:", err);
  }
}

run();
