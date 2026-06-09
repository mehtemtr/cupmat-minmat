const fs = require('fs');
const path = require('path');

const dictionariesDir = path.join(__dirname, '..', 'dictionaries');

// Mappings for typeFantasy key updates
const typeFantasyUpdates = {
  tr: "Taktik Düello",
  en: "Tactics Duels",
  de: "Taktik-Duelle",
  es: "Duelos Tácticos",
  fr: "Duels Tactiques",
  it: "Duelli Tattici",
  pt: "Duelos Táticos",
  ko: "전술 듀얼",
  ar: "مبارزات التكتيك"
};

// Localized replacements for the 'fantasy' block
const localizations = {
  de: {
    title: "CupMat Taktik-Liga",
    subtitle: "Stellen Sie Ihr eigenes Eliteteam zusammen, schalten Sie Auswechselspieler und zusätzliche Teamrechte durch mathematische Erfolge frei und treten Sie in direkten Duellen an!",
    tabBuilder: "Aufstellung",
    tabStandings: "Tabelle",
    tabFixtures: "Spielplan & Live",
    allTeams: "Alle Teams",
    goalkeeper: "Torwart",
    defender: "Abwehr",
    midfielder: "Mittelfeld",
    forward: "Sturm",
    benchUnit: "Ersatzspieler",
    teamNamePlaceholder: "Teamnamen eingeben...",
    selectBtn: "Auswählen"
  },
  es: {
    title: "Liga de Tácticas CupMat",
    subtitle: "¡Crea tu propio equipo de élite, desbloquea suplentes y derechos de equipo adicionales con tus logros matemáticos y compite en duelos directos!",
    tabBuilder: "Alineación",
    tabStandings: "Clasificación",
    tabFixtures: "Calendario y En Vivo",
    allTeams: "Todos los Equipos",
    goalkeeper: "Portero",
    defender: "Defensa",
    midfielder: "Centrocampista",
    forward: "Delantero",
    benchUnit: "Suplente",
    teamNamePlaceholder: "Introduzca el nombre del equipo...",
    selectBtn: "Seleccionar"
  },
  fr: {
    title: "Ligue de Tactique CupMat",
    subtitle: "Composez votre propre équipe d'élite, débloquez des remplaçants et des droits d'équipe supplémentaires grâce à vos réussites en mathématiques, et affrontez vos adversaires en duels directs !",
    tabBuilder: "Composition",
    tabStandings: "Classement",
    tabFixtures: "Calendrier & En Direct",
    allTeams: "Toutes les Équipes",
    goalkeeper: "Gardien",
    defender: "Défenseur",
    midfielder: "Milieu",
    forward: "Attaquant",
    benchUnit: "Remplaçant",
    teamNamePlaceholder: "Entrez le nom de l'équipe...",
    selectBtn: "Sélectionner"
  },
  it: {
    title: "Lega Tattica CupMat",
    subtitle: "Crea la tua squadra d'élite, sblocca panchina e diritti per squadre extra con i tuoi successi in matematica e gareggia in duelli diretti!",
    tabBuilder: "Formazione",
    tabStandings: "Classifica",
    tabFixtures: "Calendario & Dal Vivo",
    allTeams: "Tutte le Squadre",
    goalkeeper: "Portiere",
    defender: "Difensore",
    midfielder: "Centrocampista",
    forward: "Attaccante",
    benchUnit: "Panchina",
    teamNamePlaceholder: "Inserisci il nome della squadra...",
    selectBtn: "Seleziona"
  },
  pt: {
    title: "Liga de Táticas CupMat",
    subtitle: "Monte sua própria equipe de elite, desbloqueie reservas e direitos de equipes adicionais com suas conquistas matemáticas e dispute duelos diretos!",
    tabBuilder: "Escalação",
    tabStandings: "Classificação",
    tabFixtures: "Calendário e Ao Vivo",
    allTeams: "Todas as Equipes",
    goalkeeper: "Goleiro",
    defender: "Defensor",
    midfielder: "Meia",
    forward: "Atacante",
    benchUnit: "Reserva",
    teamNamePlaceholder: "Digite o nome da equipe...",
    selectBtn: "Selecionar"
  },
  ko: {
    title: "CupMat 전술 리그",
    subtitle: "나만의 엘리트 팀을 구성하고, 수학 미션을 해결하여 후보 선수와 추가 팀 권한을 획득하며, 1대1 전술 듀얼에서 경쟁하세요!",
    tabBuilder: "라인업",
    tabStandings: "순위",
    tabFixtures: "경기 일정 & 라이브",
    allTeams: "모든 팀",
    goalkeeper: "골키퍼",
    defender: "수비수",
    midfielder: "미드필더",
    forward: "공격수",
    benchUnit: "후보",
    teamNamePlaceholder: "팀 이름을 입력하세요...",
    selectBtn: "선택"
  },
  ar: {
    title: "دوري تكتيكات CupMat",
    subtitle: "قم ببناء فريق النخبة الخاص بك، وافتح مقاعد البدلاء وحقوق الفريق الإضافية من خلال إنجازاتك في الرياضيات، وتنافس في مبارزات مباشرة!",
    tabBuilder: "التشكيلة",
    tabStandings: "الترتيب",
    tabFixtures: "المباريات والمباشر",
    allTeams: "جميع الفرق",
    goalkeeper: "حارس المرمى",
    defender: "مدافع",
    midfielder: "لاعب وسط",
    forward: "مهاجم",
    benchUnit: "بديل",
    teamNamePlaceholder: "أدخل اسم الفريق...",
    selectBtn: "اختر"
  }
};

function main() {
  // 1. Read en.json to get base fantasy block
  const enPath = path.join(dictionariesDir, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const baseFantasyBlock = enData.fantasy;

  const files = fs.readdirSync(dictionariesDir);

  files.forEach(file => {
    if (!file.endsWith('.json')) return;
    const lang = file.split('.')[0];
    const filePath = path.join(dictionariesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Processing: ${file}`);

    // Update typeFantasy
    if (content.leagues && typeFantasyUpdates[lang]) {
      content.leagues.typeFantasy = typeFantasyUpdates[lang];
    }

    // Update or inject fantasy block
    if (lang === 'tr') {
      // tr.json already has fantasy block, update typeFantasy and some values
      content.fantasy.teaserIntroTitle = "Taktik Ligi'nde Sizi Neler Bekliyor?";
      content.fantasy.teaserTitle = "Taktik Ligi {time}'te Açılıyor!";
      content.fantasy.teaserLiveBadge = "Taktik Ligi Tanıtımı Yayında";
      content.fantasy.title = "CupMat Taktik Ligi";
    } else if (lang === 'en') {
      // en.json already has fantasy block, just ensure it uses tactics
      content.fantasy.title = "CupMat Tactics League";
    } else {
      // Other 7 languages: create localized fantasy block from English base
      const localizedBlock = JSON.parse(JSON.stringify(baseFantasyBlock));
      
      // Apply localized replacements
      const replacements = localizations[lang];
      if (replacements) {
        Object.keys(replacements).forEach(key => {
          localizedBlock[key] = replacements[key];
        });
      }

      // Do global text replaces in the block where "fantasy" is mentioned
      Object.keys(localizedBlock).forEach(key => {
        if (typeof localizedBlock[key] === 'string') {
          // Replace "Fantasy" with "Tactics" or "tactical" for other keys
          localizedBlock[key] = localizedBlock[key]
            .replace(/Fantasy League/g, 'Tactics League')
            .replace(/fantasy league/g, 'tactics league')
            .replace(/Fantasy/g, 'Tactics')
            .replace(/fantasy/g, 'tactics');
        }
      });

      // Special handling for nested stages object
      if (localizedBlock.stages) {
        // e.g. "1st Matchday (Group)"
      }

      content.fantasy = localizedBlock;
    }

    // Save updated JSON
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Successfully updated ${file}`);
  });
}

main();
