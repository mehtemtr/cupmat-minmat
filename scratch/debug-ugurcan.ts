async function test() {
  const url = "https://en.wikipedia.org/wiki/Turkey_national_football_team";
  const res = await fetch(url);
  const html = await res.text();
  const headingIndex = html.indexOf('id="Current_squad"');
  const tableIndex = html.indexOf('<table', headingIndex);
  const tableEndIndex = html.indexOf('</table>', tableIndex);
  const tableHtml = html.slice(tableIndex, tableEndIndex + 8);
  
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g;
  let match;
  let rowIndex = 0;
  while ((match = rowRegex.exec(tableHtml)) !== null) {
    const rowContent = match[1];
    rowIndex++;
    if (rowIndex === 2) { // first player row (Uğurcan)
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cellMatch[1]);
      }
      console.log("Ugurcan row cell 6 raw html:");
      console.log(cells[cells.length - 1]);
      
      const cleanText = (text: string) => {
        return text
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };
      console.log("Cleaned text:", cleanText(cells[cells.length - 1]));
      
      const clubLinks = [...cells[cells.length - 1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)];
      console.log("Matches count:", clubLinks.length);
      clubLinks.forEach((m, idx) => console.log(`Link ${idx}: ${m[1]}`));
    }
  }
}

test();
