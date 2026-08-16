const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'dictionaries');

const keys = {
  tr: {
    tickerMathematic: "Matematiğin bir şeyi yoktur; her şeyin bir matematiği vardır.",
    tickerCupMat: "CupMat — Futbolun matematiksel adaleti. Lobilerin rengi değil, performansın liyakati.",
    tickerMinMat: "MinMat — Sayı Avı (Matematik Hafıza Oyunu). Zihnini canlandır!",
    tickerNewsGlo: "NewsGlo — Küresel Bilim, Teknoloji, Sağlık, Çevre ve Gelişmeler Akışı."
  },
  en: {
    tickerMathematic: "Mathematics doesn't have a thing; everything has a mathematics.",
    tickerCupMat: "CupMat — The mathematical justice of football. Merit of performance, not lobby colors.",
    tickerMinMat: "MinMat — Number Hunt (Math Memory Game). Revitalize your mind!",
    tickerNewsGlo: "NewsGlo — A global stream of Science, Technology, Health, Environment, and Development news."
  },
  fr: {
    tickerMathematic: "Les mathématiques n'ont rien en propre ; tout a une mathématique.",
    tickerCupMat: "CupMat — La justice mathématique du football. Le mérite de la performance, pas des lobbies.",
    tickerMinMat: "MinMat — Chasse aux Chiffres (Jeu de Mémoire). Stimulez votre esprit !",
    tickerNewsGlo: "NewsGlo — Flux mondial d'actualités sur la science, la technologie, la santé, l'environnement et le développement."
  },
  de: {
    tickerMathematic: "Mathematik hat kein Ding; alles hat eine Mathematik.",
    tickerCupMat: "CupMat — Die mathematische Gerechtigkeit des Fußballs. Leistung zählt, keine Lobbys.",
    tickerMinMat: "MinMat — Zahlenjagd (Gedächtnisspiel). Beleben Sie Ihren Geist!",
    tickerNewsGlo: "NewsGlo — Ein globaler Feed für Wissenschaft, Technologie, Gesundheit, Umwelt und Entwicklung."
  },
  es: {
    tickerMathematic: "Las matemáticas no tienen algo; todo tiene sus matemáticas.",
    tickerCupMat: "CupMat — La justicia matemática del fútbol. Mérito de rendimiento, no lobbismo.",
    tickerMinMat: "MinMat — Caza de Números (Juego de Memoria). ¡Revitaliza tu mente!",
    tickerNewsGlo: "NewsGlo — Un flujo global de noticias sobre ciencia, tecnología, salud, medio ambiente y desarrollo."
  },
  it: {
    tickerMathematic: "La matematica non ha una cosa; tutto ha una matematica.",
    tickerCupMat: "CupMat — La giustizia matematica del calcio. Merito delle prestazioni, non delle lobby.",
    tickerMinMat: "MinMat — Caccia ai Numeri (Gioco di Memoria). Rivitalizza la tua mente!",
    tickerNewsGlo: "NewsGlo — Un flusso globale di notizie su scienza, tecnologia, salute, ambiente e sviluppo."
  },
  pt: {
    tickerMathematic: "A matemática não tem uma coisa; tudo tem uma matemática.",
    tickerCupMat: "CupMat — A justiça matemática do futebol. Mérito do desempenho, não dos lobbies.",
    tickerMinMat: "MinMat — Caça aos Números (Jogo de Memória). Revitalize sua mente!",
    tickerNewsGlo: "NewsGlo — Um feed global de notícias sobre ciência, tecnologia, saúde, meio ambiente e desenvolvimento."
  },
  ar: {
    tickerMathematic: "الرياضيات ليس لها شيء؛ كل شيء له رياضيات.",
    tickerCupMat: "CupMat — العدالة الرياضية لكرة القدم. جدارة الأداء، وليس جماعات الضغط.",
    tickerMinMat: "MinMat — صيد الأرقام (لعبة الذاكرة). جدد نشاط عقلك!",
    tickerNewsGlo: "NewsGlo — تدفق عالمي لأخبار العلوم والتكنولوجيا والصحة والبيئة والتنمية."
  },
  ko: {
    tickerMathematic: "수학에는 무언가가 있는 것이 아닙니다; 모든 것에는 수학이 있습니다.",
    tickerCupMat: "CupMat — 축구의 수학적 정의. 로비가 아닌 성과에 따른 보상.",
    tickerMinMat: "MinMat — 숫자 사냥 (기억력 게임). 두뇌를 깨우세요!",
    tickerNewsGlo: "NewsGlo — 과학, 기술, 건강, 환경 및 발전에 관한 글로벌 뉴스 피드."
  }
};

for (const lang in keys) {
  const filePath = path.join(dictDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.hero) data.hero = {};
    data.hero.tickerMathematic = keys[lang].tickerMathematic;
    data.hero.tickerCupMat = keys[lang].tickerCupMat;
    data.hero.tickerMinMat = keys[lang].tickerMinMat;
    data.hero.tickerNewsGlo = keys[lang].tickerNewsGlo;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  }
}
