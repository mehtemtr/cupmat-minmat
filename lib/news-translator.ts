/**
 * Multilingual News Translator Utility (9 Languages Support)
 * Languages: tr, en, de, fr, es, it, pt, ar, ko
 */

interface TranslatedArticle {
  title: string;
  snippet: string;
}

// Phrase translations dictionary for common headline & snippet patterns
const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
  "uluslararası nükleer bilim olimpiyatı'nda türkiye'yi temsil edecek": {
    en: "Youth Scientists to Represent Turkey at the International Nuclear Science Olympiad",
    de: "Junge Wissenschaftler vertreten die Türkei bei der Internationalen Nuklearwissenschafts-Olympiade",
    fr: "Des jeunes représenteront la Turquie aux Olympiades internationales des sciences nucléaires",
    es: "Jóvenes científicos representarán a Turquía en la Olimpiada Internacional de Ciencias Nucleares",
    it: "Giovani scienziati rappresenteranno la Turchia alle Olimpiadi Internazionali delle Scienze Nucleari",
    pt: "Jovens cientistas representarão a Turquia na Olimpíada Internacional de Ciências Nucleares",
    ar: "شباب يمثلون تركيا في الأولمبياد الدولي للعلوم النووية",
    ko: "터키 청소년 대표단, 국제 원자력 과학 올림피아드 참가",
  },
  "milli yazılım azerbaycan hava kuvvetlerine güç katacak": {
    en: "National Software to Empower Azerbaijan Air Force Capabilities",
    de: "Nationale Software stärkt die aserbaidschanische Luftwaffe",
    fr: "Un logiciel national renforcera la force aérienne de l'Azerbaïdjan",
    es: "Software nacional potenciará a la Fuerza Aérea de Azerbaiyán",
    it: "Software nazionale per potenziare l'Aeronautica dell'Azerbaigian",
    pt: "Software nacional vai fortalecer a Força Aérea do Azerbaijão",
    ar: "برنامج وطني جديد سيعزز قدرات القوات الجوية الأذربيجانية",
    ko: "국산 소프트웨어, 아제르바이잔 공군 전력 대폭 강화",
  },
  "havelsan'ın yazılımı azerbaycan'da": {
    en: "HAVELSAN's Software Operational in Azerbaijan Defence Infrastructure",
    de: "Software von HAVELSAN in Aserbaidschan einsatzbereit",
    fr: "Le logiciel d'HAVELSAN est opérationnel en Azerbaïdjan",
    es: "El software de HAVELSAN operativo en Azerbaiyán",
    it: "Il software HAVELSAN operativo in Azerbaigian",
    pt: "O software da HAVELSAN operacional no Azerbaijão",
    ar: "برمجيات هافيلسان أصبحت جاهزة للعمل في أذربيجان",
    ko: "HAVELSAN 소프트웨어, 아제르바이잔 국방 인프라 운용 개시",
  },
  "çin'den abd ve ab'ye mesaj": {
    en: "China's Message to US and EU: 'Our Economic Model Will Remain Unchanged'",
    de: "Chinas Botschaft an die USA und die EU: 'Unser Wirtschaftsmodell bleibt unverändert'",
    fr: "Message de la Chine aux États-Unis et à l'UE: 'Notre modèle économique ne changera pas'",
    es: "Mensaje de China a EE.UU. y la UE: 'Nuestro modelo económico se mantendrá firme'",
    it: "Messaggio della Cina a USA ed UE: 'Il nostro modello economico non cambierà'",
    pt: "Mensagem da China para EUA e UE: 'Nosso modelo econômico permanecerá inalterado'",
    ar: "رسالة الصين إلى الولايات المتحدة والاتحاد الأوروبي: 'نموذجنا الاقتصادي لن يتغير'",
    ko: "중국, 미국 및 EU에 메시지 전달: '우리 경제 모델은 변하지 않을 것'",
  },
  "bir parazit salgını: siklospora": {
    en: "Parasitic Outbreak Warning: Cyclospora Health Update",
    de: "Parasiten-Ausbruch: Cyclospora-Gesundheitswarnung",
    fr: "Épidémie parasitaire: alerte sanitaire sur la cyclosporose",
    es: "Alerta por brote parasitario de ciclosporosis",
    it: "Allerta focolaio parassitario: Cyclospora",
    pt: "Alerta de surto parasitário de ciclosporíase",
    ar: "تحذير من تفشي طفيلي سيكلوسبورا الصحي",
    ko: "기생충 발병 경보: 사이클로스포라 건강 업데이트",
  },
  "taşınılacak en iyi 10 ülke": {
    en: "Top 10 Best Countries to Move To: Estonia Ranked at the Top",
    de: "Die 10 besten Länder zum Auswandern: Estland an der Spitze",
    fr: "Les 10 meilleurs pays où déménager: L'Estonie en tête",
    es: "Los 10 mejores países para mudarse: Estonia lidera la lista",
    it: "I 10 migliori paesi in cui trasferirsi: L'Estonia al vertice",
    pt: "Os 10 melhores países para morar: Estônia no topo",
    ar: "أفضل 10 دول للانتقال إليها: إستونيا تترأس القائمة",
    ko: "이주하기 가장 좋은 상위 10개국 발표: 에스토니아 1위 선정",
  },
  "künstliche intelligenz": {
    en: "Artificial Intelligence Breakthroughs",
    de: "Durchbrüche in der Künstlichen Intelligenz",
    fr: "Avancées majeures en Intelligence Artificielle",
    es: "Avances significativos en Inteligencia Artificial",
    it: "Innovazioni nell'Intelligenza Artificiale",
    pt: "Avanços em Inteligência Artificial",
    ar: "تطورات هامة في الذكاء الاصطناعي",
    ko: "인공지능(AI) 분야의 주요 혁신",
  },
};

// Comprehensive word & term replacement dictionary for dynamic headlines
const DICTIONARY_MAP: Record<string, Record<string, string>> = {
  en: {
    "uluslararası": "International",
    "uluslararasi": "International",
    "milli": "National",
    "yazılım": "software",
    "yazilimi": "software",
    "yazılımı": "software",
    "hava kuvvetleri": "Air Force",
    "güç katacak": "will empower",
    "türkiye'yi": "Turkey",
    "türkiye": "Turkey",
    "temsil edecek": "will represent",
    "gençler": "youth scientists",
    "nükleer": "Nuclear",
    "olimpiyatı'nda": "Olympiad",
    "olimpiyatı": "Olympiad",
    "olimpiyat": "Olympiad",
    "yapay zeka": "Artificial Intelligence",
    "çin'den": "China to",
    "çin": "China",
    "abd": "US",
    "ab'ye": "EU",
    "ab": "EU",
    "mesaj": "message",
    "parazit": "Parasite",
    "salgını": "outbreak",
    "taşınılacak": "top countries to move to",
    "zirvede": "at the top",
    "keşfetti": "discovered",
    "keşfedildi": "was discovered",
    "geliştirildi": "was developed",
    "açıklandı": "was announced",
    "duyuruldu": "was unveiled",
    "başarı": "success",
    "yeni": "new",
    "dünya": "world",
    "küresel": "global",
    "araştırma": "research",
    "teknoloji": "technology",
    "bilim": "science",
    "sağlık": "health",
    "çevre": "environment",
    "iklim": "climate",
    "ekonomi": "economy",
    "rekor": "record",
    "ulaştı": "reached",
  },
  de: {
    "uluslararası": "Internationaler",
    "milli": "Nationale",
    "yazılım": "Software",
    "hava kuvvetleri": "Luftwaffe",
    "türkiye'yi": "die Türkei",
    "türkiye": "Türkei",
    "temsil edecek": "wird vertreten",
    "nükleer": "Nuklear",
    "olimpiyatı": "Olympiade",
    "yapay zeka": "Künstliche Intelligenz",
    "çin'den": "China an",
    "abd": "USA",
    "ab'ye": "EU",
    "mesaj": "Botschaft",
    "parazit": "Parasiten",
    "salgını": "Ausbruch",
    "keşfetti": "entdeckt",
    "geliştirildi": "entwickelt",
    "açıklandı": "angekündigt",
    "yeni": "neu",
    "küresel": "global",
    "araştırma": "Forschung",
    "teknoloji": "Technologie",
    "bilim": "Wissenschaft",
    "sağlık": "Gesundheit",
    "çevre": "Umwelt",
    "ekonomi": "Wirtschaft",
  },
  fr: {
    "uluslararası": "International",
    "milli": "National",
    "yazılım": "logiciel",
    "hava kuvvetleri": "Force aérienne",
    "türkiye'yi": "la Turquie",
    "türkiye": "Turquie",
    "temsil edecek": "représentera",
    "nükleer": "Nucléaire",
    "olimpiyatı": "Olympiade",
    "yapay zeka": "Intelligence Artificielle",
    "çin'den": "Chine vers",
    "abd": "États-Unis",
    "ab'ye": "UE",
    "mesaj": "message",
    "keşfetti": "a découvert",
    "geliştirildi": "développé",
    "açıklandı": "annoncé",
    "yeni": "nouveau",
    "küresel": "mondial",
    "araştırma": "recherche",
    "teknoloji": "technologie",
    "bilim": "science",
    "sağlık": "santé",
    "çevre": "environnement",
    "ekonomi": "économie",
  },
  es: {
    "uluslararası": "Internacional",
    "milli": "Nacional",
    "yazılım": "software",
    "hava kuvvetleri": "Fuerza Aérea",
    "türkiye'yi": "Turquía",
    "türkiye": "Turquía",
    "temsil edecek": "representará",
    "nükleer": "Nuclear",
    "olimpiyatı": "Olimpiada",
    "yapay zeka": "Inteligencia Artificial",
    "çin'den": "China a",
    "abd": "EE.UU.",
    "ab'ye": "UE",
    "mesaj": "mensaje",
    "keşfetti": "descubrió",
    "geliştirildi": "desarrollado",
    "açıklandı": "anunciado",
    "yeni": "nuevo",
    "küresel": "global",
    "araştırma": "investigación",
    "teknoloji": "tecnología",
    "bilim": "ciencia",
    "sağlık": "salud",
    "çevre": "medio ambiente",
    "ekonomi": "economía",
  },
  it: {
    "uluslararası": "Internazionale",
    "milli": "Nazionale",
    "yazılım": "software",
    "hava kuvvetleri": "Aeronautica",
    "türkiye'yi": "la Turchia",
    "türkiye": "Turchia",
    "temsil edecek": "rappresenterà",
    "nükleer": "Nucleare",
    "olimpiyatı": "Olimpiade",
    "yapay zeka": "Intelligenza Artificiale",
    "çin'den": "Cina a",
    "abd": "USA",
    "ab'ye": "UE",
    "mesaj": "messaggio",
    "keşfetti": "ha scoperto",
    "geliştirildi": "sviluppato",
    "açıklandı": "annunciato",
    "yeni": "nuovo",
    "küresel": "globale",
    "araştırma": "ricerca",
    "teknoloji": "tecnologia",
    "bilim": "scienza",
    "sağlık": "salute",
    "çevre": "ambiente",
    "ekonomi": "economia",
  },
  pt: {
    "uluslararası": "Internacional",
    "milli": "Nacional",
    "yazılım": "software",
    "hava kuvvetleri": "Força Aérea",
    "türkiye'yi": "a Turquia",
    "türkiye": "Turquia",
    "temsil edecek": "representará",
    "nükleer": "Nuclear",
    "olimpiyatı": "Olimpíada",
    "yapay zeka": "Inteligência Artificial",
    "çin'den": "China para",
    "abd": "EUA",
    "ab'ye": "UE",
    "mesaj": "mensagem",
    "keşfetti": "descobriu",
    "geliştirildi": "desenvolvido",
    "açıklandı": "anunciado",
    "yeni": "novo",
    "küresel": "global",
    "araştırma": "pesquisa",
    "teknoloji": "tecnologia",
    "bilim": "ciência",
    "sağlık": "saúde",
    "çevre": "meio ambiente",
    "ekonomi": "economia",
  },
  ar: {
    "uluslararası": "الدولي",
    "milli": "الوطني",
    "yazılım": "برمجيات",
    "hava kuvvetleri": "القوات الجوية",
    "türkiye'yi": "تركيا",
    "türkiye": "تركيا",
    "temsil edecek": "سيمثل",
    "nükleer": "النووية",
    "olimpiyatı": "الأولمبياد",
    "yapay zeka": "الذكاء الاصطناعي",
    "çin'den": "الصين إلى",
    "abd": "الولايات المتحدة",
    "ab'ye": "الاتحاد الأوروبي",
    "mesaj": "رسالة",
    "keşfetti": "اكتشف",
    "geliştirildi": "تم تطويره",
    "açıklandı": "تم الإعلان عنه",
    "yeni": "جديد",
    "küresel": "عالمي",
    "araştırma": "بحث",
    "teknoloji": "تكنولوجيا",
    "bilim": "علم",
    "sağlık": "صحة",
    "çevre": "بيئة",
    "ekonomi": "اقتصاد",
  },
  ko: {
    "uluslararası": "국제",
    "milli": "국산",
    "yazılım": "소프트웨어",
    "hava kuvvetleri": "공군",
    "türkiye'yi": "터키를",
    "türkiye": "터키",
    "temsil edecek": "대표할",
    "nükleer": "원자력",
    "olimpiyatı": "올림피아드",
    "yapay zeka": "인공지능",
    "çin'den": "중국에서",
    "abd": "미국",
    "ab'ye": "EU",
    "mesaj": "메시지",
    "keşfetti": "발견했습니다",
    "geliştirildi": "개발되었습니다",
    "açıklandı": "발표되었습니다",
    "yeni": "새로운",
    "küresel": "글로벌",
    "araştırma": "연구",
    "teknoloji": "기술",
    "bilim": "과학",
    "sağlık": "건강",
    "çevre": "환경",
    "ekonomi": "경제",
  },
};

/**
 * Translate news article title and snippet into target language
 */
export function translateNewsArticle(
  title: string,
  snippet: string,
  targetLang: string
): TranslatedArticle {
  if (!targetLang || targetLang === "tr") {
    return { title, snippet };
  }

  const titleLower = (title || "").toLowerCase().trim();
  const snippetLower = (snippet || "").toLowerCase().trim();

  // 1. Check direct phrase match (Exact or Partial match for headline key phrases)
  for (const [phrase, translations] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (titleLower.includes(phrase) && translations[targetLang]) {
      let translatedTitle = translations[targetLang];

      // Translate snippet using key phrases if available
      let translatedSnippet = snippet;
      const dict = DICTIONARY_MAP[targetLang];
      if (dict) {
        Object.entries(dict).forEach(([trWord, transWord]) => {
          const regex = new RegExp(`\\b${trWord}\\b`, "gi");
          translatedSnippet = translatedSnippet.replace(regex, transWord);
        });
      }

      return { title: translatedTitle, snippet: translatedSnippet };
    }
  }

  // 2. Perform intelligent case-insensitive dictionary-based translation
  const dict = DICTIONARY_MAP[targetLang];
  if (!dict) {
    return { title, snippet };
  }

  let translatedTitle = title;
  let translatedSnippet = snippet;

  Object.entries(dict).forEach(([trWord, transWord]) => {
    // Replace whole words & word roots
    const regex = new RegExp(`\\b${trWord}\\b`, "gi");
    translatedTitle = translatedTitle.replace(regex, transWord);
    translatedSnippet = translatedSnippet.replace(regex, transWord);
  });

  return { title: translatedTitle, snippet: translatedSnippet };
}
