const fs = require('fs');

const path = 'd:/2026 dünya/public/minmat/index.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/Bu oyun; zihinden işlem hızını, matematiksel zekayı ve stratejik düşünmeyi eğlenceli bir şekilde geliştirmek amacıyla Cupmat & Minmat entegrasyonuyla hazırlanmıştır\./g, 'statmatik.com, zihinsel gelişimi, futbolu ve güncel dünyayı tek bir noktada buluşturan yenilikçi bir platformdur.');
content = content.replace(/Mehmet Ali Ali Temizel/g, 'Mehmet Ali Hayri Temizel');
content = content.replace(/v1\.0\.0 \(Mayıs 2026\)/g, 'v1.0.1.0 (Temmuz 2026)');

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced about text.');
