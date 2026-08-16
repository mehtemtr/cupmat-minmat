const https = require('https');

const badges = {
  en: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
  tr: "https://play.google.com/intl/tr_tr/badges/static/images/badges/tr_badge_web_generic.png",
  es: "https://play.google.com/intl/es/badges/static/images/badges/es_badge_web_generic.png",
  fr: "https://play.google.com/intl/fr/badges/static/images/badges/fr_badge_web_generic.png",
  de: "https://play.google.com/intl/de/badges/static/images/badges/de_badge_web_generic.png",
  pt: "https://play.google.com/intl/pt-BR/badges/static/images/badges/pt-br_badge_web_generic.png",
  ar: "https://play.google.com/intl/ar/badges/static/images/badges/ar_badge_web_generic.png",
  ko: "https://play.google.com/intl/ko/badges/static/images/badges/ko_badge_web_generic.png",
  it: "https://play.google.com/intl/it/badges/static/images/badges/it_badge_web_generic.png",
};

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve('error'));
  });
}

async function run() {
  for (const [lang, url] of Object.entries(badges)) {
    const code = await checkUrl(url);
    console.log(lang, code);
  }
}
run();
