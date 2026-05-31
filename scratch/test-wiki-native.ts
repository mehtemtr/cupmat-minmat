async function testWikiNative() {
  const url = "https://en.wikipedia.org/wiki/Turkey_national_football_team";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    const html = await response.text();
    
    // Find Current_squad
    const headingIndex = html.indexOf('id="Current_squad"');
    if (headingIndex === -1) {
      console.log("Not found.");
      return;
    }
    
    // Find first table after heading
    const tableIndex = html.indexOf('<table', headingIndex);
    if (tableIndex === -1) {
      console.log("No table after heading.");
      return;
    }
    
    const tableEndIndex = html.indexOf('</table>', tableIndex);
    const tableHtml = html.slice(tableIndex, tableEndIndex + 8);
    
    console.log("Found table after Current_squad! Size:", tableHtml.length);
    console.log("First 1500 chars of table HTML:");
    console.log(tableHtml.slice(0, 1500));
    
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

testWikiNative();
