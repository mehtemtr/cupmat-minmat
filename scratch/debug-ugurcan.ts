async function test() {
  const url = "https://en.wikipedia.org/wiki/Portugal_national_football_team";
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
    if (rowContent.includes("Ricardo Velho")) {
      console.log(`Row ${rowIndex} contains Ricardo Velho!`);
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        cells.push(cellMatch[1]);
      }
      cells.forEach((c, idx) => {
        console.log(`Cell ${idx}: ${c.replace(/<[^>]*>/g, '').trim()} | HTML: ${c}`);
      });
    }
  }
}

test();





