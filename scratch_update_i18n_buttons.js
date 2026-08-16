const fs = require('fs');
const path = require('path');

const dictDir = path.join(__dirname, 'dictionaries');

const translations = {
  "tr": {
    "minMatTitle": "MINMAT — SAYI AVI",
    "goToMinLan": "Minlan'a Git",
    "goToNewsGlo": "NewsGlo Akışına Git"
  },
  "en": {
    "minMatTitle": "MINMAT — NUMBER HUNT",
    "goToMinLan": "Go to MinLan",
    "goToNewsGlo": "Go to NewsGlo Feed"
  },
  "fr": {
    "minMatTitle": "MINMAT — CHASSE AUX CHIFFRES",
    "goToMinLan": "Aller à MinLan",
    "goToNewsGlo": "Aller au Flux NewsGlo"
  },
  "de": {
    "minMatTitle": "MINMAT — ZAHLENJAGD",
    "goToMinLan": "Zu MinLan",
    "goToNewsGlo": "Zum NewsGlo-Feed"
  },
  "es": {
    "minMatTitle": "MINMAT — CAZA DE NÚMEROS",
    "goToMinLan": "Ir a MinLan",
    "goToNewsGlo": "Ir al Feed de NewsGlo"
  },
  "it": {
    "minMatTitle": "MINMAT — CACCIA AI NUMERI",
    "goToMinLan": "Vai a MinLan",
    "goToNewsGlo": "Vai al Feed di NewsGlo"
  },
  "pt": {
    "minMatTitle": "MINMAT — CAÇA AOS NÚMEROS",
    "goToMinLan": "Ir para MinLan",
    "goToNewsGlo": "Ir para o Feed do NewsGlo"
  },
  "ko": {
    "minMatTitle": "MINMAT — 숫자 사냥",
    "goToMinLan": "MinLan으로 이동",
    "goToNewsGlo": "NewsGlo 피드로 이동"
  },
  "ar": {
    "minMatTitle": "MINMAT — صيد الأرقام",
    "goToMinLan": "الذهاب إلى MinLan",
    "goToNewsGlo": "الذهاب إلى تغذية NewsGlo"
  }
};

let updatedCount = 0;

for (const lang in translations) {
  const filePath = path.join(dictDir, lang + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.hero) data.hero = {};
    
    data.hero.minMatTitle = translations[lang].minMatTitle;
    data.hero.goToMinLan = translations[lang].goToMinLan;
    data.hero.goToNewsGlo = translations[lang].goToNewsGlo;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log("Updated " + lang + ".json");
    updatedCount++;
  }
}

console.log("Successfully updated " + updatedCount + " language files.");
