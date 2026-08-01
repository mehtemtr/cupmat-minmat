const fs = require('fs');
const path = require('path');

const userCountries = [
  "Almanya",
  "Amerika Birleşik Devletleri",
  "Angola",
  "Antigua ve Barbuda",
  "Arjantin",
  "Arnavutluk",
  "Aruba",
  "Avustralya",
  "Avusturya",
  "Azerbaycan",
  "Bahamalar",
  "Bahreyn",
  "Bangladeş",
  "Belarus",
  "Belçika",
  "Belize",
  "Benin",
  "Bermuda",
  "Birleşik Arap Emirlikleri",
  "Birleşik Krallık",
  "Bolivya",
  "Bosna-Hersek",
  "Botsvana",
  "Brezilya",
  "Britanya Virjin Adaları",
  "Bulgaristan",
  "Burkina Faso",
  "Cabo Verde",
  "Cayman Adaları",
  "Cebelitarık",
  "Cezayir",
  "Cibuti",
  "Côte d’Ivoire",
  "Çad",
  "Çekya",
  "Çin",
  "Danimarka",
  "Dominik Cumhuriyeti",
  "Dominika",
  "Ekvador",
  "El Salvador",
  "Endonezya",
  "Eritre",
  "Ermenistan",
  "Estonya",
  "Fas",
  "Fiji",
  "Filipinler",
  "Filistin",
  "Finlandiya",
  "Fransa",
  "Gabon",
  "Gambiya",
  "Gana",
  "Gine",
  "Gine-Bissau",
  "Grenada",
  "Guatemala",
  "Güney Afrika",
  "Güney Kıbrıs Rum Yönetimi",
  "Güney Kore",
  "Gürcistan",
  "Haiti",
  "Hırvatistan",
  "Hindistan",
  "Hollanda",
  "Honduras",
  "Hong Kong",
  "Irak",
  "İran",
  "İrlanda",
  "İspanya",
  "İsveç",
  "İsviçre",
  "İtalya",
  "İzlanda",
  "Jamaika",
  "Japonya",
  "Kamboçya",
  "Kamerun",
  "Kanada",
  "Katar",
  "Kazakistan",
  "Kenya",
  "Kırgızistan",
  "Kolombiya",
  "Komorlar",
  "Kongo - Brazavil",
  "Kongo - Kinşasa",
  "Kosta Rika",
  "Kuveyt",
  "Kuzey Kıbrıs Türk Cumhuriyeti",
  "Kuzey Makedonya",
  "Küba",
  "Laos",
  "Letonya",
  "Liberya",
  "Libya",
  "Liechtenstein",
  "Litvanya",
  "Lübnan",
  "Lüksemburg",
  "Macaristan",
  "Makao",
  "Maldivler",
  "Malezya",
  "Mali",
  "Malta",
  "Mauritius",
  "Meksika",
  "Mısır",
  "Mikronezya",
  "Moğolistan",
  "Moldova",
  "Monako",
  "Mozambik",
  "Myanmar (Burma)",
  "Namibya",
  "Nepal",
  "Nijer",
  "Nijerya",
  "Nikaragua",
  "Norveç",
  "Özbekistan",
  "Pakistan",
  "Panama",
  "Papua Yeni Gine",
  "Paraguay",
  "Peru",
  "Polonya",
  "Portekiz",
  "Romanya",
  "Ruanda",
  "Rusya",
  "Saint Kitts ve Nevis",
  "Saint Lucia",
  "Samoa",
  "San Marino",
  "Senegal",
  "Seyşeller",
  "Sırbistan",
  "Sierra Leone",
  "Singapur",
  "Slovakya",
  "Slovenya",
  "Solomon Adaları",
  "Somali",
  "Sri Lanka",
  "Sudan",
  "Surinam",
  "Suudi Arabistan",
  "Şili",
  "Tacikistan",
  "Tanzanya",
  "Tayland",
  "Tayvan",
  "Togo",
  "Tonga",
  "Trinidad ve Tobago",
  "Tunus",
  "Turks ve Caicos Adaları",
  "Türkiye",
  "Türkmenistan",
  "Uganda",
  "Ukrayna",
  "Umman",
  "Uruguay",
  "Ürdün",
  "Vanuatu",
  "Vatikan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Yeni Zelanda",
  "Yunanistan",
  "Zambiya",
  "Zimbabve"
];

const uniqueUserCountries = [...new Set(userCountries)];
console.log(`User list has ${userCountries.length} items (${uniqueUserCountries.length} unique).`);

const mledoze = require('./mledoze_countries.json');
const dr5hn = require('./dr5hn_countries.json');

const overrides = {
  "Amerika Birleşik Devletleri": "US",
  "Birleşik Krallık": "GB",
  "Bosna-Hersek": "BA",
  "Britanya Virjin Adaları": "VG",
  "Côte d’Ivoire": "CI",
  "Çekya": "CZ",
  "Filistin": "PS",
  "Güney Kıbrıs Rum Yönetimi": "CY",
  "Güney Kore": "KR",
  "Kongo - Brazavil": "CG",
  "Kongo - Kinşasa": "CD",
  "Kuzey Kıbrıs Türk Cumhuriyeti": "KKTC",
  "Kuzey Makedonya": "MK",
  "Myanmar (Burma)": "MM",
  "Vatikan": "VA"
};

function findCountry(searchName) {
  const norm = searchName.toLowerCase().trim();

  for (const c of mledoze) {
    const turCommon = (c.translations && c.translations.tur && c.translations.tur.common || '').toLowerCase();
    const turOfficial = (c.translations && c.translations.tur && c.translations.tur.official || '').toLowerCase();
    const engCommon = (c.name && c.name.common || '').toLowerCase();
    const engOfficial = (c.name && c.name.official || '').toLowerCase();

    if (turCommon === norm || turOfficial === norm || engCommon === norm || engOfficial === norm) {
      return c.cca2;
    }
  }

  for (const c of dr5hn) {
    const trName = (c.translations && c.translations.tr || '').toLowerCase();
    const engName = (c.name || '').toLowerCase();

    if (trName === norm || engName === norm) {
      return c.iso2;
    }
  }

  return null;
}

const unmatched = [];
const matched = [];

uniqueUserCountries.forEach(name => {
  let code = overrides[name];
  if (!code) {
    code = findCountry(name);
  }

  if (code) {
    matched.push({ name, code });
  } else {
    unmatched.push(name);
  }
});

console.log(`Matched: ${matched.length}`);
console.log(`Unmatched: ${unmatched.length}`);
if (unmatched.length > 0) {
  console.log("Unmatched countries:", unmatched);
}
