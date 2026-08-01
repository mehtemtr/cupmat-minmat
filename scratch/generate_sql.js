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

const mledoze = require('./mledoze_countries.json');
const dr5hn = require('./dr5hn_countries.json');

const mledozeMap = {};
mledoze.forEach(c => {
  if (c.cca2) mledozeMap[c.cca2.toUpperCase()] = c;
});

const dr5hnMap = {};
dr5hn.forEach(c => {
  if (c.iso2) dr5hnMap[c.iso2.toUpperCase()] = c;
});

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

const compiledCountries = [];

uniqueUserCountries.forEach(name => {
  if (name === "Kuzey Kıbrıs Türk Cumhuriyeti") {
    compiledCountries.push({
      iso2: null,
      iso3: null,
      name_tr: 'Kuzey Kıbrıs Türk Cumhuriyeti',
      name_en: 'Turkish Republic of Northern Cyprus',
      short_name_tr: 'KKTC',
      short_name_en: 'TRNC',
      population: 382230,
      flag_url: '/flags/kktc.svg'
    });
    return;
  }

  if (name === "Güney Kıbrıs Rum Yönetimi") {
    compiledCountries.push({
      iso2: null,
      iso3: null,
      name_tr: 'Güney Kıbrıs Rum Yönetimi',
      name_en: 'Greek Cypriot Administration',
      short_name_tr: 'GKRY',
      short_name_en: 'GCA',
      population: 1251500,
      flag_url: '🇨🇾'
    });
    return;
  }

  const code = overrides[name] || findCountry(name);
  if (!code) {
    console.error("Could not find code for country:", name);
    return;
  }

  const m = mledozeMap[code.toUpperCase()];
  const d = dr5hnMap[code.toUpperCase()];

  if (!m && !d) {
    console.error(`No data in either DB for code ${code} (${name})`);
    return;
  }

  const iso2 = code.toUpperCase();
  const iso3 = (m ? m.cca3 : d.iso3).toUpperCase();

  const name_tr_official = m && m.translations && m.translations.tur ? m.translations.tur.official : null;
  const name_tr_common = m && m.translations && m.translations.tur ? m.translations.tur.common : null;
  const dr5hn_tr = d && d.translations ? d.translations.tr : null;

  const name_en_official = m && m.name ? m.name.official : (d ? d.name : null);
  const name_en_common = m && m.name ? m.name.common : (d ? d.name : null);

  const name_tr = name_tr_official || dr5hn_tr || name;
  const name_en = name_en_official || name_en_common;

  const short_name_tr = name_tr_common || dr5hn_tr || name;
  const short_name_en = name_en_common || name_en_official;

  const population = d ? d.population : (m ? m.population : 0);
  const flag_url = m ? m.flag : (d ? d.emoji : '');

  compiledCountries.push({
    iso2,
    iso3,
    name_tr,
    name_en,
    short_name_tr,
    short_name_en,
    population,
    flag_url
  });
});

console.log(`Compiled ${compiledCountries.length} countries.`);

fs.writeFileSync(path.join(__dirname, 'compiled_countries.json'), JSON.stringify(compiledCountries, null, 2));

const sqlFilePath = path.join(path.resolve(__dirname, '..'), 'supabase_migration_countries.sql');

let sqlContent = `-- ============================================================
-- COUNTRIES TABLE & SEED DATA - SUPABASE MIGRATION
-- ============================================================

-- Create countries table if not exists
CREATE TABLE IF NOT EXISTS countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    iso2 VARCHAR(10) UNIQUE,
    iso3 VARCHAR(10) UNIQUE,
    name_tr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    short_name_tr VARCHAR(255) NOT NULL,
    short_name_en VARCHAR(255) NOT NULL,
    population BIGINT,
    flag_url TEXT,
    play_store_enabled BOOLEAN DEFAULT true NOT NULL,
    news_enabled BOOLEAN DEFAULT false NOT NULL,
    simulation_enabled BOOLEAN DEFAULT false NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON countries(iso2);
CREATE INDEX IF NOT EXISTS idx_countries_iso3 ON countries(iso3);

-- Recreate trigger function if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_countries_updated_at ON countries;
CREATE TRIGGER update_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data for countries
`;

compiledCountries.forEach(c => {
  const escapeSql = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'string') {
      return `'${val.replace(/'/g, "''")}'`;
    }
    return val;
  };

  const iso2 = escapeSql(c.iso2);
  const iso3 = escapeSql(c.iso3);
  const name_tr = escapeSql(c.name_tr);
  const name_en = escapeSql(c.name_en);
  const short_name_tr = escapeSql(c.short_name_tr);
  const short_name_en = escapeSql(c.short_name_en);
  const population = c.population;
  const flag_url = escapeSql(c.flag_url);

  if (c.iso2 === null) {
    sqlContent += `
-- Insert or update ${c.name_tr} (No ISO code)
INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
SELECT ${iso2}, ${iso3}, ${name_tr}, ${name_en}, ${short_name_tr}, ${short_name_en}, ${population}, ${flag_url}, true, false, false, 0
WHERE NOT EXISTS (
    SELECT 1 FROM countries WHERE name_tr = ${name_tr}
);

UPDATE countries SET
  name_en = ${name_en},
  short_name_tr = ${short_name_tr},
  short_name_en = ${short_name_en},
  population = ${population},
  flag_url = ${flag_url}
WHERE name_tr = ${name_tr};
`;
  } else {
    sqlContent += `
INSERT INTO countries (iso2, iso3, name_tr, name_en, short_name_tr, short_name_en, population, flag_url, play_store_enabled, news_enabled, simulation_enabled, priority)
VALUES (${iso2}, ${iso3}, ${name_tr}, ${name_en}, ${short_name_tr}, ${short_name_en}, ${population}, ${flag_url}, true, false, false, 0)
ON CONFLICT (iso2) DO UPDATE SET
  iso3 = EXCLUDED.iso3,
  name_tr = EXCLUDED.name_tr,
  name_en = EXCLUDED.name_en,
  short_name_tr = EXCLUDED.short_name_tr,
  short_name_en = EXCLUDED.short_name_en,
  population = EXCLUDED.population,
  flag_url = EXCLUDED.flag_url;
`;
  }
});

fs.writeFileSync(sqlFilePath, sqlContent);
console.log(`Successfully generated updated SQL migration file at: ${sqlFilePath}`);
