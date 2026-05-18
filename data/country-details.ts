import { Locale } from "@/lib/i18n/types";

export interface LocalizedText {
  tr: string;
  en: string;
  es: string;
  fr: string;
  de: string;
}

export interface CountryDetail {
  teamId: string;
  capital: LocalizedText;
  population: LocalizedText;
  history: LocalizedText;
  achievements: LocalizedText;
  nickname?: LocalizedText;
}

export const COUNTRY_DETAILS: Record<string, CountryDetail> = {
  tur: {
    teamId: "tur",
    capital: {
      tr: "Ankara",
      en: "Ankara",
      es: "Ankara",
      fr: "Ankara",
      de: "Ankara"
    },
    population: {
      tr: "85.3 Milyon",
      en: "85.3 Million",
      es: "85.3 Millones",
      fr: "85.3 Millions",
      de: "85.3 Millionen"
    },
    nickname: {
      tr: "Bizim Çocuklar / Ay-Yıldızlılar",
      en: "The Crescent-Stars",
      es: "Las Estrellas Crecientes",
      fr: "Les Étoiles du Croissant",
      de: "Die Halbmond-Sterne"
    },
    history: {
      tr: "Türkiye, futbol sahnesinde tutkusu ve cesaretiyle tanınır. 1954 ve 2002 yıllarında Dünya Kupası'na katılan Ay-Yıldızlılar, özellikle 2002 Güney Kore-Japonya'da Şenol Güneş yönetiminde dünya üçüncüsü olarak tarih yazmıştır. Son derece dinamik ve genç kadrosuyla 2026'da yeni bir destan yazmayı hedefliyorlar.",
      en: "Turkey is known on the football scene for its passion and courage. Having participated in the World Cup in 1954 and 2002, the Crescent-Stars made history by finishing third in the 2002 South Korea-Japan tournament under Şenol Güneş. They aim to write a new legend in 2026 with their dynamic and young squad.",
      es: "Turquía es conocida en el fútbol por su pasión y coraje. Habiendo participado en la Copa del Mundo en 1954 y 2002, las Estrellas Crecientes hicieron historia al terminar en tercer lugar en el torneo de 2002 bajo Şenol Güneş. Su objetivo es escribir una nueva leyenda en 2026 con su joven y dinámico equipo.",
      fr: "La Turquie est réputée pour sa passion et son courage sur la scène du football. Ayant participé aux Coupes du Monde 1954 et 2002, les Étoiles du Croissant ont marqué l'histoire en terminant troisièmes en 2002 sous la direction de Şenol Güneş. Ils visent à écrire une nouvelle légende en 2026.",
      de: "Türkei ist auf der Fußballbühne für ihre Leidenschaft und ihren Mut bekannt. Die Halbmond-Sterne nahmen 1954 und 2002 an der Weltmeisterschaft teil und schrieben 2002 bei der WM in Südkorea und Japan unter Şenol Güneş Geschichte, als sie den dritten Platz belegten. Sie wollen 2026 eine neue Legende schreiben."
    },
    achievements: {
      tr: "FIFA Dünya Kupası Üçüncülüğü (2002) · UEFA Euro 2008 Yarı Finali · FIFA Konfederasyonlar Kupası Üçüncülüğü (2003).",
      en: "FIFA World Cup Third Place (2002) · UEFA Euro 2008 Semi-Finals · FIFA Confederations Cup Third Place (2003).",
      es: "Tercer puesto en la Copa Mundial de la FIFA (2002) · Semifinales de la UEFA Euro 2008 · Tercer puesto en la Copa Confederaciones de la FIFA (2003).",
      fr: "Troisième place de la Coupe du Monde de la FIFA (2002) · Demi-finales de l'UEFA Euro 2008 · Troisième place de la Coupe des Confédérations de la FIFA (2003).",
      de: "Dritter Platz bei der FIFA-Weltmeisterschaft (2002) · Halbfinale der UEFA Euro 2008 · Dritter Platz beim FIFA-Konföderationen-Pokal (2003)."
    }
  },
  arg: {
    teamId: "arg",
    capital: {
      tr: "Buenos Aires",
      en: "Buenos Aires",
      es: "Buenos Aires",
      fr: "Buenos Aires",
      de: "Buenos Aires"
    },
    population: {
      tr: "46.2 Milyon",
      en: "46.2 Million",
      es: "46.2 Millones",
      fr: "46.2 Millions",
      de: "46.2 Millionen"
    },
    nickname: {
      tr: "La Albiceleste (Mavi-Beyazlılar)",
      en: "The White and Sky Blues",
      es: "La Albiceleste",
      fr: "L'Albiceleste",
      de: "Die Himmelblau-Weißen"
    },
    history: {
      tr: "Arjantin, dünya futbolunun en köklü ve başarılı devlerinden biridir. Maradona ve Messi gibi efsanelerin vatanı olan ülke, son olarak 2022 Katar Dünya Kupası'nı kazanarak üçüncü yıldızını takmıştır. Teknik beceri, taktik zeka ve sokak futbolunun getirdiği kıvraklık Arjantin futbolunun karakterini oluşturur.",
      en: "Argentina is one of the most established and successful giants of world football. The homeland of legends like Maradona and Messi, the country recently secured its third star by winning the 2022 Qatar World Cup. Technical skill, tactical intelligence, and street-football agility form the character of Argentine football.",
      es: "Argentina es uno de los gigantes más consolidados y exitosos del fútbol mundial. Cuna de leyendas como Maradona y Messi, el país se coronó recientemente con su tercera estrella al ganar la Copa del Mundo Catar 2022. La habilidad técnica, la inteligencia táctica y la agilidad del fútbol callejero forman su carácter.",
      fr: "L'Argentine est l'un des géants les plus établis et les plus couronnés de succès du football mondial. Patrie de légendes comme Maradona et Messi, le pays a récemment décroché sa troisième étoile en remportant la Coupe du monde 2022 au Qatar. La finesse technique et l'intelligence tactique définissent leur jeu.",
      de: "Argentinien ist einer der etabliertesten und erfolgreichsten Giganten des Weltfußballs. Die Heimat von Legenden wie Maradona und Messi sicherte sich zuletzt mit dem Gewinn der Weltmeisterschaft 2022 in Katar ihren dritten Stern. Technische Finesse und taktische Intelligenz prägen ihren Charakter."
    },
    achievements: {
      tr: "3x FIFA Dünya Kupası Şampiyonu (1978, 1986, 2022) · 16x Copa América Şampiyonu · 2x Olimpiyat Altın Madalyası (2004, 2008).",
      en: "3x FIFA World Cup Champions (1978, 1986, 2022) · 16x Copa América Champions · 2x Olympic Gold Medals (2004, 2008).",
      es: "3 veces Campeón de la Copa Mundial de la FIFA (1978, 1986, 2022) · 16 veces Campeón de la Copa América · 2 Medallas de Oro Olímpicas (2004, 2008).",
      fr: "3x Champion de la Coupe du Monde de la FIFA (1978, 1986, 2022) · 16x Champion de la Copa América · 2x Médaille d'or olympique (2004, 2008).",
      de: "3x FIFA-Weltmeister (1978, 1986, 2022) · 16x Copa-América-Sieger · 2x Olympisches Gold (2004, 2008)."
    }
  },
  bra: {
    teamId: "bra",
    capital: {
      tr: "Brasilia",
      en: "Brasília",
      es: "Brasilia",
      fr: "Brasilia",
      de: "Brasília"
    },
    population: {
      tr: "215.3 Milyon",
      en: "215.3 Million",
      es: "215.3 Millones",
      fr: "215.3 Millions",
      de: "215.3 Millionen"
    },
    nickname: {
      tr: "Seleção (Seçilmişler) / Canarinho",
      en: "The Squad / Little Canary",
      es: "La Seleção / El Canarinho",
      fr: "La Seleção",
      de: "Die Seleção"
    },
    history: {
      tr: "Dünya Kupası tarihinin en başarılı ülkesi olan Brezilya, 'Joga Bonito' (Güzel Oyun) felsefesiyle özdeşleşmiştir. Pelé, Ronaldo ve Ronaldinho gibi tarihin en büyük sihirbazlarını çıkaran Sambacılar, 5 şampiyonlukla turnuvanın en çok kupa kazanan takımıdır. Hücum futbolu ve yaratıcılık onların DNA'sında vardır.",
      en: "The most successful nation in World Cup history, Brazil is synonymous with the philosophy of 'Joga Bonito' (The Beautiful Game). Producing the greatest wizards of history like Pelé, Ronaldo, and Ronaldinho, the Sambas hold the record with 5 titles. Attacking football and creativity are in their DNA.",
      es: "La nación más exitosa en la historia de la Copa del Mundo, Brasil es sinónimo de la filosofía de 'Joga Bonito' (El Juego Bonito). Cuna de los más grandes magos de la historia como Pelé, Ronaldo y Ronaldinho, tienen el récord con 5 títulos. El fútbol ofensivo y la creatividad están en su ADN.",
      fr: "Nation la plus titrée de l'histoire de la Coupe du monde, le Brésil est synonyme du 'Joga Bonito' (Le Beau Jeu). Ayant révélé les plus grands magiciens de l'histoire tels que Pelé, Ronaldo et Ronaldinho, la Seleção détient le record avec 5 titres. L'offensive et la créativité coulent dans leurs veines.",
      de: "Als erfolgreichste Nation in der Geschichte der Weltmeisterschaft steht Brasilien für die Philosophie des 'Joga Bonito' (Das schöne Spiel). Die Sambakicker brachten die größten Zauberer der Geschichte wie Pelé, Ronaldo und Ronaldinho hervor und halten den Rekord mit 5 WM-Titeln."
    },
    achievements: {
      tr: "5x FIFA Dünya Kupası Şampiyonu (1958, 1962, 1970, 1994, 2002) · 9x Copa América Şampiyonu · 4x FIFA Konfederasyonlar Kupası.",
      en: "5x FIFA World Cup Champions (1958, 1962, 1970, 1994, 2002) · 9x Copa América Champions · 4x FIFA Confederations Cup.",
      es: "5 veces Campeón de la Copa Mundial de la FIFA (1958, 1962, 1970, 1994, 2002) · 9 veces Campeón de la Copa América · 4 veces Copa Confederaciones de la FIFA.",
      fr: "5x Champion de la Coupe du Monde de la FIFA (1958, 1962, 1970, 1994, 2002) · 9x Champion de la Copa América · 4x Coupe des Confédérations.",
      de: "5x FIFA-Weltmeister (1958, 1962, 1970, 1994, 2002) · 9x Copa-América-Sieger · 4x FIFA-Konföderationen-Pokal-Sieger."
    }
  },
  fra: {
    teamId: "fra",
    capital: {
      tr: "Paris",
      en: "Paris",
      es: "París",
      fr: "Paris",
      de: "Paris"
    },
    population: {
      tr: "68.3 Milyon",
      en: "68.3 Million",
      es: "68.3 Millones",
      fr: "68.3 Millions",
      de: "68.3 Millionen"
    },
    nickname: {
      tr: "Les Bleus (Mavililer)",
      en: "The Blues",
      es: "Les Bleus",
      fr: "Les Bleus",
      de: "Die Blauen"
    },
    history: {
      tr: "Fransa, modern futbolun en güçlü ve atletik takımlarından biridir. Zidane ve Henry dönemindeki altın çağını, 2018'de Mbappé önderliğinde kazandığı kupa ile taçlandırmıştır. 2022'de final oynayan Horozlar, son derece zengin oyuncu havuzu, fiziksel üstünlüğü ve hızlı geçiş hücumlarıyla rakiplerine korku salmaktadır.",
      en: "France is one of the most powerful and athletic teams in modern football. Having crowned its golden era under Zidane and Henry with the 2018 trophy led by Mbappé, Les Bleus are a formidable force. They fear no opponent with their rich player pool, physical dominance, and lightning-fast transitions.",
      es: "Francia es uno de los equipos más potentes y atléticos del fútbol moderno. Coronó su época dorada bajo Zidane y Henry con el trofeo de 2018 liderado por Mbappé. Cuentan con un rico plantel de jugadores, dominio físico y transiciones ultrarrápidas.",
      fr: "La France est l'une des sélections les plus puissantes et athlétiques du football moderne. Ayant couronné son âge d'or sous Zidane et Henry par le sacre de 2018 emmené par Mbappé, les Bleus sont redoutables avec leur vivier de talents, leur impact physique et leurs transitions rapides.",
      de: "Frankreich ist eines der kraftvollsten und athletischsten Teams im modernen Fußball. Die Goldene Ära unter Zidane und Henry krönten sie 2018 mit dem WM-Titel unter der Führung von Mbappé. Mit einem riesigen Talentpool und physischer Dominanz sind sie stets ein Topfavorit."
    },
    achievements: {
      tr: "2x FIFA Dünya Kupası Şampiyonu (1998, 2018) · 2x UEFA Euro Şampiyonu (1984, 2000) · 1x UEFA Uluslar Ligi Şampiyonu (2021).",
      en: "2x FIFA World Cup Champions (1998, 2018) · 2x UEFA Euro Champions (1984, 2000) · 1x UEFA Nations League Champions (2021).",
      es: "2 veces Campeón de la Copa Mundial de la FIFA (1998, 2018) · 2 veces Campeón de la UEFA Euro (1984, 2000) · 1 vez Campeón de la UEFA Nations League (2021).",
      fr: "2x Champion de la Coupe du Monde de la FIFA (1998, 2018) · 2x Champion d'Europe de l'UEFA (1984, 2000) · 1x Vainqueur de la Ligue des Nations de l'UEFA (2021).",
      de: "2x FIFA-Weltmeister (1998, 2018) · 2x UEFA-Europameister (1984, 2000) · 1x UEFA-Nations-League-Sieger (2021)."
    }
  },
  ger: {
    teamId: "ger",
    capital: {
      tr: "Berlin",
      en: "Berlin",
      es: "Berlín",
      fr: "Berlin",
      de: "Berlin"
    },
    population: {
      tr: "84.4 Milyon",
      en: "84.4 Million",
      es: "84.4 Millones",
      fr: "84.4 Millions",
      de: "84.4 Millionen"
    },
    nickname: {
      tr: "Die Mannschaft (Panzerlar)",
      en: "The Team",
      es: "Die Mannschaft",
      fr: "La Mannschaft",
      de: "Die Mannschaft"
    },
    history: {
      tr: "Almanya, turnuva tarihinin en istikrarlı ve disiplinli gücüdür. 'Futbol 90 dakika süren ve sonunda Almanların kazandığı bir oyundur' sözünün doğruluğunu defalarca kanıtlamışlardır. 4 Dünya Kupası şampiyonluğuyla parıldayan Panzerler, taktik disiplin, yüksek fizik kondisyon ve kusursuz makine düzeniyle oynarlar.",
      en: "Germany is the most consistent and disciplined powerhouse in tournament history. They have repeatedly proven the saying 'Football is a simple game; 22 men chase a ball for 90 minutes and at the end, the Germans win.' The team operates with tactical discipline, high physical conditioning, and perfect efficiency.",
      es: "Alemania es la potencia más constante y disciplinada en la historia de los torneos. Han demostrado repetidamente el dicho: 'El fútbol es un deporte simple, 22 hombres corren tras un balón y al final ganan los alemanes.' El equipo opera con disciplina táctica y gran preparación física.",
      fr: "L'Allemagne est la force la plus régulière et la plus disciplinée de l'histoire du tournoi. Ils ont prouvé à maintes reprises le dicton : 'Le football se joue à 11 contre 11 et à la fin, c'est l'Allemagne qui gagne.' Les Mannschaft fonctionnent avec une rigueur tactique et un physique de fer.",
      de: "Deutschland ist die konstanteste und disziplinierteste Macht der WM-Geschichte. Sie haben den Spruch 'Fußball ist ein einfaches Spiel: 22 Männer jagen 90 Minuten lang einem Ball nach, und am Ende gewinnen die Deutschen' oft bewiesen. Die Mannschaft spielt mit taktischer Disziplin und Power."
    },
    achievements: {
      tr: "4x FIFA Dünya Kupası Şampiyonu (1954, 1974, 1990, 2014) · 3x UEFA Euro Şampiyonu · 1x FIFA Konfederasyonlar Kupası.",
      en: "4x FIFA World Cup Champions (1954, 1974, 1990, 2014) · 3x UEFA Euro Champions · 1x FIFA Confederations Cup.",
      es: "4 veces Campeón de la Copa Mundial de la FIFA (1954, 1974, 1990, 2014) · 3 veces Campeón de la UEFA Euro · 1 vez Copa Confederaciones de la FIFA.",
      fr: "4x Champion de la Coupe du Monde de la FIFA (1954, 1974, 1990, 2014) · 3x Champion d'Europe de l'UEFA · 1x Coupe des Confédérations.",
      de: "4x FIFA-Weltmeister (1954, 1974, 1990, 2014) · 3x UEFA-Europameister · 1x FIFA-Konföderationen-Pokal-Sieger."
    }
  },
  esp: {
    teamId: "esp",
    capital: {
      tr: "Madrid",
      en: "Madrid",
      es: "Madrid",
      fr: "Madrid",
      de: "Madrid"
    },
    population: {
      tr: "48.1 Milyon",
      en: "48.1 Million",
      es: "48.1 Millones",
      fr: "48.1 Millions",
      de: "48.1 Millionen"
    },
    nickname: {
      tr: "La Roja (Kırmızılar)",
      en: "The Red",
      es: "La Roja",
      fr: "La Roja",
      de: "La Roja"
    },
    history: {
      tr: "İspanya, 'Tiki-Taka' adı verilen kısa pas ve topa sahip olma oyunuyla dünya futboluna yeni bir standart getirmiştir. Casillas, Xavi ve Iniesta'lı jenerasyonuyla 2008-2012 yılları arasında dünya futbolunu domine eden La Roja, 2010 Güney Afrika'da şampiyonluğa uzanmıştır. Genç yetenekleriyle 2026'da yine kupanın en iddialı ortaklarındandır.",
      en: "Spain set a new standard in world football with its short-passing and possession-based game known as 'Tiki-Taka'. Dominating world football between 2008-2012 with a generation featuring Casillas, Xavi, and Iniesta, La Roja clinched the 2010 South Africa World Cup. They are among the biggest contenders for 2026.",
      es: "España estableció un nuevo estándar en el fútbol mundial con su juego de pases cortos y posesión conocido como 'Tiki-Taka'. Dominando el fútbol mundial entre 2008 y 2012 con una generación liderada por Casillas, Xavi e Iniesta, ganaron el Mundial 2010. Son firmes candidatos para 2026.",
      fr: "L'Espagne a imposé un nouveau style au football mondial grâce à son jeu de passes courtes et de possession, le 'Tiki-Taka'. Dominant la planète football entre 2008 et 2012 avec la génération dorée de Casillas, Xavi et Iniesta, la Roja a été sacrée en 2010. Ils restent de sérieux prétendants.",
      de: "Spanien hat mit seinem Kurzpass- und Ballbesitzspiel, bekannt als 'Tiki-Taka', neue Maßstäbe gesetzt. Nach der Dominanz des Weltfußballs von 2008 bis 2012 mit Casillas, Xavi und Iniesta holte die Roja 2010 in Südafrika den WM-Titel. Auch 2026 gehören sie zu den Topfavoriten."
    },
    achievements: {
      tr: "1x FIFA Dünya Kupası Şampiyonu (2010) · 4x UEFA Euro Şampiyonu (1964, 2008, 2012, 2024) · 1x UEFA Uluslar Ligi Şampiyonu.",
      en: "1x FIFA World Cup Champions (2010) · 4x UEFA Euro Champions (1964, 2008, 2012, 2024) · 1x UEFA Nations League Champions.",
      es: "1 vez Campeón de la Copa Mundial de la FIFA (2010) · 4 veces Campeón de la UEFA Euro (1964, 2008, 2012, 2024) · 1 vez Campeón de la UEFA Nations League.",
      fr: "1x Champion de la Coupe du Monde de la FIFA (2010) · 4x Champion d'Europe de l'UEFA (1964, 2008, 2012, 2024) · 1x Vainqueur de la Ligue des Nations.",
      de: "1x FIFA-Weltmeister (2010) · 4x UEFA-Europameister (1964, 2008, 2012, 2024) · 1x UEFA-Nations-League-Sieger."
    }
  },
  usa: {
    teamId: "usa",
    capital: {
      tr: "Washington D.C.",
      en: "Washington, D.C.",
      es: "Washington D. C.",
      fr: "Washington D.C.",
      de: "Washington, D.C."
    },
    population: {
      tr: "333.2 Milyon",
      en: "333.2 Million",
      es: "333.2 Millones",
      fr: "333.2 Millions",
      de: "333.2 Millionen"
    },
    nickname: {
      tr: "The Stars & Stripes (Yıldızlar ve Çizgililer)",
      en: "The Stars & Stripes / The Yanks",
      es: "Las Barras y las Estrellas",
      fr: "Les Stars & Stripes",
      de: "Die Stars & Stripes"
    },
    history: {
      tr: "Amerika Birleşik Devletleri, 2026 Dünya Kupası'nın ana ev sahibi olarak futbol kültürünü zirveye taşımayı amaçlıyor. Genç ve dinamik kadrolarında Avrupa'nın devlerinde forma giyen birçok yıldız barındıran ABD, taraftar desteğini arkasına alarak tarihi bir başarı elde etmeyi ve futbol (soccer) sporunu ülkede zirveye taşımayı hedefliyor.",
      en: "As the primary host of the 2026 World Cup, the United States aims to push soccer culture to the absolute peak. Boasting a young, dynamic squad with stars playing in major European clubs, the US aims to use home support to achieve historic success and firmly solidify soccer's popularity in the country.",
      es: "Como anfitrión principal de la Copa del Mundo 2026, Estados Unidos busca impulsar la cultura del fútbol al máximo nivel. Con un equipo joven y dinámico que incluye estrellas en clubes europeos, buscan el apoyo local para alcanzar un éxito histórico.",
      fr: "En tant qu'hôte principal de la Coupe du Monde 2026, les États-Unis visent à propulser la culture du soccer au sommet. Forts d'une jeune génération évoluant en Europe, ils comptent sur l'appui du public pour marquer l'histoire de leur sport national naissant.",
      de: "Als Hauptgastgeber der Weltmeisterschaft 2026 möchte die USA die Begeisterung für den 'Soccer' auf ein Rekordniveau heben. Mit einem jungen, dynamischen Kader voller Profis aus europäischen Top-Klubs wollen sie den Heimvorteil für einen historischen Erfolg nutzen."
    },
    achievements: {
      tr: "FIFA Dünya Kupası Üçüncülüğü (1930) · 7x CONCACAF Altın Kupa Şampiyonu · 3x CONCACAF Uluslar Ligi Şampiyonu.",
      en: "FIFA World Cup Third Place (1930) · 7x CONCACAF Gold Cup Champions · 3x CONCACAF Nations League Champions.",
      es: "Tercer puesto en la Copa Mundial de la FIFA (1930) · 7 veces Campeón de la Copa Oro de la CONCACAF · 3 veces Campeón de la Liga de Naciones CONCACAF.",
      fr: "Troisième place de la Coupe du Monde de la FIFA (1930) · 7x Vainqueur de la Gold Cup de la CONCACAF · 3x Vainqueur de la Ligue des Nations CONCACAF.",
      de: "Dritter Platz bei der FIFA-Weltmeisterschaft (1930) · 7x CONCACAF-Gold-Cup-Sieger · 3x CONCACAF-Nations-League-Sieger."
    }
  },
  mex: {
    teamId: "mex",
    capital: {
      tr: "Meksiko",
      en: "Mexico City",
      es: "Ciudad de México",
      fr: "Mexico",
      de: "Mexiko-Stadt"
    },
    population: {
      tr: "128.5 Milyon",
      en: "128.5 Million",
      es: "128.5 Millones",
      fr: "128.5 Millions",
      de: "128.5 Millionen"
    },
    nickname: {
      tr: "El Tri (Üç Renkliler)",
      en: "The Tricolor",
      es: "El Tri",
      fr: "El Tri",
      de: "El Tri"
    },
    history: {
      tr: "Meksika, dünya kupaları tarihinin en ikonik ve sadık katılımcılarından biridir. 1970 ve 1986'da iki efsanevi Dünya Kupası'na ev sahipliği yapan ülke, Azteca Stadyumu'nun büyüleyici atmosferiyle bilinir. 2026'da ABD ve Kanada ile ortak ev sahibi olarak, Azteca'da açılış maçını oynamanın gururunu yaşayacaktır. Tutkulu taraftarları ve dinamik futboluyla turnuvanın en heyecan verici takımlarındandır.",
      en: "Mexico is one of the most iconic and loyal participants in World Cup history. Having hosted two legendary tournaments in 1970 and 1986, the country is famous for the breathtaking atmosphere of the Estadio Azteca. As a co-host of 2026, they boast the honor of hosting the opening match at Azteca.",
      es: "México es uno de los participantes más icónicos de la historia de los Mundiales. Anfitrión de dos torneos legendarios en 1970 y 1986, es famoso por la atmósfera del Estadio Azteca. Como coanfitrión de 2026, tendrá el honor del partido inaugural.",
      fr: "Le Mexique est l'un des participants les plus emblématiques de la Coupe du Monde. Ayant accueilli les éditions légendaires de 1970 et 1986, le pays est célèbre pour l'Estadio Azteca. En 2026, il co-organise le tournoi.",
      de: "Mexiko ist einer der treuesten Teilnehmer der WM-Geschichte. Nach den legendären Turnieren 1970 und 1986 ist das Land stolz auf das Aztekenstadion. Als Co-Gastgeber 2026 hat es die Ehre des Eröffnungsspiels."
    },
    achievements: {
      tr: "2x FIFA Dünya Kupası Çeyrek Finalisti (1970, 1986) · 12x CONCACAF Altın Kupa Şampiyonu · 1x FIFA Konfederasyonlar Kupası Şampiyonu (1999).",
      en: "2x FIFA World Cup Quarter-Finalists (1970, 1986) · 12x CONCACAF Gold Cup Champions · 1x FIFA Confederations Cup Champions (1999).",
      es: "2 veces Cuartofinalista del Mundial (1970, 1986) · 12 veces Campeón de la Copa Oro CONCACAF · 1 vez Campeón de la Copa Confederaciones (1999).",
      fr: "2x Quart-de-finaliste de la Coupe du Monde (1970, 1986) · 12x Vainqueur de la Gold Cup de la CONCACAF · 1x Coupe des Confédérations (1999).",
      de: "2x WM-Viertelfinalist (1970, 1986) · 12x CONCACAF-Gold-Cup-Sieger · 1x FIFA-Konföderationen-Pokal-Sieger (1999)."
    }
  }
};

// Return country details helper with safe dynamic fallback for all 48 teams
export function getCountryDetail(teamId: string, teamNameTr: string, teamNameEn: string): CountryDetail {
  const customDetail = COUNTRY_DETAILS[teamId.toLowerCase()];
  if (customDetail) return customDetail;

  // Fully dynamic localized fallback for other countries
  return {
    teamId,
    capital: {
      tr: "Belirtilmedi",
      en: "Not Specified",
      es: "No Especificado",
      fr: "Non spécifié",
      de: "Nicht angegeben"
    },
    population: {
      tr: "Bilinmiyor",
      en: "Unknown",
      es: "Desconocido",
      fr: "Inconnu",
      de: "Unbekannt"
    },
    nickname: {
      tr: teamNameTr,
      en: teamNameEn,
      es: teamNameEn,
      fr: teamNameEn,
      de: teamNameEn
    },
    history: {
      tr: `${teamNameTr} milli futbol takımı, 2026 Dünya Kupası'nda kendi tarihi ve futbol kültürünü temsil ederek en iyisini başarmayı hedefliyor. Taraftarlarının tutkusuyla sahaya çıkacak ekip, turnuvada sürpriz sonuçlar almaya hazır.`,
      en: `The ${teamNameEn} national football team aims to achieve its best in the 2026 World Cup, representing its history and football culture. Powered by the passion of their fans, they are ready to produce surprise results in the tournament.`,
      es: `El equipo nacional de fútbol de ${teamNameEn} tiene como objetivo dar lo mejor de sí en la Copa del Mundo 2026, representando su historia y cultura futbolística. Con la pasión de su afición, están listos para dar sorpresas.`,
      fr: `L'équipe nationale de football de ${teamNameEn} vise à donner le meilleur d'elle-même lors de la Coupe du Monde 2026, forte de son histoire et de sa culture du football. Prête à créer la surprise.`,
      de: `Die Nationalmannschaft von ${teamNameEn} möchte bei der Weltmeisterschaft 2026 ihr Bestes geben und ihre Geschichte und Fußballkultur stolz repräsentieren. Sie sind bereit für Überraschungen.`
    },
    achievements: {
      tr: "FIFA Turnuvaları Katılımcısı · Bölgesel Lig Rekabetçisi.",
      en: "FIFA Tournaments Contender · Regional Championship Competitor.",
      es: "Competidor en Torneos FIFA · Competidor de Campeonatos Regionales.",
      fr: "Compétiteur des tournois FIFA · Concurrent des championnats régionaux.",
      de: "FIFA-Turnier-Teilnehmer · Regionaler Meisterschafts-Konkurrent."
    }
  };
}
