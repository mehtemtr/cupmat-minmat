const fs = require('fs');
const path = require('path');

const translations = {
  tr: {
    minlanTitle: "MİNLAN — DİL AVI",
    minlanQuote: "Bir dil, bir insan; kaç kişiliksin?",
    minlanDesc: "9 Dilde Karşılıklı Kelime Öğrenme ve Hafıza Oyunu.",
    cupMatDesc: "Uluslararası Kupaların sonuçları, puanları ve istatistikleri"
  },
  en: {
    minlanTitle: "MINLAN — LANGUAGE HUNT",
    minlanQuote: "One language, one person; how many people are you?",
    minlanDesc: "9-Language Interactive Vocabulary & Memory Game.",
    cupMatDesc: "International Cups results, standings, and statistics"
  },
  de: {
    minlanTitle: "MINLAN — SPRACHJAGD",
    minlanQuote: "Eine Sprache, ein Mensch; wie viele Personen bist du?",
    minlanDesc: "Interaktives Vokabel- und Gedächtnisspiel in 9 Sprachen.",
    cupMatDesc: "Ergebnisse, Tabellen und Statistiken internationaler Pokale"
  },
  es: {
    minlanTitle: "MINLAN — CAZA DE IDIOMAS",
    minlanQuote: "Un idioma, una persona; ¿cuántas personas eres tú?",
    minlanDesc: "Juego Interactivo de Vocabulario y Memoria en 9 Idiomas.",
    cupMatDesc: "Resultados, clasificaciones y estadísticas de Copas Internacionales"
  },
  fr: {
    minlanTitle: "MINLAN — CHASSE AUX LANGUES",
    minlanQuote: "Une langue, une personne ; combien de personnes êtes-vous ?",
    minlanDesc: "Jeu Interactif de Vocabulaire et de Mémoire en 9 Langues.",
    cupMatDesc: "Résultats, classements et statistiques des Coupes Internationales"
  },
  it: {
    minlanTitle: "MINLAN — CACCIA ALLE LINGUE",
    minlanQuote: "Una lingua, una persona; quante persone sei tu?",
    minlanDesc: "Gioco Interattivo di Vocabolario e Memoria in 9 Lingue.",
    cupMatDesc: "Risultati, classifiche e statistiche delle Coppe Internazionali"
  },
  pt: {
    minlanTitle: "MINLAN — CAÇA A IDIOMAS",
    minlanQuote: "Um idioma, uma pessoa; quantas pessoas é você?",
    minlanDesc: "Jogo Interativo de Vocabulário e Memória em 9 Idiomas.",
    cupMatDesc: "Resultados, classificações e estatísticas de Copas Internacionais"
  },
  ko: {
    minlanTitle: "민란 — 언어 사냥",
    minlanQuote: "언어 하나에 사람 한 명; 당신은 몇 사람입니까?",
    minlanDesc: "9개 국어 대화형 단어 및 기억력 게임.",
    cupMatDesc: "국제 컵 경기 결과, 순위 및 통계"
  },
  ar: {
    minlanTitle: "مينلان — صيد اللغات",
    minlanQuote: "لغة واحدة، إنسان واحد؛ كم إنسانًا أنت؟",
    minlanDesc: "لعبة تفاعلية للمفردات والذاكرة بـ 9 لغات.",
    cupMatDesc: "نتائج وترتيب وإحصائيات الكؤوس الدولية"
  }
};

const dir = path.join(__dirname, 'dictionaries');

for (const [lang, trans] of Object.entries(translations)) {
  const filePath = path.join(dir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.hero) data.hero = {};
    
    data.hero.minlanTitle = trans.minlanTitle;
    data.hero.minlanQuote = trans.minlanQuote;
    data.hero.minlanDesc = trans.minlanDesc;
    data.hero.cupMatDesc = trans.cupMatDesc;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}.json`);
  }
}
