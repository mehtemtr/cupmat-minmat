const fs = require('fs');

const path = 'd:/2026 dünya/public/minmat/index.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/subtitle:\s*"MinMat[^"]+"(,\s*all:\s*"All")/, 'subtitle: "MinMat — Number Hunt"$1');
content = content.replace(/subtitle:\s*"MinMat[^"]+"(,\s*all:\s*"Alle")/, 'subtitle: "MinMat — Zahlenjagd"$1');
content = content.replace(/subtitle:\s*"MinMat[^"]+"(,\s*all:\s*"Tous")/, 'subtitle: "MinMat — Chasse aux Nombres"$1');
content = content.replace(/subtitle:\s*"MinMat[^"]+"(,\s*all:\s*"Todos")/, 'subtitle: "MinMat — Caza de Números"$1');
// Portuguese has all: "Todos" too, so we'll match by looking at previous text
content = content.replace(/(guest:\s*"Convidado",\s*menu:\s*"Menu",\s*)subtitle:\s*"MinMat[^"]+"/, '$1subtitle: "MinMat — Caça aos Números"');
content = content.replace(/(guest:\s*"Invitado",\s*menu:\s*"Menü",\s*)subtitle:\s*"MinMat[^"]+"/, '$1subtitle: "MinMat — Caza de Números"');
content = content.replace(/(guest:\s*"Ospite",\s*menu:\s*"Menu",\s*)subtitle:\s*"MinMat[^"]+"/, '$1subtitle: "MinMat — Caccia ai Numeri"');
content = content.replace(/(guest:\s*"ضيف",\s*menu:\s*"القائمة",\s*)subtitle:\s*"MinMat[^"]+"/, '$1subtitle: "MinMat — صيد الأرقام"');
content = content.replace(/(guest:\s*"게스트",\s*menu:\s*"메뉴",\s*)subtitle:\s*"MinMat[^"]+"/, '$1subtitle: "MinMat — 숫자 사냥"');

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced subtitles.');
