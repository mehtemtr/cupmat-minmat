const fs = require('fs');

function cleanHtml(filePath, outPath) {
  if (!fs.existsSync(filePath)) {
    console.log("File not found: " + filePath);
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  // Simple regex to strip HTML tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/\s+/g, ' ');
  // Unescape HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"');
  
  fs.writeFileSync(outPath, text, 'utf8');
  console.log(`Cleaned text saved to: ${outPath} (${text.length} chars)`);
}

cleanHtml(
  'C:\\Users\\pc\\.gemini\\antigravity\\brain\\f1e92cbe-5330-4956-b13c-98dbb56803a8\\.system_generated\\steps\\452\\content.md',
  'd:\\2026 dünya\\scratch\\usa_news.txt'
);

cleanHtml(
  'C:\\Users\\pc\\.gemini\\antigravity\\brain\\f1e92cbe-5330-4956-b13c-98dbb56803a8\\.system_generated\\steps\\462\\content.md',
  'd:\\2026 dünya\\scratch\\ned_news.txt'
);
