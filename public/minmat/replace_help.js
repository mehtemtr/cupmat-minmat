const fs = require('fs');

const path = 'd:/2026 dünya/public/minmat/index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Update HTML
const newHTML = `<div class="modal-body">
        <ul class="modal-list">
          <li id="helpPlatform"><strong>StatMatik:</strong> Oyun, haber ve futbol sonuçlarını bir araya getiren entegre bir platformdur.</li>
          <li id="helpGames"><strong>Oyunlar (MinMat/MinLan):</strong> Ekranda yer alan işlem kartlarını sonuçlarıyla eşleştirerek beyin jimnastiği yapabilirsiniz.</li>
          <li id="helpFootball"><strong>CupMat (Yakında):</strong> Uluslararası turnuvaların ve milli maçların sonuçlarını, istatistiklerini ve puan durumlarını takip edebilirsiniz.</li>
        </ul>
      </div>`;

content = content.replace(/<div class="modal-body">\s*<ul class="modal-list">[\s\S]*?<\/ul>\s*<\/div>/, newHTML);

// 2. Update JS bindings
const oldBindings = `let hsm = document.getElementById("helpSelectMode");
      if (hsm) hsm.innerHTML = t("helpSelectMode");
      let hm = document.getElementById("helpMatch");
      if (hm) hm.innerHTML = t("helpMatch");
      let hlu = document.getElementById("helpLevelUp");
      if (hlu) hlu.innerHTML = t("helpLevelUp");
      let hll = document.getElementById("helpLevelLocks");
      if (hll) hll.innerHTML = t("helpLevelLocks");`;

const newBindings = `let hp = document.getElementById("helpPlatform");
      if (hp) hp.innerHTML = t("helpPlatform");
      let hg = document.getElementById("helpGames");
      if (hg) hg.innerHTML = t("helpGames");
      let hf = document.getElementById("helpFootball");
      if (hf) hf.innerHTML = t("helpFootball");`;

content = content.replace(oldBindings, newBindings);

// 3. Update dictionary keys for ALL languages
const translations = {
  tr: `helpPlatform: "<strong>StatMatik Platformu:</strong> Oyun, haber ve futbol verilerini bir araya getiren entegre bir sistemdir.", helpGames: "<strong>Oyunlar (MinMat/MinLan):</strong> İşlem kartlarını doğru sonuçlarla eşleştirerek seviye atlayın ve beyin jimnastiği yapın.", helpFootball: "<strong>CupMat (Yakında):</strong> Uluslararası kupa ve milli maç sonuçlarını, puan durumlarını buradan takip edebilirsiniz."`,
  en: `helpPlatform: "<strong>StatMatik Platform:</strong> An integrated system combining games, news, and football data.", helpGames: "<strong>Games (MinMat/MinLan):</strong> Match operation cards with correct results to level up and exercise your brain.", helpFootball: "<strong>CupMat (Soon):</strong> Track international cup and national match results, and standings here."`,
  de: `helpPlatform: "<strong>StatMatik Plattform:</strong> Ein integriertes System aus Spielen, Nachrichten und Fußballdaten.", helpGames: "<strong>Spiele (MinMat/MinLan):</strong> Ordne Rechenkarten den richtigen Ergebnissen zu, um ein Level aufzusteigen.", helpFootball: "<strong>CupMat (Bald):</strong> Verfolgen Sie hier internationale Pokal- und Länderspielergebnisse sowie Tabellen."`,
  fr: `helpPlatform: "<strong>Plateforme StatMatik :</strong> Un système intégré regroupant jeux, actualités et données sur le football.", helpGames: "<strong>Jeux (MinMat/MinLan) :</strong> Associez les cartes d'opération aux bons résultats pour monter en niveau.", helpFootball: "<strong>CupMat (Bientôt) :</strong> Suivez ici les résultats des coupes internationales et des matchs nationaux."`,
  es: `helpPlatform: "<strong>Plataforma StatMatik:</strong> Un sistema integrado que combina juegos, noticias y datos de fútbol.", helpGames: "<strong>Juegos (MinMat/MinLan):</strong> Empareja tarjetas de operación con los resultados correctos para subir de nivel.", helpFootball: "<strong>CupMat (Pronto):</strong> Sigue los resultados de copas internacionales y partidos nacionales aquí."`,
  pt: `helpPlatform: "<strong>Plataforma StatMatik:</strong> Um sistema integrado que combina jogos, notícias e dados de futebol.", helpGames: "<strong>Jogos (MinMat/MinLan):</strong> Combine cartas de operação com os resultados corretos para subir de nível.", helpFootball: "<strong>CupMat (Em breve):</strong> Acompanhe os resultados das taças internacionais e partidas nacionais aqui."`,
  ar: `helpPlatform: "<strong>منصة StatMatik:</strong> نظام متكامل يجمع بين الألعاب والأخبار وبيانات كرة القدم.", helpGames: "<strong>الألعاب (MinMat/MinLan):</strong> قم بمطابقة بطاقات العمليات مع النتائج الصحيحة للارتقاء في المستوى.", helpFootball: "<strong>CupMat (قريباً):</strong> تابع نتائج الكؤوس الدولية والمباريات الوطنية هنا."`,
  ko: `helpPlatform: "<strong>StatMatik 플랫폼:</strong> 게임, 뉴스 및 축구 데이터를 결합한 통합 시스템입니다.", helpGames: "<strong>게임 (MinMat/MinLan):</strong> 연산 카드를 올바른 결과와 일치시켜 레벨을 올리세요.", helpFootball: "<strong>CupMat (곧):</strong> 여기서 국제 컵 및 국가 대표팀 경기 결과를 확인하세요."`,
  it: `helpPlatform: "<strong>Piattaforma StatMatik:</strong> Un sistema integrato che unisce giochi, notizie e dati sul calcio.", helpGames: "<strong>Giochi (MinMat/MinLan):</strong> Abbina le carte delle operazioni ai risultati corretti per salire di livello.", helpFootball: "<strong>CupMat (Presto):</strong> Segui qui i risultati delle coppe internazionali e delle partite nazionali."`
};

// We will find `helpSelectMode: "...", helpMatch: "...", helpLevelUp: "...", helpLevelLocks: "..."` and replace.
// Since each language has its own translated keys, we use a generic regex per language block.

Object.keys(translations).forEach(lang => {
  // Regex to match from helpSelectMode to helpLevelLocks for the specific language block.
  // We can just match `helpSelectMode:.*helpLevelLocks:[^\n]*"`
  const regex = new RegExp(`helpSelectMode:\\s*".*?",\\s*helpMatch:\\s*".*?",\\s*helpLevelUp:\\s*".*?",\\s*helpLevelLocks:\\s*".*?"`, 'g');
  
  // Since order of languages in the file is known, we just replace them all sequentially. 
  // Wait, `regex` without specifying language will match the first one it sees. 
  // We can do it by reading the specific block.
});

// A safer way: just replace ANY occurrence of `helpSelectMode:.*helpLevelLocks:[^\n\r]*"` one by one for each language?
// No, the regex can be global, but we want to map them correctly.
// Let's manually replace based on the order in the file: tr, en, de, fr, es, pt, ar, ko, it.
const langOrder = ['tr', 'en', 'de', 'fr', 'es', 'pt', 'ar', 'ko', 'it'];
let i = 0;
content = content.replace(/helpSelectMode:\s*".*?",\s*helpMatch:\s*".*?",\s*helpLevelUp:\s*".*?",\s*helpLevelLocks:\s*".*?"/g, (match) => {
  const replacement = translations[langOrder[i]];
  i++;
  return replacement || match; // fallback just in case
});

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced Help content successfully.');
