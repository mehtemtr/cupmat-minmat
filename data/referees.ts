export interface Referee {
  id: string;
  name: string;
  age: number;
  image: string; // Flag CDN image
  yellowCardsAvg: number;
  redCardsAvg: number;
  country: Record<string, string>;
  bio: Record<string, string>;
  importantMatches: Record<string, string[]>;
}

export const REFEREES: Referee[] = [
  {
    id: "marciniak",
    name: "Szymon Marciniak",
    age: 45,
    image: "https://flagcdn.com/w320/pl.png",
    yellowCardsAvg: 4.35,
    redCardsAvg: 0.18,
    country: {
      tr: "Polonya",
      en: "Poland",
      es: "Polonia",
      fr: "Pologne",
      de: "Polen",
      pt: "Polónia",
      it: "Polonia",
      ko: "폴란드",
      ar: "بولندا"
    },
    bio: {
      tr: "Szymon Marciniak, dünyanın en prestijli hakemlerinden biridir. Atletik yapısı, oyuncularla kurduğu net iletişim ve baskı anlarında sergilediği sakinlikle tanınır. 2022 FIFA Dünya Kupası finalini yöneterek tarihe geçmiştir.",
      en: "Szymon Marciniak is one of the most prestigious referees in the world. He is known for his athletic build, clear communication with players, and calm composure under extreme pressure. He made history by officiating the 2022 FIFA World Cup Final.",
      es: "Szymon Marciniak es uno de los árbitros más prestigiosos del mundo. Es conocido por su constitución atlética, su comunicación clara con los jugadores y su calma bajo una presión extrema. Hizo historia al arbitrar la final de la Copa del Mundo 2022.",
      fr: "Szymon Marciniak est l'un des arbitres les plus prestigieux au monde. Il est réputé pour sa condition athlétique, son dialogue clair avec les joueurs et son calme olympien sous la pression. Il a arbitré la finale de la Coupe du Monde de la FIFA 2022.",
      de: "Szymon Marciniak ist einer der renommiertesten Schiedsrichter weltweit. Er ist bekannt für seine Athletik, klare Kommunikation mit den Spielern und eiserne Ruhe unter Druck. Er leitete das legendäre WM-Finale 2022.",
      pt: "Szymon Marciniak é um dos árbitros mais prestigiados do mundo. É conhecido pelo seu físico atlético, comunicação clara com os jogadores e compostura calma sob pressão extrema. Entrou para a história ao apitar a Final do Campeonato do Mundo FIFA 2022.",
      it: "Szymon Marciniak è uno degli arbitri più prestigiosi al mondo. È noto per la sua costituzione atletica, la comunicazione chiara con i giocatori e la calma sotto pressione. Ha fatto la storia dirigendo la finale dei Mondiali FIFA 2022.",
      ko: "시몬 마르치니아크는 세계에서 가장 권위 있는 심판 중 한 명입니다. 강인한 체력, 선수들과의 명확한 의사소통, 극도의 압박감 속에서도 침착함을 유지하는 것으로 유명합니다. 그는 2022년 FIFA 월드컵 결승전 주심을 맡으며 역사를 썼습니다.",
      ar: "سيمون مارسينياك هو أحد أكثر الحكام شهرة في العالم. وهو معروف ببنيته الرياضية وتواصله الواضح مع اللاعبين وهدوئه الشديد تحت الضغط. دخل التاريخ بإدارته لنهائي كأس العالم فيفا 2022."
    },
    importantMatches: {
      tr: [
        "2022 FIFA Dünya Kupası Finali (Arjantin - Fransa)",
        "2023 UEFA Şampiyonlar Ligi Finali (Man. City - Inter)",
        "2018 UEFA Süper Kupası (Real Madrid - Atlético)"
      ],
      en: [
        "2022 FIFA World Cup Final (Argentina vs France)",
        "2023 UEFA Champions League Final (Man. City vs Inter)",
        "2018 UEFA Super Cup (Real Madrid vs Atlético)"
      ],
      es: [
        "Final de la Copa Mundial FIFA 2022 (Argentina vs Francia)",
        "Final de la UEFA Champions League 2023 (Man. City vs Inter)",
        "Supercopa de la UEFA 2018 (Real Madrid vs Atlético)"
      ],
      fr: [
        "Finale de la Coupe du Monde de la FIFA 2022 (Argentine vs France)",
        "Finale de la Ligue des Champions de l'UEFA 2023 (Man. City vs Inter)",
        "Supercoupe de l'UEFA 2018 (Real Madrid vs Atlético)"
      ],
      de: [
        "FIFA WM-Finale 2022 (Argentinien - Frankreich)",
        "UEFA Champions League Finale 2023 (Man. City - Inter)",
        "UEFA Super Cup 2018 (Real Madrid - Atlético)"
      ],
      pt: [
        "Final do Campeonato do Mundo FIFA 2022 (Argentina vs França)",
        "Final da Liga dos Campeões da UEFA 2023 (Man. City vs Inter)",
        "Supertaça da UEFA 2018 (Real Madrid vs Atlético)"
      ],
      it: [
        "Finale dei Mondiali FIFA 2022 (Argentina vs Francia)",
        "Finale della UEFA Champions League 2023 (Man. City vs Inter)",
        "Supercoppa UEFA 2018 (Real Madrid vs Atlético)"
      ],
      ko: [
        "2022 FIFA 월드컵 결승전 (아르헨티나 대 프랑스)",
        "2023 UEFA 챔피언스리그 결승전 (맨시티 대 인터밀란)",
        "2018 UEFA 슈퍼컵 (레알 마드리드 대 아틀레티코)"
      ],
      ar: [
        "نهائي كأس العالم فيفا 2022 (الأرجنتين ضد فرنسا)",
        "نهائي دوري أبطال أوروبا 2023 (مانشستر سيتي ضد إنتر)",
        "كأس السوبر الأوروبي 2018 (ريال مدريد ضد أتلتيكو)"
      ]
    }
  },
  {
    id: "zwayer",
    name: "Felix Zwayer",
    age: 45,
    image: "https://flagcdn.com/w320/de.png",
    yellowCardsAvg: 4.12,
    redCardsAvg: 0.14,
    country: {
      tr: "Almanya",
      en: "Germany",
      es: "Alemania",
      fr: "Allemagne",
      de: "Deutschland",
      pt: "Alemanha",
      it: "Germania",
      ko: "독일",
      ar: "ألمانيا"
    },
    bio: {
      tr: "Felix Zwayer, Almanya'nın en tecrübeli Bundesliga ve UEFA elit kategori hakemlerinden biridir. Sahadaki kararlı yönetimi, taktiksel oyun anlayışı ve sakinliği ile tanınır. 2023 UEFA Uluslar Ligi finali de dahil olmak üzere birçok üst düzey kulüp ve milli takım müsabakasını yönetmiştir.",
      en: "Felix Zwayer is one of Germany's most experienced Bundesliga and UEFA Elite category referees. He is known for his decisive management on the pitch, tactical game understanding, and composure. He has refereed many top-level club and national team matches, including the 2023 UEFA Nations League Final.",
      es: "Felix Zwayer es uno de los árbitros de la Bundesliga y de la categoría Elite de la UEFA más experimentados de Alemania. Destaca por su arbitraje firme, su comprensión táctica del juego y su templanza.",
      fr: "Felix Zwayer est l'un des arbitres de Bundesliga et de la catégorie UEFA Elite les plus expérimentés d'Allemagne. Il est réputé pour son autorité sur le terrain, sa lecture tactique et son calme.",
      de: "Felix Zwayer ist einer der erfahrensten Bundesliga- und UEFA-Elite-Schiedsrichter Deutschlands. Er ist bekannt für seine konsequente Spielleitung, sein taktisches Verständnis und seine Gelassenheit. Er leitete unter anderem das UEFA Nations League Finale 2023.",
      pt: "Felix Zwayer é um dos árbitros mais experientes da Bundesliga e da categoria de Elite da UEFA na Alemanha. É conhecido pela sua gestão decisiva em campo, compreensão tática do jogo e compostura.",
      it: "Felix Zwayer è uno degli arbitri più esperti della Bundesliga e della categoria UEFA Elite in Germania. È noto per la sua direzione decisa in campo, la comprensione tattica del gioco e la pacatezza.",
      ko: "펠릭스 츠바이어는 독일 분데스리가 및 UEFA 엘리트 등급에서 가장 경험이 풍부한 심판 중 한 명입니다. 그는 경기장에서의 단호한 판정, 전술적 이해도, 그리고 침착함으로 잘 알려져 있습니다.",
      ar: "فيليكس زواير هو أحد أكثر حكام البوندسليجا وفئة النخبة في اليويفا خبرة في ألمانيا. وهو معروف بإدارته الحاسمة في الملعب، وفهمه التكتيكي للمباراة وهدوئه."
    },
    importantMatches: {
      tr: [
        "2023 UEFA Uluslar Ligi Finali (Hırvatistan - İspanya)",
        "2024 UEFA Euro Yarı Finali (Hollanda - İngiltere)",
        "Çok sayıda UEFA Şampiyonlar Ligi ve Bundesliga Derbisi"
      ],
      en: [
        "2023 UEFA Nations League Final (Croatia vs Spain)",
        "2024 UEFA Euro Semi-Final (Netherlands vs England)",
        "Numerous UEFA Champions League and Bundesliga Derbies"
      ],
      es: [
        "Final de la UEFA Nations League 2023 (Croacia vs España)",
        "Semifinal de la UEFA Euro 2024 (Países Bajos vs Inglaterra)",
        "Numerosos partidos de UEFA Champions League y derbis de la Bundesliga"
      ],
      fr: [
        "Finale de la Ligue des Nations de l'UEFA 2023 (Croatie vs Espagne)",
        "Demi-finale de l'UEFA Euro 2024 (Pays-Bas vs Angleterre)",
        "Nombreux matchs de Ligue des Champions et derbys de Bundesliga"
      ],
      de: [
        "UEFA Nations League Finale 2023 (Kroatien - Spanien)",
        "UEFA Euro Halbfinale 2024 (Niederlande - England)",
        "Zahlreiche UEFA Champions League und Bundesliga Derbys"
      ],
      pt: [
        "Final da Liga das Nações da UEFA 2023 (Croácia vs Espanha)",
        "Semifinal do UEFA Euro 2024 (Países Baixos vs Inglaterra)",
        "Vários Derbis da UEFA Champions League e da Bundesliga"
      ],
      it: [
        "Finale della UEFA Nations League 2023 (Croazia vs Spagna)",
        "Semifinale di UEFA Euro 2024 (Paesi Bassi vs Inghilterra)",
        "Numerosi derby di UEFA Champions League e Bundesliga"
      ],
      ko: [
        "2023 UEFA 네이션스리그 결승전 (크로아티아 대 스페인)",
        "2024 UEFA 유로 준결승전 (네덜란드 대 잉글랜드)",
        "다수의 UEFA 챔피언스리그 및 분데스리가 더비 경기"
      ],
      ar: [
        "نهائي دوري الأمم الأوروبية 2023 (كرواتيا ضد إسبانيا)",
        "نصف نهائي يورو 2024 (هولندا ضد إنجلترا)",
        "العديد من مباريات دوري أبطال أوروبا وديربيات البوندسليجا"
      ]
    }
  },
  {
    id: "turpin",
    name: "Clément Turpin",
    age: 43,
    image: "https://flagcdn.com/w320/fr.png",
    yellowCardsAvg: 3.85,
    redCardsAvg: 0.21,
    country: {
      tr: "Fransa",
      en: "France",
      es: "Francia",
      fr: "France",
      de: "Frankreich",
      pt: "França",
      it: "Francia",
      ko: "프랑스",
      ar: "فرنسا"
    },
    bio: {
      tr: "Fransız futbolunun en güvendiği isim olan Clément Turpin, sahada otoriter duruşu ve soğukkanlılığıyla tanınır. UEFA organizasyonlarında en yüksek puanlı hakemlerden biri olup, 2022 Şampiyonlar Ligi finalini yönetmiştir.",
      en: "Clément Turpin, the most trusted name in French refereeing, is known for his authoritative stance on the field and calm demeanor. He is one of the highest-rated referees in UEFA competitions.",
      es: "Clément Turpin, el árbitro más confiable de Francia, es conocido por su postura autoritaria en el campo y su comportamiento tranquilo. Es uno de los mejor valorados en las competiciones de la UEFA.",
      fr: "Clément Turpin, figure de proue de l'arbitrage français, est réputé pour son autorité naturelle et son calme. Il figure parmi les arbitres les mieux notés des compétitions de l'UEFA.",
      de: "Clément Turpin ist der profilierteste französische Schiedsrichter. Er ist bekannt für seine natürliche Autorität auf dem Platz und seine Gelassenheit. Er leitete unter anderem das Champions League Finale 2022.",
      pt: "Clément Turpin, o nome mais fiável da arbitragem francesa, é conhecido pela sua presença autoritária em campo e postura calma.",
      it: "Clément Turpin, il nome più affidabile dell'arbitraggio francese, è noto per la sua presenza autorevole sul campo e per il suo comportamento calmo.",
      ko: "프랑스 심판계에서 가장 신뢰받는 인물인 클레망 튀르팽은 경기장에서의 권위 있는 자태와 침착한 태도로 유명합니다.",
      ar: "كليمان توربان، الاسم الأكثر ثقة في التحكيم الفرنسي، معروف بموقفه السلطوي في الملعب وسلوكه الهادئ."
    },
    importantMatches: {
      tr: [
        "2022 UEFA Şampiyonlar Ligi Finali (Liverpool - Real Madrid)",
        "2021 UEFA Avrupa Ligi Finali (Villarreal - Man. United)",
        "2018 FIFA Dünya Kupası Grup Müsabakaları"
      ],
      en: [
        "2022 UEFA Champions League Final (Liverpool vs Real Madrid)",
        "2021 UEFA Europa League Final (Villarreal vs Man. United)",
        "2018 FIFA World Cup Group Matches"
      ],
      es: [
        "Final de la UEFA Champions League 2022 (Liverpool vs Real Madrid)",
        "Final de la UEFA Europa League 2021 (Villarreal vs Man. United)",
        "Partidos de la fase de grupos de la Copa Mundial FIFA 2018"
      ],
      fr: [
        "Finale de la Ligue des Champions de l'UEFA 2022 (Liverpool vs Real Madrid)",
        "Finale de la Ligue Europa de l'UEFA 2021 (Villarreal vs Man. United)",
        "Matchs de poule de la Coupe du Monde de la FIFA 2018"
      ],
      de: [
        "UEFA Champions League Finale 2022 (Liverpool - Real Madrid)",
        "UEFA Europa League Finale 2021 (Villarreal - Man. United)",
        "FIFA WM 2018 Gruppenspiele"
      ],
      pt: [
        "Final da UEFA Champions League 2022 (Liverpool vs Real Madrid)",
        "Final da UEFA Europa League 2021 (Villarreal vs Man. United)",
        "Jogos da Fase de Grupos do Campeonato do Mundo FIFA 2018"
      ],
      it: [
        "Finale della UEFA Champions League 2022 (Liverpool vs Real Madrid)",
        "Finale della UEFA Europa League 2021 (Villarreal vs Man. United)",
        "Partite dei gironi della Coppa del Mondo FIFA 2018"
      ],
      ko: [
        "2022 UEFA 챔피언스리그 결승전 (리버풀 대 레알 마드리드)",
        "2021 UEFA 유로파리그 결승전 (비야레알 대 맨유)",
        "2018 FIFA 월드컵 조별리그 경기"
      ],
      ar: [
        "نهائي دوري أبطال أوروبا 2022 (ليفربول ضد ريال مدريد)",
        "نهائي الدوري الأوروبي 2021 (فياريال ضد مانشستر يونايتد)",
        "مباريات المجموعات في كأس العالم فيفا 2018"
      ]
    }
  },
  {
    id: "taylor",
    name: "Anthony Taylor",
    age: 47,
    image: "https://flagcdn.com/w320/gb.png",
    yellowCardsAvg: 4.12,
    redCardsAvg: 0.15,
    country: {
      tr: "İngiltere",
      en: "England",
      es: "Inglaterra",
      fr: "Angleterre",
      de: "England",
      pt: "Inglaterra",
      it: "Inghilterra",
      ko: "영국",
      ar: "إنجلترا"
    },
    bio: {
      tr: "Anthony Taylor, Premier Lig'in en tecrübeli hakemlerindendir. Hızlı tempodaki İngiliz futbolunda kazandığı tecrübeyle ikili mücadelelerde oyunun devam etmesini desteklemesiyle ve kartlarına dengeli başvurmasıyla bilinir.",
      en: "Anthony Taylor is one of the most experienced referees in the Premier League. With experience gained in fast-paced English football, he is known for letting the game flow and using cards effectively.",
      es: "Anthony Taylor es uno de los árbitros más experimentados de la Premier League. Con su experiencia en el rápido fútbol inglés, destaca por dejar jugar y sancionar de manera equilibrada.",
      fr: "Anthony Taylor est l'un des arbitres les plus expérimentés de la Premier League. Rompu au rythme effréné du football anglais, il favorise la fluidité du jeu et utilise ses cartons avec parcimonie.",
      de: "Anthony Taylor gehört zu den erfahrensten Premier-League-Schiedsrichtern. Durch seine Erfahrung im schnellen englischen Fußball lässt er das Spiel gerne laufen und behält stets die Kontrolle.",
      pt: "Anthony Taylor é um dos árbitros mais experientes da Premier League. Com larga bagagem no futebol inglês, privilegia a fluidez de jogo.",
      it: "Anthony Taylor è uno degli arbitri più esperti della Premier League. Con l'esperienza acquisita nel veloce calcio inglese, preferisce far scorrere il gioco.",
      ko: "앤서니 테일러는 프리미어리그에서 가장 경험이 많은 심판 중 한 명입니다. 빠른 속도의 잉글랜드 축구에서 얻은 경험을 바탕으로 거친 몸싸움에서도 경기를 매끄럽게 진행하는 것으로 유명합니다.",
      ar: "أنطوني تايلور هو أحد أكثر الحكام خبرة في الدوري الإنجليزي الممتاز. مع الخبرة التي اكتسبها في كرة القدم الإنجليزية سريعة الوتيرة، فهو معروف بالسماح باستمرار اللعب."
    },
    importantMatches: {
      tr: [
        "2023 UEFA Avrupa Ligi Finali (Sevilla - Roma)",
        "2021 UEFA Uluslar Ligi Finali (İspanya - Fransa)",
        "2020 UEFA Süper Kupası (Bayern Münih - Sevilla)"
      ],
      en: [
        "2023 UEFA Europa League Final (Sevilla vs Roma)",
        "2021 UEFA Nations League Final (Spain vs France)",
        "2020 UEFA Super Cup (Bayern Munich vs Sevilla)"
      ],
      es: [
        "Final de la UEFA Europa League 2023 (Sevilla vs Roma)",
        "Final de la UEFA Nations League 2021 (España vs Francia)",
        "Supercopa de la UEFA 2020 (Bayern de Múnich vs Sevilla)"
      ],
      fr: [
        "Finale de la Ligue Europa de l'UEFA 2023 (Séville vs Roma)",
        "Finale de la Ligue des Nations de l'UEFA 2021 (Espagne vs France)",
        "Supercoupe de l'UEFA 2020 (Bayern Munich vs Séville)"
      ],
      de: [
        "UEFA Europa League Finale 2023 (Sevilla - Roma)",
        "UEFA Nations League Finale 2021 (Spanien - Frankreich)",
        "UEFA Super Cup 2020 (Bayern München - Sevilla)"
      ],
      pt: [
        "Final da UEFA Europa League 2023 (Sevilha vs Roma)",
        "Final da Liga das Nações da UEFA 2021 (Espanha vs França)",
        "Supertaça da UEFA 2020 (Bayern Munique vs Sevilha)"
      ],
      it: [
        "Finale della UEFA Europa League 2023 (Siviglia vs Roma)",
        "Finale della UEFA Nations League 2021 (Spagna vs Francia)",
        "Supercoppa UEFA 2020 (Bayern Monaco vs Siviglia)"
      ],
      ko: [
        "2023 UEFA 유로파리그 결승전 (세비야 대 로마)",
        "2021 UEFA 네이션스리그 결승전 (스페인 대 프랑스)",
        "2020 UEFA 슈퍼컵 (바이에른 뮌헨 대 세비야)"
      ],
      ar: [
        "نهائي الدوري الأوروبي 2023 (إشبيلية ضد روما)",
        "نهائي دوري الأمم الأوروبية 2021 (إسبانيا ضد فرنسا)",
        "كأس السوبر الأوروبي 2020 (بايرن ميونخ ضد إشبيلية)"
      ]
    }
  },
  {
    id: "makkelie",
    name: "Danny Makkelie",
    age: 43,
    image: "https://flagcdn.com/w320/nl.png",
    yellowCardsAvg: 3.90,
    redCardsAvg: 0.16,
    country: {
      tr: "Hollanda",
      en: "Netherlands",
      es: "Países Bajos",
      fr: "Pays-Bas",
      de: "Niederlande",
      pt: "Países Baixos",
      it: "Paesi Bassi",
      ko: "네덜란드",
      ar: "هولندا"
    },
    bio: {
      tr: "Danny Makkelie, Hollanda'nın en başarılı hakemlerinden biridir. Polislik kariyerinin de getirdiği otoriteyle, sahada oyun kontrolünü elinde tutması ve VAR sistemindeki derin tecrübesiyle bilinir.",
      en: "Danny Makkelie is one of the Netherlands' most successful referees. With authority from his police career, he is known for his game control and deep experience with the VAR system.",
      es: "Danny Makkelie es uno de los árbitros más exitosos de los Países Bajos. Con la autoridad de su carrera policial, destaca por su control del juego y su amplia experiencia con el VAR.",
      fr: "Danny Makkelie est l'un des arbitres les plus performants des Pays-Bas. Reconnu pour son autorité naturelle, sa police de terrain et son expertise majeure du système VAR.",
      de: "Danny Makkelie ist einer der erfolgreichsten Schiedsrichter der Niederlande. Mit der Autorität aus seiner Polizeikarriere ist er für seine Spielkontrolle ve VAR-Erfahrung bekannt.",
      pt: "Danny Makkelie é um dos árbitros mais bem-sucedidos dos Países Baixos. Aliando a autoridade da sua carreira policial, destaca-se pelo controlo do jogo.",
      it: "Danny Makkelie è uno degli arbitri olandesi di maggior successo. Forte dell'autorità derivante dalla sua carriera in polizia, spicca per la sua gestione di gara.",
      ko: "대니 마켈리는 네덜란드에서 가장 성공적인 심판 중 한 명입니다. 경찰 경력에서 나오는 권위와 더불어 경기 조율 능력 및 VAR 시스템에 대한 깊은 노하우를 지니고 있습니다.",
      ar: "داني ماكيلي هو أحد أكثر الحكام نجاحًا في هولندا. مع السلطة المستمدة من مسيرته الشرطية، فهو معروف بالسيطرة على المباريات وخبرته العميقة في تقنية الفيديو."
    },
    importantMatches: {
      tr: [
        "2020 UEFA Avrupa Ligi Finali (Sevilla - Inter)",
        "2024 UEFA Şampiyonlar Ligi Yarı Finali",
        "2020 ve 2024 UEFA Euro Müsabakaları"
      ],
      en: [
        "2020 UEFA Europa League Final (Sevilla vs Inter)",
        "2024 UEFA Champions League Semi-Final",
        "2020 & 2024 UEFA Euro Matches"
      ],
      es: [
        "Final de la UEFA Europa League 2020 (Sevilla vs Inter)",
        "Semifinal de la UEFA Champions League 2024",
        "Partidos de la UEFA Euro 2020 y 2024"
      ],
      fr: [
        "Finale de la Ligue Europa de l'UEFA 2020 (Séville vs Inter)",
        "Demi-finale de la Ligue des Champions de l'UEFA 2024",
        "Matchs de l'UEFA Euro 2020 & 2024"
      ],
      de: [
        "UEFA Europa League Finale 2020 (Sevilla - Inter)",
        "UEFA Champions League Halbfinale 2024",
        "UEFA Euro 2020 und 2024 Spiele"
      ],
      pt: [
        "Final da UEFA Europa League 2020 (Sevilha vs Inter)",
        "Semifinal da UEFA Champions League 2024",
        "Jogos do UEFA Euro 2020 e 2024"
      ],
      it: [
        "Finale della UEFA Europa League 2020 (Siviglia vs Inter)",
        "Semifinale della UEFA Champions League 2024",
        "Partite di UEFA Euro 2020 e 2024"
      ],
      ko: [
        "2020 UEFA 유로파리그 결승전 (세비야 대 인터밀란)",
        "2024 UEFA 챔피언스리그 준결승전",
        "2020 및 2024 UEFA 유로 경기들"
      ],
      ar: [
        "نهائي الدوري الأوروبي 2020 (إشبيلية ضد إنتر)",
        "نصف نهائي دوري أبطال أوروبا 2024",
        "مباريات يورو 2020 ويورو 2024"
      ]
    }
  },
  {
    id: "vincic",
    name: "Slavko Vinčić",
    age: 46,
    image: "https://flagcdn.com/w320/si.png",
    yellowCardsAvg: 4.05,
    redCardsAvg: 0.17,
    country: {
      tr: "Slovenya",
      en: "Slovenia",
      es: "Eslovenia",
      fr: "Slovénie",
      de: "Slowenien",
      pt: "Eslovénia",
      it: "Slovenia",
      ko: "슬로베니아",
      ar: "سلوفينيا"
    },
    bio: {
      tr: "Slavko Vinčić, Slovenya'nın elit UEFA hakemidir. Sakin tavrı ve kritik anlarda doğru kararlarıyla tanınır. Birçok üst düzey UEFA finali ve uluslararası turnuva tecrübesine sahiptir.",
      en: "Slavko Vinčić is Slovenia's elite UEFA referee. Known for his calm attitude and accurate decisions in critical moments, he has extensive experience in top UEFA finals.",
      es: "Slavko Vinčić es el árbitro de élite de la UEFA de Eslovenia. Es conocido por su actitud tranquila, serenidad y sus decisiones acertadas en momentos de máxima tensión.",
      fr: "Slavko Vinčić est l'arbitre d'élite de l'UEFA en Slovénie. Connu pour son calme, sa prestance et ses décisions précises dans les moments critiques.",
      de: "Slavko Vinčić ist Sloweniens UEFA-Elite-Schiedsrichter. Bekannt für seine gelassene Art, Ausgeglichenheit und präzisen Entscheidungen in kritischen Momenten.",
      pt: "Slavko Vinčić é um árbitro de elite da UEFA na Eslovénia. Destaca-se pela serenidade e decisões assertivas em momentos cruciais.",
      it: "Slavko Vinčić è un arbitro d'élite sloveno UEFA. Rinomato per il suo comportamento calmo e per le decisioni precise nei momenti chiave.",
      ko: "슬라브코 빈치치는 슬로베니아의 엘리트 UEFA 심판입니다. 차분한 태도와 중요한 순간에서의 정확한 판정으로 이름나 있으며, 챔피언스리그 결승전 등 다양한 결승 경기를 조율한 풍부한 경력이 있습니다.",
      ar: "سلافكو فينتشيتش هو حكم النخبة في اليويفا من سلوفينيا. وهو معروف بموقفه الهادئ وقراراته الدقيقة في اللحظات الحاسمة."
    },
    importantMatches: {
      tr: [
        "2024 UEFA Şampiyonlar Ligi Finali (Dortmund - Real Madrid)",
        "2022 UEFA Avrupa Ligi Finali (Frankfurt - Rangers)",
        "2024 UEFA Euro Yarı Finali"
      ],
      en: [
        "2024 UEFA Champions League Final (Dortmund vs Real Madrid)",
        "2022 UEFA Europa League Final (Frankfurt vs Rangers)",
        "2024 UEFA Euro Semi-Final"
      ],
      es: [
        "Final de la UEFA Champions League 2024 (Dortmund vs Real Madrid)",
        "Final de la UEFA Europa League 2022 (Frankfurt vs Rangers)",
        "Semifinal de la UEFA Euro 2024"
      ],
      fr: [
        "Finale de la Ligue des Champions de l'UEFA 2024 (Dortmund vs Real Madrid)",
        "Finale de la Ligue Europa de l'UEFA 2022 (Frankfurt vs Rangers)",
        "Demi-finale de l'UEFA Euro 2024"
      ],
      de: [
        "UEFA Champions League Finale 2024 (Dortmund - Real Madrid)",
        "UEFA Europa League Finale 2022 (Frankfurt - Rangers)",
        "UEFA Euro Halbfinale 2024"
      ],
      pt: [
        "Final da UEFA Champions League 2024 (Dortmund vs Real Madrid)",
        "Final da UEFA Europa League 2022 (Frankfurt vs Rangers)",
        "Semifinal do UEFA Euro 2024"
      ],
      it: [
        "Finale della UEFA Champions League 2024 (Dortmund vs Real Madrid)",
        "Finale della UEFA Europa League 2022 (Frankfurt vs Rangers)",
        "Semifinale di UEFA Euro 2024"
      ],
      ko: [
        "2024 UEFA 챔피언스리그 결승전 (도르트문트 대 레알 마드리드)",
        "2022 UEFA 유로파리그 결승전 (프랑크푸르트 대 레인저스)",
        "2024 UEFA 유로 준결승전"
      ],
      ar: [
        "نهائي دوري أبطال أوروبا 2024 (دورتموند ضد ريال مدريد)",
        "نهائي الدوري الأوروبي 2022 (فرانكفورت ضد رينجرز)",
        "نصف نهائي يورو 2024"
      ]
    }
  },
  {
    id: "oliver",
    name: "Michael Oliver",
    age: 41,
    image: "https://flagcdn.com/w320/gb.png",
    yellowCardsAvg: 3.80,
    redCardsAvg: 0.13,
    country: {
      tr: "İngiltere",
      en: "England",
      es: "Inglaterra",
      fr: "Angleterre",
      de: "England",
      pt: "Inglaterra",
      it: "Inghilterra",
      ko: "영국",
      ar: "إنجلترا"
    },
    bio: {
      tr: "Michael Oliver, Premier Lig'in en çok güvenilen ve en genç yaşta elit kategoriye yükselen hakemlerinden biridir. Hızlı tempolu maçları mükemmel yönetmesi ve soğukkanlı duruşuyla bilinir.",
      en: "Michael Oliver is one of the Premier League's most trusted referees and one of the youngest to reach the elite category. Known for managing fast-paced games and composure.",
      es: "Michael Oliver es uno de los árbitros más confiables de la Premier League. Destaca por su templanza, calma y rapidez al gestionar partidos de altísima intensidad.",
      fr: "Michael Oliver est l'un des arbitres les plus fiables de la Premier League. Connu pour sa gestion sereine des matchs à rythme très soutenu.",
      de: "Michael Oliver ist einer der vertrauenswürdigsten Schiedsrichter der Premier League. Bekannt für seine souveräne Leitung von temporeichen Spielen und Coolness.",
      pt: "Michael Oliver é um dos árbitros mais respeitados da Premier League. Promovido cedo ao escalão de elite, prima pelo sangue-frio em jogos dinâmicos.",
      it: "Michael Oliver è uno degli arbitri più stimati della Premier League. Promosso giovanissimo nella categoria élite, brilla per la sua freddezza in gare veloci.",
      ko: "마이클 올리버는 프리미어리그에서 가장 신뢰받는 심판 중 한 명이자 최연소로 엘리트 등급에 합류한 심판입니다. 빠른 경기 전개 속에서도 평정심을 유지하며 경기를 관리하는 능력이 탁월합니다.",
      ar: "مايكل أوليفر هو أحد أكثر الحكام الموثوق بهم في الدوري الإنجليزي الممتاز وأحد أصغرهم سنًا الذين وصلوا إلى فئة النخبة. معروف بإدارة المباريات السريعة وهدوئه."
    },
    importantMatches: {
      tr: [
        "Çok sayıda Premier Lig Derbisi",
        "2022 UEFA Süper Kupası Finali (Real Madrid - Frankfurt)",
        "2024 UEFA Euro Çeyrek Finali"
      ],
      en: [
        "Numerous Premier League Derbies",
        "2022 UEFA Super Cup (Real Madrid vs Frankfurt)",
        "2024 UEFA Euro Quarter-Final"
      ],
      es: [
        "Numerosos derbis de la Premier League",
        "Supercopa de la UEFA 2022 (Real Madrid vs Frankfurt)",
        "Cuartos de final de la UEFA Euro 2024"
      ],
      fr: [
        "Nombreux derbys de Premier League",
        "Supercoupe de l'UEFA 2022 (Real Madrid vs Frankfurt)",
        "Quart de finale de l'UEFA Euro 2024"
      ],
      de: [
        "Zahlreiche Premier League Derbys",
        "UEFA Super Cup 2022 (Real Madrid - Frankfurt)",
        "UEFA Euro Viertelfinale 2024"
      ],
      pt: [
        "Vários Derbis da Premier League",
        "Supertaça da UEFA 2022 (Real Madrid vs Frankfurt)",
        "Quartos de final do UEFA Euro 2024"
      ],
      it: [
        "Numerosi derby di Premier League",
        "Supercoppa UEFA 2022 (Real Madrid vs Frankfurt)",
        "Quarti di finale di UEFA Euro 2024"
      ],
      ko: [
        "다수의 프리미어리그 더비 경기",
        "2022 UEFA 슈퍼컵 결승전 (레알 마드리드 대 프랑크푸르트)",
        "2024 UEFA 유로 8강전"
      ],
      ar: [
        "العديد من ديربيات الدوري الإنجليزي الممتاز",
        "نهائي كأس السوبر الأوروبي 2022 (ريال مدريد ضد فرانكفورت)",
        "ربع نهائي يورو 2024"
      ]
    }
  },
  {
    id: "letexier",
    name: "François Letexier",
    age: 37,
    image: "https://flagcdn.com/w320/fr.png",
    yellowCardsAvg: 3.95,
    redCardsAvg: 0.22,
    country: {
      tr: "Fransa",
      en: "France",
      es: "Francia",
      fr: "France",
      de: "Frankreich",
      pt: "França",
      it: "Francia",
      ko: "프랑스",
      ar: "فرنسا"
    },
    bio: {
      tr: "François Letexier, son dönemde yıldızı parlayan genç Fransız elit hakemdir. Modern yönetim tarzı ve yüksek temposuyla öne çıkar. UEFA Euro 2024 finalini yöneterek kalitesini kanıtlamıştır.",
      en: "François Letexier is a rising young French elite referee. He stands out with his modern management style and high work rate. He officiated the UEFA Euro 2024 Final.",
      es: "François Letexier es un joven árbitro francés de élite en ascenso. Destaca por su dinamismo, estilo moderno de juego fluido y arbitró con gran maestría la final de la UEFA Euro 2024.",
      fr: "François Letexier est un jeune arbitre élite français en pleine ascension. Il se distingue par son management moderne et dynamique, et a dirigé la finale de l'UEFA Euro 2024.",
      de: "François Letexier ist ein aufstrebender junger französischer Schiedsrichter. Er zeichnet sich durch seinen modernen Führungsstil aus und leitete das prestigeträchtige UEFA Euro 2024 Finale.",
      pt: "François Letexier é um jovem árbitro de elite francês em plena ascensão. Sobressai pelo estilo de arbitragem moderno e dirigiu a final do UEFA Euro 2024.",
      it: "François Letexier è un giovane arbitro d'élite francese in rapida ascesa. Si fa notare per il suo stile di gestione moderno e ha diretto la finale di UEFA Euro 2024.",
      ko: "프랑수아 르텍시에는 최근 두각을 나타내고 있는 젊은 프랑스 엘리트 심판입니다. 현대적인 경기 운영 방식과 높은 기동력으로 주목받고 있으며, UEFA 유로 2024 결승전을 매끄럽게 이끌어 실력을 입증했습니다.",
      ar: "فرانسوا ليتكسير هو حكم نخبة فرنسي شاب صاعد في الآونة الأخيرة. وهو يتميز بأسلوبه الإداري الحديث وإيقاعه العالي، وأدار نهائي يورو 2024."
    },
    importantMatches: {
      tr: [
        "2024 UEFA Euro Finali (İspanya - İngiltere)",
        "2023 UEFA Süper Kupası (Manchester City - Sevilla)",
        "2024 UEFA Şampiyonlar Ligi Çeyrek Finali"
      ],
      en: [
        "2024 UEFA Euro Final (Spain vs England)",
        "2023 UEFA Super Cup (Manchester City vs Sevilla)",
        "2024 UEFA Champions League Quarter-Final"
      ],
      es: [
        "Final de la UEFA Euro 2024 (España vs Inglaterra)",
        "Supercopa de la UEFA 2023 (Manchester City vs Sevilla)",
        "Cuartos de final de la UEFA Champions League 2024"
      ],
      fr: [
        "Finale de l'UEFA Euro 2024 (Espagne vs Angleterre)",
        "Supercoupe de l'UEFA 2023 (Manchester City vs Sevilla)",
        "Quart de finale de la Ligue des Champions de l'UEFA 2024"
      ],
      de: [
        "UEFA Euro Finale 2024 (Spanien - England)",
        "UEFA Super Cup 2023 (Manchester City - Sevilla)",
        "UEFA Champions League Viertelfinale 2024"
      ],
      pt: [
        "Final do UEFA Euro 2024 (Espanha vs Inglaterra)",
        "Supertaça da UEFA 2023 (Manchester City vs Sevilha)",
        "Quartos de final da UEFA Champions League 2024"
      ],
      it: [
        "Finale di UEFA Euro 2024 (Spagna vs Inghilterra)",
        "Supercoppa UEFA 2023 (Manchester City vs Siviglia)",
        "Quarti di finale di UEFA Champions League 2024"
      ],
      ko: [
        "2024 UEFA 유로 결승전 (스페인 대 잉글랜드)",
        "2023 UEFA 슈퍼컵 (맨체스터 시티 대 세비야)",
        "2024 UEFA 챔피언스리그 8강전"
      ],
      ar: [
        "نهائي يورو 2024 (إسبانيا ضد إنجلترا)",
        "كأس السوبر الأوروبي 2023 (مانشستر سيتي ضد إشبيلية)",
        "ربع نهائي دوري أبطال أوروبا 2024"
      ]
    }
  },
  {
    id: "kovacs",
    name: "István Kovács",
    age: 41,
    image: "https://flagcdn.com/w320/ro.png",
    yellowCardsAvg: 4.80,
    redCardsAvg: 0.28,
    country: {
      tr: "Romanya",
      en: "Romania",
      es: "Rumania",
      fr: "Roumanie",
      de: "Rumänien",
      pt: "Roménia",
      it: "Romania",
      ko: "루마니아",
      ar: "رومانيا"
    },
    bio: {
      tr: "István Kovács, Romanya'nın tecrübeli ve disiplinli elit hakemidir. Kartlarına sıkça başvurması ve tavizsiz yönetim tarzıyla bilinir.",
      en: "István Kovács is Romania's experienced and disciplined elite referee. He is known for his strict refereeing style and firm management.",
      es: "István Kovács es un árbitro rumano de élite, sumamente experimentado y disciplinado. Destaca por su firmeza en el campo, rigurosidad y aplicación del reglamento.",
      fr: "István Kovács est un arbitre roumain d'élite, d'expérience et très discipliné. Connu pour sa fermeté réglementaire et sa poigne lors des matchs chauds.",
      de: "István Kovács ist ein erfahrener und disziplinierter rumänischer Elite-Schiedsrichter. Er ist für seine konsequente Spielleitung und Durchsetzungsfähigkeit bekannt.",
      pt: "István Kovács é um experiente e rigoroso árbitro de elite na Roménia. É famoso pela forma disciplinar intransigente com que lidera as partidas.",
      it: "István Kovács è un esperto e severo arbitro d'élite rumeno. È noto per il suo stile di direzione rigoroso e autoritario.",
      ko: "이스트반 코바치는 루마니아의 베테랑이자 매우 규율을 중시하는 엘리트 심판입니다. 카드를 빈번히 사용하며 타협하지 않는 단호한 관리 스타일로 정평이 나 있습니다.",
      ar: "إستفان كوفاتش هو حكم نخبة روماني ذو خبرة ومنضبط. وهو معروف بقراراته الصارمة وأسلوبه الحازم في إدارة المباريات."
    },
    importantMatches: {
      tr: [
        "2024 UEFA Avrupa Ligi Finali (Atalanta - Leverkusen)",
        "2022 UEFA Konferans Ligi Finali (Roma - Feyenoord)",
        "2024 UEFA Euro Grup Maçları"
      ],
      en: [
        "2024 UEFA Europa League Final (Atalanta vs Leverkusen)",
        "2022 UEFA Conference League Final (Roma vs Feyenoord)",
        "2024 UEFA Euro Group Matches"
      ],
      es: [
        "Final de la UEFA Europa League 2024 (Atalanta vs Leverkusen)",
        "Final de la UEFA Conference League 2022 (Roma vs Feyenoord)",
        "Partidos de la fase de grupos de la UEFA Euro 2024"
      ],
      fr: [
        "Finale de la Ligue Europa de l'UEFA 2024 (Atalanta vs Leverkusen)",
        "Finale de la Ligue Europa Conférence de l'UEFA 2022 (Roma vs Feyenoord)",
        "Matchs de poule de l'UEFA Euro 2024"
      ],
      de: [
        "UEFA Europa League Finale 2024 (Atalanta - Leverkusen)",
        "UEFA Conference League Finale 2022 (Roma - Feyenoord)",
        "UEFA Euro 2024 Gruppenspiele"
      ],
      pt: [
        "Final da UEFA Europa League 2024 (Atalanta vs Leverkusen)",
        "Final da UEFA Conference League 2022 (Roma vs Feyenoord)",
        "Jogos da Fase de Grupos do UEFA Euro 2024"
      ],
      it: [
        "Finale della UEFA Europa League 2024 (Atalanta vs Leverkusen)",
        "Finale della UEFA Conference League 2022 (Roma vs Feyenoord)",
        "Partite dei gironi di UEFA Euro 2024"
      ],
      ko: [
        "2024 UEFA 유로파리그 결승전 (아탈란타 대 레버쿠젠)",
        "2022 UEFA 컨퍼런스리그 결승전 (로마 대 페예노르트)",
        "2024 UEFA 유로 조별리그 경기들"
      ],
      ar: [
        "نهائي الدوري الأوروبي 2024 (أتالانتا ضد ليفركوزن)",
        "نهائي دوري المؤتمر الأوروبي 2022 (روما ضد فينورد)",
        "مباريات المجموعات في يورو 2024"
      ]
    }
  },
  {
    id: "eskas",
    name: "Espen Eskås",
    age: 37,
    image: "https://flagcdn.com/w320/no.png",
    yellowCardsAvg: 3.65,
    redCardsAvg: 0.11,
    country: {
      tr: "Norveç",
      en: "Norway",
      es: "Noruega",
      fr: "Norvège",
      de: "Norwegen",
      pt: "Noruega",
      it: "Norvegia",
      ko: "노르웨이",
      ar: "النرويج"
    },
    bio: {
      tr: "Espen Eskås, Norveç'in yükselen elit hakemidir. Oyuncularla kurduğu yapıcı diyalog ve pozisyonları yakından takip eden fiziksel kondisyonuyla öne çıkar.",
      en: "Espen Eskås is Norway's rising elite referee. He stands out with constructive dialogue with players and high physical fitness.",
      es: "Espen Eskås es el árbitro noruego de élite en constante ascenso. Destaca por su diálogo constructivo con los futbolistas y su excelente preparación física.",
      fr: "Espen Eskås est un arbitre norvégien en pleine ascension, réputé pour sa communication avec les joueurs et son excellente condition physique.",
      de: "Espen Eskås ist Norwegens aufstrebender Elite-Schiedsrichter, bekannt für seinen konstruktiven Dialog mit Spielern und hervorragende Fitness.",
      pt: "Espen Eskås é o árbitro norueguês de elite em plena afirmação. Sobressai pelo diálogo pedagógico com os jogadores e robustez física.",
      it: "Espen Eskås è un promettente arbitro d'élite norvegese, noto per il dialogo costruttivo e l'ottima forma atletica.",
      ko: "에스펜 에스카스는 노르웨이의 떠오르는 엘리트 심판입니다. 선수들과의 건설적인 대화 능력과 포지셔닝을 면밀히 따라가는 우수한 물리적 신체 조건이 돋보입니다.",
      ar: "إسبن إسكاس هو حكم النخبة النرويجي الصاعد. وهو يتميز بحواره البناء مع اللاعبين ولياقته البدنية العالية."
    },
    importantMatches: {
      tr: [
        "2023 UEFA U21 Avrupa Şampiyonası Finali",
        "2023-24 Şampiyonlar Ligi Eleme Maçları",
        "Uluslararası Gençlik Turnuvaları"
      ],
      en: [
        "2023 UEFA U21 Euro Final",
        "2023-24 Champions League Knockout Matches",
        "International Youth Tournaments"
      ],
      es: [
        "Final de la UEFA Euro Sub-21 2023",
        "Partidos de eliminación directa de la Champions League 2023-24",
        "Torneos internacionales juveniles"
      ],
      fr: [
        "Finale de l'Euro Espoirs de l'UEFA 2023",
        "Matchs à élimination directe de la Ligue des Champions de l'UEFA 2023-24",
        "Tournois internationaux de jeunes"
      ],
      de: [
        "UEFA U21 Euro Finale 2023",
        "Champions League K.-o.-Spiele 2023-24",
        "Internationale Jugendturniere"
      ],
      pt: [
        "Final do Campeonato da Europa Sub-21 da UEFA 2023",
        "Jogos a Eliminar da Champions League 2023-24",
        "Torneios de Formação Internacionais"
      ],
      it: [
        "Finale degli Europei UEFA U21 2023",
        "Match a eliminazione diretta di Champions League 2023-24",
        "Tornei giovanili internazionali"
      ],
      ko: [
        "2023 UEFA U21 유로 결승전",
        "2023-24 UEFA 챔피언스리그 토너먼트 매치",
        "국제 청소년 토너먼트 경기들"
      ],
      ar: [
        "نهائي بطولة أوروبا تحت 21 سنة 2023",
        "مباريات خروج المغلوب في دوري أبطال أوروبا 2023-24",
        "بطولات الشباب الدولية"
      ]
    }
  },
  {
    id: "scharer",
    name: "Sandro Schärer",
    age: 37,
    image: "https://flagcdn.com/w320/ch.png",
    yellowCardsAvg: 4.25,
    redCardsAvg: 0.19,
    country: {
      tr: "İsviçre",
      en: "Switzerland",
      es: "Suiza",
      fr: "Suisse",
      de: "Schweiz",
      pt: "Suíça",
      it: "Svizzera",
      ko: "스위스",
      ar: "سويسرا"
    },
    bio: {
      tr: "Sandro Schärer, İsviçre'nin en tecrübeli elit hakemidir. Hızlı reaksiyonları ve modern oyun kurallarını sahada kararlılıkla uygulamasıyla bilinir.",
      en: "Sandro Schärer is Switzerland's most experienced elite referee, known for fast reactions and firm implementation of modern rules.",
      es: "Sandro Schärer es el árbitro suizo más experimentado de la categoría élite. Destaca por su velocidad de reacción y toma ágil de decisiones.",
      fr: "Sandro Schärer est l'arbitre suisse le plus expérimenté, réputé pour sa vivacité d'esprit, ses réflexes et son respect strict des règles de l'UEFA.",
      de: "Sandro Schärer ist der erfahrenste Schweizer Schiedsrichter, bekannt für schnelle Reaktionen und konsequente Regelauslegung.",
      pt: "Sandro Schärer é o mais experiente árbitro de elite suíço. É conhecido pelas reações rápidas e determinação nas leis do jogo.",
      it: "Sandro Schärer è il più esperto arbitro d'élite svizzero, noto per la rapidità di decisione e l'applicazione rigida del regolamento.",
      ko: "산드로 셰러는 스위스에서 가장 노련한 엘리트 심판으로, 신속한 대처 능력과 현대적인 규칙들을 그라운드에서 철저히 준수하는 것으로 알려져 있습니다.",
      ar: "ساندرو شيرر هو حكم النخبة السويسري الأكثر خبرة، وهو معروف بردود فعله السريعة وتطبيقه الحازم للقواعد الحديثة."
    },
    importantMatches: {
      tr: [
        "2024 UEFA Süper Kupası (Real Madrid - Atalanta)",
        "UEFA Şampiyonlar Ligi Grup Müsabakaları",
        "İsviçre Kupası Finalleri"
      ],
      en: [
        "2024 UEFA Super Cup (Real Madrid vs Atalanta)",
        "UEFA Champions League Group Matches",
        "Swiss Cup Finals"
      ],
      es: [
        "Supercopa de la UEFA 2024 (Real Madrid vs Atalanta)",
        "Partidos de fase de grupos de la Champions League",
        "Finales de la Copa de Suiza"
      ],
      fr: [
        "Supercoupe de l'UEFA 2024 (Real Madrid vs Atalanta)",
        "Matchs de poule de la Ligue des Champions de l'UEFA",
        "Finales de la Coupe de Suisse"
      ],
      de: [
        "UEFA Super Cup 2024 (Real Madrid - Atalanta)",
        "UEFA Champions League Gruppenspiele",
        "Schweizer Cup-Endspiele"
      ],
      pt: [
        "Supertaça da UEFA 2024 (Real Madrid vs Atalanta)",
        "Fase de Grupos da UEFA Champions League",
        "Finais da Taça da Suíça"
      ],
      it: [
        "Supercoppa UEFA 2024 (Real Madrid vs Atalanta)",
        "Partite della fase a gironi di UEFA Champions League",
        "Finali della Coppa di Svizzera"
      ],
      ko: [
        "2024 UEFA 슈퍼컵 (레알 마드리드 대 아탈란타)",
        "UEFA 챔피언스리그 조별리그 매치",
        "스위스 컵 결승전들"
      ],
      ar: [
        "كأس السوبر الأوروبي 2024 (ريال مدريد ضد أتالانتا)",
        "مباريات المجموعات في دوري أبطال أوروبا",
        "نهائيات كأس سويسرا"
      ]
    }
  },
  {
    id: "hernandez",
    name: "A. Hernández Hernández",
    age: 43,
    image: "https://flagcdn.com/w320/es.png",
    yellowCardsAvg: 5.15,
    redCardsAvg: 0.32,
    country: {
      tr: "İspanya",
      en: "Spain",
      es: "España",
      fr: "Espagne",
      de: "Spanien",
      pt: "Espanha",
      it: "Spagna",
      ko: "스페인",
      ar: "إسبانيا"
    },
    bio: {
      tr: "Alejandro Hernández Hernández, İspanya La Liga'nın ve UEFA'nın en tecrübeli elit hakemlerinden biridir. Kart disiplini konusundaki tavizsiz duruşuyla bilinir.",
      en: "Alejandro Hernández Hernández is one of the most experienced elite referees in La Liga and UEFA. Known for his strict card discipline.",
      es: "Alejandro Hernández Hernández es uno de los árbitros más experimentados de La Liga y la UEFA. Destaca por su disciplina estricta, rigurosidad y alto volumen de tarjetas.",
      fr: "Alejandro Hernández Hernández est l'un des arbitres les plus chevronnés de La Liga et de l'UEFA. Connu pour sa rigueur réglementaire et ses nombreux cartons.",
      de: "Alejandro Hernández Hernández ist einer der erfahrensten La Liga- und UEFA-Elite-Schiedsrichter. Bekannt für seine konsequente Kartenvergabe und strenge Linie.",
      pt: "Alejandro Hernández Hernández é um dos mais prestigiados árbitros na La Liga e UEFA. Conhecido pelo rigor e quantidade média de cartões por jogo.",
      it: "Alejandro Hernández Hernández è uno dei più esperti arbitri di La Liga e UEFA. Famoso per la severità della sua condotta disciplinare.",
      ko: "알레한드로 에르난데스 에르난데스는 스페인 라리가 및 UEFA에서 가장 관록 있는 엘리트 심판 중 한 명입니다. 특히 카드 누적 징계 부분에서 일관되게 규정을 엄격히 적용하는 심판으로 유명합니다.",
      ar: "أليخاندرو هيرنانديز هيرنانديز هو أحد أكثر الحكام خبرة في الدوري الإسباني واليويفا. وهو معروف بانضباطه الصارم في توزيع البطاقات."
    },
    importantMatches: {
      tr: [
        "Birçok El Clásico (Real Madrid - Barcelona) derbisi",
        "UEFA Şampiyonlar Ligi Maçları",
        "La Liga Şampiyonluk Mücadeleleri"
      ],
      en: [
        "Numerous El Clásico (Real Madrid vs Barcelona) derbies",
        "UEFA Champions League Matches",
        "La Liga Title Deciders"
      ],
      es: [
        "Numerosos derbis de El Clásico",
        "Partidos de la UEFA Champions League",
        "Partidos clave en la lucha por el título de La Liga"
      ],
      fr: [
        "Nombreux derbys d'El Clásico (Real Madrid vs Barcelone)",
        "Matchs de la Ligue des Champions de l'UEFA",
        "Matchs décisifs pour le titre de La Liga"
      ],
      de: [
        "Zahlreiche El Clásico Derbys (Real Madrid - Barcelona)",
        "UEFA Champions League Spiele",
        "Entscheidende La Liga Meisterschaftsspiele"
      ],
      pt: [
        "Vários clássicos Real Madrid vs Barcelona",
        "Jogos da UEFA Champions League",
        "Partidas decisivas pelo título da La Liga"
      ],
      it: [
        "Numerosi derby El Clásico",
        "Partite della UEFA Champions League",
        "Match decisivi per l'assegnazione de La Liga"
      ],
      ko: [
        "다수의 엘 클라시코 (레알 마드리드 대 바르셀로나) 더비",
        "UEFA 챔피언스리그 경기들",
        "라리가 우승 결정전 매치들"
      ],
      ar: [
        "العديد من مباريات الكلاسيكو (ريال مدريد ضد برشلونة)",
        "مباريات دوري أبطال أوروبا",
        "المباريات الحاسمة للقب الدوري الإسباني"
      ]
    }
  }
];

export function getRefereeById(id: string): Referee | undefined {
  return REFEREES.find((r) => r.id === id.toLowerCase());
}
