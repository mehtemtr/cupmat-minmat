const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'dictionaries');

const translations = {
  "en": {
    "newsGloDesc": "NewsGlo — A global stream of Science, Technology, Health, Environment, and Development news.",
    "minLanDesc": "MinLan — A 9-Language Math & Vocabulary Memory Game."
  },
  "fr": {
    "newsGloDesc": "NewsGlo — Flux mondial d'actualités sur la science, la technologie, la santé, l'environnement et le développement.",
    "minLanDesc": "MinLan — Jeu de mémoire mathématique et linguistique en 9 langues."
  },
  "de": {
    "newsGloDesc": "NewsGlo — Ein globaler Feed für Wissenschaft, Technologie, Gesundheit, Umwelt und Entwicklung.",
    "minLanDesc": "MinLan — Ein Mathe- und Vokabel-Gedächtnisspiel in 9 Sprachen."
  },
  "es": {
    "newsGloDesc": "NewsGlo — Un flujo global de noticias sobre ciencia, tecnología, salud, medio ambiente y desarrollo.",
    "minLanDesc": "MinLan — Juego de memoria de matemáticas y vocabulario en 9 idiomas."
  },
  "it": {
    "newsGloDesc": "NewsGlo — Un flusso globale di notizie su scienza, tecnologia, salute, ambiente e sviluppo.",
    "minLanDesc": "MinLan — Gioco di memoria per matematica e vocabolario in 9 lingue."
  },
  "pt": {
    "newsGloDesc": "NewsGlo — Um feed global de notícias sobre ciência, tecnologia, saúde, meio ambiente e desenvolvimento.",
    "minLanDesc": "MinLan — Jogo de memória de matemática e vocabulário em 9 idiomas."
  },
  "ko": {
    "newsGloDesc": "NewsGlo — 과학, 기술, 건강, 환경 및 발전에 관한 글로벌 뉴스 피드.",
    "minLanDesc": "MinLan — 9개 국어 수학 및 어휘 기억력 게임."
  },
  "ar": {
    "newsGloDesc": "NewsGlo — تدفق عالمي لأخبار العلوم والتكنولوجيا والصحة والبيئة والتنمية.",
    "minLanDesc": "MinLan — لعبة ذاكرة للرياضيات والمفردات بـ 9 لغات."
  }
};

let updatedCount = 0;

for (const lang in translations) {
  const filePath = path.join(dictDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.hero) data.hero = {};
    
    data.hero.newsGloDesc = translations[lang].newsGloDesc;
    data.hero.minLanDesc = translations[lang].minLanDesc;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log("Updated " + lang + ".json");
    updatedCount++;
  }
}

console.log("Successfully updated " + updatedCount + " language files.");
