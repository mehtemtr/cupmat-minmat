import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchAndStoreNews, cleanText, calculateTitleSimilarity } from "@/lib/news-fetcher";

// Minimum interval between background news fetches (2 hours = 120 minutes)
const LAZY_FETCH_INTERVAL_MS = 2 * 60 * 60 * 1000;

// Track in-memory lock to prevent concurrent triggers in same server instance
let isFetchingNews = false;

// Expanded 9-Language Article Dictionaries (NewsGlo Multilingual Dataset)
const MULTILINGUAL_NEWS_DATASET: Array<{
  id: string;
  category: string;
  source: string;
  link: string;
  published_at: string;
  translations: Record<string, { title: string; snippet: string }>;
}> = [
  {
    id: "newsglo-10-kasim-ataturk-2026",
    category: "General",
    source: "Statmatik News / 10 Kasım Özel",
    link: "https://statmatik.com",
    published_at: new Date().toISOString(),
    translations: {
      tr: {
        title: "10 Kasım Atatürk'ü Anma Günü: Saat 09:05'te Duran Zaman Değil, Sonsuzluğa Uzanan Sarsılmaz Vefamızdır! (1881–193∞)",
        snippet: "Cumhuriyetimizin kurucusu Büyük Önder Gazi Mustafa Kemal Atatürk'ü ebediyete irtihalinin 88. yıl dönümünde sonsuz saygı, minnet ve özlemle anıyoruz. Saat 09:05'te tüm ziyaretçilerimizi 1 dakikalık saygı duruşuna davet ediyoruz.",
      },
      en: {
        title: "November 10 Atatürk Memorial Day: At 09:05 AM, A Nation Stands in Eternal Gratitude and Respect for Mustafa Kemal Atatürk (1881–193∞)",
        snippet: "On the 88th anniversary of the passing of Gazi Mustafa Kemal Atatürk, founder of the Republic of Turkey, we remember his timeless vision of science, justice, and morality with boundless respect and invite everyone to a 1-minute moment of silence at 09:05 AM.",
      },
      de: {
        title: "10. November Gedenktag für Atatürk: Um 09:05 Uhr steht eine ganze Nation in ewiger Dankbarkeit und Ehrfurcht (1881–193∞)",
        snippet: "Am 88. Jahrestag des Todes von Gazi Mustafa Kemal Atatürk, dem Gründer der Republik Türkei, gedenken wir seines zeitlosen Vermächtnisses mit tiefem Respekt und laden um 09:05 Uhr zu einer Schweigeminute ein.",
      },
      fr: {
        title: "10 Novembre Journée de Commémoration d'Atatürk : À 09h05, l'hommage éternel d'une nation à Mustafa Kemal Atatürk (1881–193∞)",
        snippet: "À l'occasion du 88e anniversaire de la disparition de Gazi Mustafa Kemal Atatürk, fondateur de la République de Turquie, nous saluons sa vision éternelle avec respect et invitons chacun à une minute de silence à 09h05.",
      },
      es: {
        title: "10 de Noviembre Día de Conmemoración de Atatürk: A las 09:05, el homenaje eterno de una nación a Mustafa Kemal Atatürk (1881–193∞)",
        snippet: "En el 88.º aniversario del fallecimiento de Gazi Mustafa Kemal Atatürk, fundador de la República de Turquía, honramos su legado eterno con profundo respeto e invitamos a un minuto de silencio a las 09:05.",
      },
      it: {
        title: "10 Novembre Giorno della Memoria di Atatürk: Alle 09:05, il tributo eterno di una nazione a Mustafa Kemal Atatürk (1881–193∞)",
        snippet: "Nell'88° anniversario della scomparsa di Gazi Mustafa Kemal Atatürk, fondatore della Repubblica di Turchia, ricordiamo la sua visione immortale con profondo rispetto e invitiamo a un minuto di silenzio alle 09:05.",
      },
      pt: {
        title: "10 de Novembro Dia em Memória de Atatürk: Às 09:05, a eterna gratidão de uma nação a Mustafa Kemal Atatürk (1881–193∞)",
        snippet: "No 88º aniversário do falecimento de Gazi Mustafa Kemal Atatürk, fundador da República da Turquia, honramos seu legado imortal com profundo respeito e convidamos a um minuto de silêncio às 09:05.",
      },
      ar: {
        title: "10 نوفمبر ذكرى رحيل مصطفى كمال أتاتورك: في الساعة 09:05 تقف الأمة وفاءً وإجلالاً لمؤسس الجمهورية (1881–193∞)",
        snippet: "في الذكرى الثامنة والثمانين لرحيل الغازي مصطفى كمال أتاتورك مؤسس الجمهورية التركية، نستذكر إرثه الخالد بكل احترام وندعو الجميع للوقوف دقيقة صمت في تمام الساعة 09:05 صباحاً.",
      },
      ko: {
        title: "11월 10일 무스타파 케말 아타튀르크 추모의 날: 오전 09시 05분, 영원한 존경과 감사의 1분 묵념 (1881–193∞)",
        snippet: "튀르키예 공화국의 국부 가즈 무스타파 케말 아타튀르크 서거 88주기를 맞아 그의 시대를 초월한 비전을 기리며 오전 09시 05분 1분간의 추모 묵념에 여러분을 초대합니다.",
      },
    },
  },
  {
    id: "newsglo-azerbaijan-victory-day-2026",
    category: "General",
    source: "Statmatik News / AZERTAC / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 5 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Can Azerbaycan'ın 8 Kasım Zafer Günü (Zəfər Günü) Kutlu Olsun: Karabağ'ın İncisi Şuşa'dan Yükselen Ebedi Kardeşlik ve Zafer!",
        snippet: "Tek millet, iki devlet! Azerbaycan'ın tarihi topraklarını özgürlüğüne kavuşturduğu 44 günlük Vatan Muharebesi'nin taçlandığı 8 Kasım Zafer Günü büyük bir gurur ve coşkuyla kutlanıyor.",
      },
      en: {
        title: "Azerbaijan Celebrates November 8 Victory Day (Zəfər Günü): Honoring Heroism, Peace, and the Liberation of Shusha",
        snippet: "Across Azerbaijan and the Turkic world, November 8 marks Victory Day—commemorating the historic triumph in Shusha, national unity, and the enduring symbol of the Khari Bulbul flower.",
      },
      es: {
        title: "Azerbaiyán conmemora el Día de la Victoria (8 de Noviembre): Homenaje al heroísmo, la paz y la liberación de Shusha",
        snippet: "El 8 de noviembre, Azerbaiyán celebra con orgullo el Día de la Victoria (Zəfər Günü), honrando la unidad nacional y la memoria de sus héroes con el símbolo de la flor Khari Bulbul.",
      },
      fr: {
        title: "L'Azerbaïdjan célèbre le Jour de la Victoire (8 Novembre) : Hommage à l'héroïsme, à la paix et à la perle culturelle Choucha",
        snippet: "Le 8 novembre marque Zəfər Günü en Azerbaïdjan, journée de fierté nationale célébrant le triomphe historique de Choucha et la fraternité autour du symbole de la fleur Khari Bulbul.",
      },
      de: {
        title: "Aserbaidschan feiert den Tag des Sieges am 8. November (Zəfər Günü): Würdigung von Heldentum, Einheit und Frieden",
        snippet: "Am 8. November begeht Aserbaidschan den Tag des Sieges zur Erinnerung an die Befreiung der Kulturhauptstadt Schuscha im Zeichen der traditionsreichen Chari-Bülbül-Blume.",
      },
      it: {
        title: "L'Azerbaigian celebra il Giorno della Vittoria (8 Novembre): Omaggio all'eroismo, alla pace e alla storica Shusha",
        snippet: "L'8 novembre l'Azerbaigian festeggia con orgoglio Zəfər Günü, celebrando l'unità nazionale, la memoria dei martiri e il fiore simbolo Khari Bulbul.",
      },
      pt: {
        title: "Azerbaijão celebra o Dia da Vitória em 8 de Novembro (Zəfər Günü): Homenagem ao heroísmo, à paz e a Shusha",
        snippet: "Em 8 de novembro, o Azerbaijão comemora com orgulho o Dia da Vitória, exaltando a união nacional e a flor Khari Bulbul como símbolo de paz e triunfo.",
      },
      ar: {
        title: "أذربيجان تحتفل بيوم النصر (8 نوفمبر - Zəfər Günü): اعتزاز بالبطولة والوحدة الوطنية في ربوع شوشا وقره باغ",
        snippet: "تحتفل جمهورية أذربيجان في الثامن من نوفمبر بيوم النصر المجيد تخليداً لملحمة تحرير مدينة شوشا التاريخية وتكريماً لشهداء الوطن.",
      },
      ko: {
        title: "아제르바이잔 11월 8일 전승절(Victory Day • Zəfər Günü) 기념: 슈샤의 영광과 하리뷜뷜 꽃의 평화 메시지",
        snippet: "11월 8일 아제르바이잔이 역사적인 슈샤 해방과 국가적 단결을 기리는 전승절(Zəfər Günü)을 맞이하여 영웅들에게 경의를 표합니다.",
      },
    },
  },
  {
    id: "newsglo-singapore-deepavali-2026",
    category: "General",
    source: "Statmatik News / CNA / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 8 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Singapur'da 8 Kasım Deepavali / Diwali (Işık Festivali) Coşkusu: Işığın Karanlığa, İyiliğin Kötülüğe Zaferi Kutlanıyor!",
        snippet: "Singapur'da Little India sokaklarından Marina Bay kıyılarına kadar binlerce kandil (diya) ve rengârenk Rangoli motifleriyle Deepavali Işık Festivali büyük bir uyum ve neşeyle kutlanıyor.",
      },
      en: {
        title: "Singapore Celebrates Deepavali / Diwali (Festival of Lights) on November 8: A Radiant Triumph of Light, Hope, and Harmony",
        snippet: "From the dazzling street arches of Little India to Marina Bay, Singaporeans gather with glowing oil lamps (diyas) and vibrant Rangoli art to celebrate Deepavali.",
      },
      es: {
        title: "Singapur celebra Deepavali / Diwali (Festival de las Luces) el 8 de Noviembre: El triunfo de la luz, la esperanza y la armonía",
        snippet: "Desde Little India hasta Marina Bay, Singapur se ilumina con lámparas tradicionales (diyas) y coloridos diseños Rangoli para festejar el Festival de las Luces.",
      },
      fr: {
        title: "Singapour célèbre Deepavali / Diwali (Fête des Lumières) le 8 Novembre : Le triomphe éclatant de la lumière et de l'harmonie",
        snippet: "Des arches illuminées de Little India jusqu'à Marina Bay, Singapour célèbre Deepavali avec des lampes à huile (diyas) et des motifs floraux Rangoli.",
      },
      de: {
        title: "Singapur feiert Deepavali / Diwali (Lichterfest) am 8. November: Ein strahlendes Fest des Lichts, der Hoffnung und Harmonie",
        snippet: "Von den festlich beleuchteten Straßen in Little India bis zur Marina Bay feiert Singapur mit leuchtenden Öllampen (Diyas) und farbenfrohen Rangoli-Kunstwerken Deepavali.",
      },
      it: {
        title: "Singapore celebra Deepavali / Diwali (Festa delle Luci) l'8 Novembre: Il trionfo della luce, della speranza e dell'armonia",
        snippet: "Dalle luminarie di Little India fino a Marina Bay, Singapore festeggia Deepavali con lampade tradizionali (diya) e splendidi mosaici floreali Rangoli.",
      },
      pt: {
        title: "Singapura celebra Deepavali / Diwali (Festival das Luzes) em 8 de Novembro: O triunfo da luz, da esperança e da harmonia",
        snippet: "Das ruas iluminadas de Little India à Marina Bay, Singapura comemora o Deepavali com lâmpadas tradicionais (diyas) e vibrantes artes Rangoli.",
      },
      ar: {
        title: "سنغافورة تحتفل بمهرجان ديوالي / ديبافالي (مهرجان الأنوار) في 8 نوفمبر: احتفالية مضيئة بالأمل والوئام الثقافي",
        snippet: "تزدهر شوارع سنغافورة من ليتل إنديا إلى مارينا باي بآلاف المصابيح المضيئة والزخارف الملونة احتفالاً بمهرجان الأنوار (Deepavali).",
      },
      ko: {
        title: "싱가포르 11월 8일 디파발리 / 디왈리(Deepavali • 빛의 축제) 경축: 어둠을 밝히는 빛과 화합의 축제",
        snippet: "리틀 인디아의 화려한 불빛 아치부터 마리나 베이까지, 싱가포르 전역이 전통 등불(Diya)과 랑골리 예술로 빛의 축제 디파발리를 축하합니다.",
      },
    },
  },
  {
    id: "newsglo-azerbaijan-flag-day-2026",
    category: "General",
    source: "Statmatik News / AZERTAC / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 10 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Kardeş Azerbaycan'da 9 Kasım Devlet Bayrağı Günü (Dövlət Bayrağı Günü) Gururla Kutlanıyor: 'Bir Kere Yükselen Bayrak Bir Daha İnmez!'",
        snippet: "Azerbaycan Cumhuriyeti, bağımsızlığının ve milli birliğinin simgesi olan üç renkli şanlı bayrağını 9 Kasım Devlet Bayrağı Günü'nde Bakü'den Şuşa'ya tüm yurtta büyük bir coşkuyla selamlıyor.",
      },
      en: {
        title: "Azerbaijan Celebrates November 9 State Flag Day (Dövlət Bayrağı Günü): Tri-Color Banner Waves High from Baku to Shusha",
        snippet: "The Republic of Azerbaijan proudly marks State Flag Day on November 9, honoring the historic adoption of its blue, red, and green national flag as an eternal symbol of sovereignty and unity.",
      },
      es: {
        title: "Azerbaiyán celebra el Día de la Bandera Estatal (9 de Noviembre): Orgullo nacional y soberanía desde Bakú hasta Shusha",
        snippet: "La República de Azerbaiyán conmemora el 9 de noviembre el Día de la Bandera Estatal, honrando su enseña tricolor como símbolo eterno de independencia y unidad.",
      },
      fr: {
        title: "L'Azerbaïdjan célèbre la Journée du Drapeau National (9 Novembre) : Fierté et souveraineté de Bakou à Choucha",
        snippet: "La République d'Azerbaïdjan honore le 9 novembre son drapeau tricolore bleu, rouge et vert, symbole éternel d'indépendance, de modernité et d'unité nationale.",
      },
      de: {
        title: "Aserbaidschan feiert den Tag der Staatsflagge (9. November): Die Trikolore weht stolz von Baku bis Schuscha",
        snippet: "Am 9. November begeht die Republik Aserbaidschan feierlich den Tag der Staatsflagge als zeitloses Symbol für Souveränität, Freiheit und nationale Einheit.",
      },
      it: {
        title: "L'Azerbaigian celebra la Giornata della Bandiera Nazionale (9 Novembre): Orgoglio e sovranità da Baku a Shusha",
        snippet: "Il 9 novembre la Repubblica dell'Azerbaigian rende omaggio al suo tricolore blu, rosso e verde, simbolo eterno di indipendenza e identità nazionale.",
      },
      pt: {
        title: "Azerbaijão celebra o Dia da Bandeira Nacional (9 de Novembro): Orgulho e soberania de Baku a Shusha",
        snippet: "A República do Azerbaijão comemora em 9 de novembro o Dia da Bandeira Estatal, exaltando seu pavilhão tricolor como símbolo de liberdade e união.",
      },
      ar: {
        title: "أذربيجان تحتفل بيوم العلم الوطني (9 نوفمبر): الراية ثلاثية الألوان ترفرف بشموخ من باكو إلى شوشا",
        snippet: "تحتفي جمهورية أذربيجان في التاسع من نوفمبر بيوم العلم الوطني اعتزازاً برايتها ذات الألوان الأزرق والأحمر والأخضر رمزاً خالداً للسيادة والوحدة.",
      },
      ko: {
        title: "아제르바이잔 11월 9일 국기의 날(State Flag Day) 경축: 바쿠에서 슈샤까지 휘날리는 삼색기",
        snippet: "아제르바이잔 공화국이 11월 9일 국기의 날을 맞아 주권과 민족 단결의 영원한 상징인 청·적·녹 삼색기를 자랑스럽게 기립니다.",
      },
    },
  },
  {
    id: "newsglo-all-saints-all-souls-day-2026",
    category: "General",
    source: "Statmatik News / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 20 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Dünyada 1–2 Kasım All Saints' Day (Azizler Günü) ve All Souls' Day (Tüm Ruhları Anma Günü) Huzur ve Vefa İle İdrak Ediliyor",
        snippet: "1 ve 2 Kasım tarihlerinde tüm dünyada milyonlarca insan, iyiliğin ve merhametin mirasını selamlarken aramızdan ayrılan sevdiklerini mum ışıkları, çiçekler ve dualarla anıyor.",
      },
      en: {
        title: "World Observes All Saints' Day and All Souls' Day (November 1–2): A Global Tribute of Light, Peace, and Eternal Remembrance",
        snippet: "Across Europe, the Americas, and around the globe, communities gather on November 1 and 2 with glowing candles and flowers to honor saints and cherished loved ones.",
      },
      es: {
        title: "El Mundo Conmemora el Día de Todos los Santos y el Día de los Fieles Difuntos (1–2 de Noviembre) con Luz, Paz y Recuerdo",
        snippet: "Millones de familias en España, América Latina y todo el mundo honran con velas, flores y amor la memoria eterna de sus seres queridos en estas fechas sagradas.",
      },
      fr: {
        title: "Le Monde célèbre la Toussaint et la Commémoration des Fidèles Défunts (1–2 Novembre) dans la Lumière et le Recueillement",
        snippet: "Les 1er et 2 novembre, des millions de personnes honorent avec paix, fleurs et bougies la mémoire de leurs proches disparus et l'héritage de bonté universelle.",
      },
      de: {
        title: "Weltweites Gedenken zu Allerheiligen und Allerseelen (1.–2. November): Tage des Lichts, des Friedens und der Erinnerung",
        snippet: "Am 1. und 2. November versammeln sich Menschen weltweit bei Kerzenschein und Blumen, um der Heiligen und aller verstorbenen geliebten Menschen in Stille zu gedenken.",
      },
      it: {
        title: "Il Mondo celebra Ognissanti e la Commemorazione dei Defunti (1–2 Novembre) tra Luce, Pace e Affetto Eterno",
        snippet: "L'1 e il 2 novembre comunità in tutto il mondo rendono omaggio con fiori e candele alla memoria dei propri cari e ai valori universali di bontà e speranza.",
      },
      pt: {
        title: "O Mundo celebra o Dia de Todos os Santos e o Dia de Finados (1–2 de Novembro) com Luz, Paz e Eterna Saudade",
        snippet: "Nos dias 1 e 2 de novembro, famílias em todo o mundo prestam homenagem com velas, flores e orações à memória eterna daqueles que amamos.",
      },
      ar: {
        title: "العالم يحيي عيد جميع القديسين ويوم تذكار الموتى (1–2 نوفمبر) في أجواء من النور والسلام والوفاء",
        snippet: "يجتمع الملايين حول العالم في الأول والثاني من نوفمبر لإضاءة الشموع وتقديم الزهور إحياءً لذكرى الأحبة الراحلين وترسيخاً لقيم المحبة والسلام.",
      },
      ko: {
        title: "전 세계 11월 1–2일 모든 성인의 날(All Saints' Day) 및 위령의 날(All Souls' Day) 추모: 빛과 평화의 기억",
        snippet: "11월 1일과 2일, 세계 곳곳에서 촛불과 꽃을 밝히며 인류에 빛을 남긴 성인들과 세상을 떠난 소중한 가족 및 이웃을 따뜻하게 기립니다.",
      },
    },
  },
  {
    id: "newsglo-29-ekim-cumhuriyet-bayrami-2026",
    category: "General",
    source: "Statmatik News / Cumhuriyet Özel",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 30 * 1000).toISOString(),
    translations: {
      tr: {
        title: "29 Ekim Cumhuriyet Bayramımız Kutlu Olsun: Sporda, Adalette ve Hayatın Her Alanında Temiz Bir Gelecek İçin Atatürk'ün Askerleriyiz!",
        snippet: "Cumhuriyet, şahsi menfaat odaklarının veya saha arkasında dönen kirli oyunların parçası olamayacak kadar büyüktür. Emanetine sadakatle Cumhuriyetimizin 103. yılını kutluyoruz.",
      },
      en: {
        title: "Happy October 29 Republic Day of Turkey: Standing Firm for Integrity, Justice, and a Clean Future in Sports and Life",
        snippet: "The Republic is far too great to be part of self-serving interest groups or dirty behind-the-scenes games. Celebrating the 103rd anniversary of the Republic with loyalty to Atatürk's legacy.",
      },
      de: {
        title: "Alles Gute zum 29. Oktober Tag der Republik der Türkei: Für Gerechtigkeit, Fair Play und eine saubere Zukunft",
        snippet: "Wir feiern den 103. Jahrestag der Türkischen Republik in unerschütterlicher Treue zum Vermächtnis von Mustafa Kemal Atatürk.",
      },
      fr: {
        title: "Joyeuse Fête de la République de Turquie (29 Octobre) : Pour la justice, l'intégrité et un avenir propre dans le sport et la vie",
        snippet: "Nous célébrons avec fierté le 103e anniversaire de la République de Turquie avec une fidélité inébranlable à l'héritage d'Atatürk.",
      },
      es: {
        title: "¡Feliz Día de la República de Turquía (29 de Octubre)! Por la justicia, el juego limpio y un futuro íntegro",
        snippet: "Celebramos el 103.º aniversario de la República de Turquía con lealtad inquebrantable al legado de Mustafa Kemal Atatürk.",
      },
      it: {
        title: "Felice Festa della Repubblica di Turchia (29 Ottobre): Per la giustizia, il fair play e un futuro pulito nello sport e nella vita",
        snippet: "Celebriamo il 103° anniversario della Repubblica di Turchia con incrollabile fedeltà all'eredità di Mustafa Kemal Atatürk.",
      },
      pt: {
        title: "Feliz Dia da República da Turquia (29 de Outubro): Pela justiça, integridade e um futuro limpo no esporte e na vida",
        snippet: "Celebramos o 103º aniversário da República da Turquia com lealdade inabalável ao legado de Mustafa Kemal Atatürk.",
      },
      ar: {
        title: "عيد جمهورية سعيد لتركيا (29 أكتوبر): من أجل العدالة والنزاهة ومستقبل نظيف في الرياضة والحياة",
        snippet: "نحتفل بالذكرى الـ 103 لتأسيس الجمهورية التركية بوفاء راسخ لإرث غازي مصطفى كمال أتاتورك.",
      },
      ko: {
        title: "10월 29일 튀르키예 공화국의 날 축하: 스포츠와 삶의 모든 영역에서 정의롭고 깨끗한 미래를 향하여",
        snippet: "아타튀르크의 유산에 대한 변함없는 충성심으로 튀르키예 공화국 수립 103주년을 기념합니다.",
      },
    },
  },
  {
    id: "newsglo-kenya-mashujaa-day-2026",
    category: "General",
    source: "Statmatik News / KBC / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Kenya'da 20 Ekim Mashujaa Day (Kahramanlar Günü) Coşkusu: Özgürlük ve Birlik Kahramanları Anılıyor",
        snippet: "Kenya Cumhuriyeti, bağımsızlık mücadelesinin öncülerini ve ülkenin kalkınmasına, kültürüne ve birliğine değer katan tüm kahramanlarını (Mashujaa) 20 Ekim Kahramanlar Günü'nde büyük bir gururla selamlıyor.",
      },
      en: {
        title: "Kenya Celebrates Mashujaa Day (Heroes' Day): Honoring Champions of Freedom, Unity, and Progress",
        snippet: "Across Kenya and the world, 20 October marks Mashujaa Day—a proud national tribute to the heroes of independence and the visionary men and women shaping Kenya's bright future.",
      },
      ar: {
        title: "كينيا تحتفل بيوم المشوجا (يوم الأبطال): تكريم رواد الحرية والوحدة والتقدم الوطني",
        snippet: "تحتفل جمهورية كينيا في 20 أكتوبر بيوم الأبطال الوطني (Mashujaa Day) تخليداً لذكرى أبطال الاستقلال وكل من ساهم في بناء الوطن وازدهاره.",
      },
      fr: {
        title: "Le Kenya célèbre le Mashujaa Day (Journée des Héros) : Hommage aux bâtisseurs de la liberté et de l'unité",
        snippet: "En ce 20 octobre, le peuple kényan honore avec fierté les héros de l'indépendance ainsi que toutes les figures qui contribuent au progrès et au rayonnement de la nation.",
      },
      de: {
        title: "Kenia feiert den Mashujaa Day (Heldengedenktag): Würdigung der Helden von Freiheit und Einheit",
        snippet: "Am 20. Oktober ehrt die Republik Kenia am Mashujaa Day die Wegbereiter der Unabhängigkeit sowie alle Bürgerinnen und Bürger, die den Fortschritt des Landes prägen.",
      },
      es: {
        title: "Kenia conmemora el Mashujaa Day (Día de los Héroes): Homenaje a los forjadores de la libertad y la unidad",
        snippet: "El 20 de octubre, Kenia celebra con orgullo a los héroes de su independencia y a quienes impulsan el desarrollo, la cultura y la paz de la nación.",
      },
      it: {
        title: "Il Kenya celebra il Mashujaa Day (Giorno degli Eroi): Omaggio ai custodi della libertà e dell'unità",
        snippet: "Il 20 ottobre la Repubblica del Kenya rende onore agli eroi dell'indipendenza e a tutti i cittadini che contribuiscono alla crescita e alla prosperità del Paese.",
      },
      pt: {
        title: "Quênia celebra o Mashujaa Day (Dia dos Heróis): Homenagem aos campeões da liberdade e da união",
        snippet: "Em 20 de outubro, o Quênia celebra com orgulho os heróis da independência e todos aqueles que dedicam suas vidas ao progresso e à paz da nação.",
      },
      ko: {
        title: "케냐 10월 20일 마슈자 데이(영웅의 날) 기념: 자유와 단결의 영웅들을 기리며",
        snippet: "케냐 공화국은 10월 20일 마슈자 데이(Mashujaa Day)를 맞아 독립운동의 선구자들과 국가 발전 및 평화에 헌신한 모든 영웅들을 자랑스럽게 기립니다.",
      },
    },
  },
  {
    id: "newsglo-tunisia-evacuation-day-2026",
    category: "General",
    source: "Statmatik News / TAP / Global Heritage",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Tunus'ta 15 Ekim Tahliye Günü Coşkusu: 63 Yıllık Tam Bağımsızlık ve Hürriyet Anılıyor",
        snippet: "15 Ekim 1963'te son yabancı askeri birliğin Bizerte'den çekilmesiyle kazanılan tam bağımsızlığın simgesi 'Tahliye Günü' (Eid al-Jala') Tunus'ta ve dünyada gururla kutlanıyor.",
      },
      en: {
        title: "Tunisia Marks Evacuation Day: Commemorating 63 Years of Complete Sovereignty and Freedom",
        snippet: "Tunisia commemorates the 15 October 1963 evacuation of foreign troops from Bizerte, celebrating the historic milestone of full territorial sovereignty, freedom, and national pride.",
      },
      ar: {
        title: "تونس تحتفل بالذكرى المجيدة لعيد الجلاء: استكمال السيادة الوطنية واستقلال بنزرت",
        snippet: "يحتفل الشعب التونسي بالذكرى التاريخية لعيد الجلاء (15 أكتوبر 1963)، خروج آخر جندي أجنبي من أرض الوطن وتتويج نضال التونسيين من أجل السيادة والحرية الكاملة.",
      },
      fr: {
        title: "La Tunisie célèbre la Fête de l'Évacuation : Commémoration de la souveraineté nationale retrouvée",
        snippet: "Le 15 octobre 1963, l'évacuation des dernières troupes étrangères de Bizerte consacrait l'indépendance totale et l'intégrité territoriale de la République Tunisienne.",
      },
      de: {
        title: "Tunesien feiert den Tag der Evakuierung: Gedenken an die volle nationale Souveränität",
        snippet: "Am 15. Oktober 1963 verließen die letzten ausländischen Truppen Bizerte – ein historischer Meilenstein für die vollständige Souveränität und Freiheit Tunesiens.",
      },
      es: {
        title: "Túnez conmemora el Día de la Evacuación: Celebración de la plena soberanía nacional",
        snippet: "El 15 de octubre marca la retirada de las últimas tropas extranjeras de Bizerta en 1963, sellando la independencia total y la libertad del pueblo tunecino.",
      },
      it: {
        title: "La Tunisia celebra la Festa dell'Evacuazione: Omaggio alla piena sovranità nazionale",
        snippet: "Il 15 ottobre si commemora l'evacuazione delle ultime truppe straniere da Biserta nel 1963, simbolo imperituro di indipendenza, pace e unità tunisina.",
      },
      pt: {
        title: "Tunísia celebra o Dia da Evacuação: Homenagem à plena soberania e liberdade",
        snippet: "O dia 15 de outubro de 1963 marcou a retirada das últimas tropas estrangeiras de Bizerte, consagrando a total soberania e integridade da Tunísia.",
      },
      ko: {
        title: "튀니지 10월 15일 철수 기념일(Evacuation Day): 완전한 주권과 자유를 기리며",
        snippet: "1963년 10월 15일 비제르테에서 마지막 외국 군대가 철수하며 완성된 튀니지의 완전한 독립과 주권 회복을 기념하는 뜻깊은 날을 맞이했습니다.",
      },
    },
  },
  {
    id: "newsglo-chuseok-midautumn-2026",
    category: "General",
    source: "Global Cultural News / Yonhap / Xinhua",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Doğu Asya'da Dolunay ve Hasat Coşkusu: Chuseok ve Güz Ortası Festivalleri Kutlanıyor",
        snippet: "Güney Kore'de Chuseok, Çin, Tayvan, Vietnam ve Hong Kong'da Güz Ortası Festivali ile Japonya'da Tsukimi dolunay gelenekleri milyonlarca aileyi bir araya getiriyor. Birlik, bereket ve şükran dolu asırlık gelenekler kutlanıyor.",
      },
      en: {
        title: "East Asia Celebrates Harvest Full Moon: Chuseok and Mid-Autumn Festivals in Full Bloom",
        snippet: "Chuseok in South Korea, the Mid-Autumn Festival across China, Taiwan, Vietnam, Hong Kong, and Tsukimi in Japan bring millions together under the harvest full moon to celebrate heritage, family unity, and gratitude.",
      },
      ko: {
        title: "보름달 아래 하나 되는 한가위: 한국 추석 및 동아시아 중추절 맞이 축제",
        snippet: "온 가족이 모여 풍요와 감사를 나누는 한국의 대명절 추석과 중국, 베트남 등의 중추절, 일본의 쓰키미가 시작되며 동아시아 전역이 풍성한 명절 분위기로 물들고 있습니다.",
      },
      de: {
        title: "Ostasien feiert das Ernte-Vollmondfest: Chuseok und Mondfest im Mittelpunkt",
        snippet: "Millionen von Familien in Südkorea (Chuseok), China, Taiwan, Vietnam und Japan (Tsukimi) versammeln sich unter dem leuchtenden Herbstvollmond, um Ernte, Verbundenheit und Dankbarkeit zu feiern.",
      },
      fr: {
        title: "L'Asie de l'Est célèbre la pleine lune des récoltes : Chuseok et la fête de la mi-automne",
        snippet: "Chuseok en Corée du Sud, la fête de la mi-automne en Chine et au Vietnam, et Tsukimi au Japon réunissent des millions de familles sous la pleine lune pour célébrer la générosité des récoltes et l'unité.",
      },
      es: {
        title: "Asia Oriental celebra la luna llena de la cosecha: Festivales de Chuseok y Medio Otoño",
        snippet: "Chuseok en Corea del Sur, el Festival del Medio Otoño en China, Taiwán y Vietnam, y Tsukimi en Japón reúnen a millones de familias bajo la luna llena para conmemorar la gratitud y la abundancia.",
      },
      it: {
        title: "L'Asia orientale festeggia la luna d'autunno: Chuseok e la Festa di Metà Autunno",
        snippet: "Il Chuseok in Corea del Sud, la Festa di Metà Autunno in Cina e Vietnam e lo Tsukimi in Giappone uniscono milioni di persone sotto la luna piena per celebrare il raccolto e la famiglia.",
      },
      pt: {
        title: "Ásia Oriental celebra a lua cheia da colheita: Festivais de Chuseok e Meio do Outono",
        snippet: "O Chuseok na Coreia do Sul, o Festival do Meio do Outono na China e Vietnã, e o Tsukimi no Japão reúnem milhões de pessoas para celebrar a colheita, a união familiar e a prosperidade.",
      },
      ar: {
        title: "شرق آسيا يحتفل باكتمال قمر الحصاد: انطلاق مهرجانات تشوسوك ومنتصف الخريف",
        snippet: "يحتفل الملايين في كوريا الجنوبية بمهرجان تشوسوك، وفي الصين وفيتنام بمهرجان منتصف الخريف، وفي اليابان بمهرجان تسوكيمي، حيث يجتمع الأهل تحت ضوء البدر للاحتفاء بالبركة والامتنان.",
      },
    },
  },
  {
    id: "newsglo-tsukimi-mooncake-tradition",
    category: "General",
    source: "Asian Heritage Digest",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Ay Çöreği ve Songpyeon: Asırlık Lezzetler Dolunay Altında Paylaşılıyor",
        snippet: "Güz Ortası Festivali'nin simgesi meşhur Ay Çörekleri (Mooncakes) ile Chuseok bayramının vazgeçilmezi Songpyeon pirinç tatlıları, bereket ve sevgi simgesi olarak sofraları süslüyor.",
      },
      en: {
        title: "Mooncakes and Songpyeon: Ancient Delicacies Shared Under the Autumn Moon",
        snippet: "Traditional Mooncakes representing unity and Chuseok's half-moon Songpyeon rice cakes filled with sweet sesame and chestnuts take center stage in festive harvest culinary traditions.",
      },
      ko: {
        title: "달콤한 송편과 월병: 보름달 아래 나누는 오랜 명절의 맛과 정",
        snippet: "추석의 대표 음식인 정성 어린 송편과 중추절의 상징인 월병(Mooncake)이 가족 간의 정과 풍요를 기원하는 식탁을 가득 채우고 있습니다.",
      },
      de: {
        title: "Mondkuchen und Songpyeon: Jahrhundertealte Festtagstraditionen geteilt",
        snippet: "Traditionelle Mondkuchen für Vollkommenheit und koreanische Songpyeon-Reiskuchen schmücken die Festtafeln während der herbstlichen Vollmondfeiertage in ganz Asien.",
      },
      fr: {
        title: "Gâteaux de lune et Songpyeon : Des délices ancestraux partagés sous la lune",
        snippet: "Les célèbres gâteaux de lune chinois et les Songpyeon coréens célèbrent le partage et l'abondance lors des grandes festivités d'automne.",
      },
      es: {
        title: "Pasteles de luna y Songpyeon: Tradición y dulzura bajo la luna de otoño",
        snippet: "Los emblemáticos pasteles de luna y los Songpyeon coreanos representan la unión familiar y la prosperidad en las mesas festivas de toda Asia.",
      },
      it: {
        title: "Dolci della luna e Songpyeon: Tradizioni millenarie sotto la luna d'autunno",
        snippet: "I tradizionali Mooncakes e i dolci di riso Songpyeon simboleggiano armonia e prosperità nelle celebrazioni del raccolto in tutta l'Asia.",
      },
      pt: {
        title: "Bolos da Lua e Songpyeon: Iguarias ancestrais sob a luz da lua de outono",
        snippet: "Os famosos bolos da lua e os doces de arroz Songpyeon enchem as mesas festivas simbolizando a harmonia, a união e a partilha.",
      },
      ar: {
        title: "كعك القمر وسونغبيون: أطباق تراثية متوارثة تُزين موائد مهرجانات الخريف",
        snippet: "يُزين كعك القمر الشهير وحلوى السونغبيون الكورية الموائد الاحتفالية كرمز للمحبة والوئام والبركة تحت ضوء البدر الساطع.",
      },
    },
  },
  {
    id: "newsglo-video-matematik",
    category: "Science",
    source: "YouTube",
    link: "https://www.youtube.com/watch?v=C6epOnQk2gk",
    published_at: new Date().toISOString(),
    translations: {
      tr: {
        title: "Matematiğin Bir Şeyi Yok",
        snippet: "StatMatik, hayatın ve verilerin arkasındaki mantığı eğlenceli ve vizyoner bir ekosisteme dönüştürüyor.",
      },
      en: {
        title: "Math Has Nothing to Fear",
        snippet: "StatMatik transforms the logic behind life and data into a fun and visionary ecosystem.",
      },
      de: {
        title: "Mathematik ist keine Hexerei",
        snippet: "StatMatik verwandelt die Logik hinter Leben und Daten in ein unterhaltsames und visionäres Ökosystem.",
      },
      fr: {
        title: "Les Mathématiques n'ont Rien de Sorcier",
        snippet: "StatMatik transforme la logique derrière la vie et les données en un écosystème amusant et visionnaire.",
      },
      es: {
        title: "Las Matemáticas No Tienen Misterio",
        snippet: "StatMatik transforma la lógica detrás de la vida y los datos en un ecosistema divertido y visionario.",
      },
      it: {
        title: "La Matematica Non Ha Segreti",
        snippet: "StatMatik trasforma la logica dietro la vita e i dati in un ecosistema divertente e visionario.",
      },
      pt: {
        title: "A Matemática Não Tem Segredo",
        snippet: "StatMatik transforma a lógica por trás da vida e dos dados em um ecossistema divertido e visionário.",
      },
      ar: {
        title: "الرياضيات لا تعقيد فيها",
        snippet: "يحول StatMatik المنطق الكامن وراء الحياة والبيانات إلى منظومة ممتعة ورؤيوية.",
      },
      ko: {
        title: "수학은 두려울 것이 없습니다",
        snippet: "StatMatik은 삶과 데이터 이면의 논리를 재미있고 비전 있는 생태계로 변환합니다.",
      },
    },
  },
  {
    id: "newsglo-1",
    category: "Science",
    source: "NASA / Deep Space Mission",
    link: "https://www.nasa.gov",
    published_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "James Webb Teleskobu Derin Uzayda Su Buharı Demetleri Keşfetti",
        snippet: "Gökbilimciler, James Webb Uzay Teleskobu'nu kullanarak uzak bir ötegezegende yaşamın temel yapı taşlarından su buharı tespit etti.",
      },
      en: {
        title: "James Webb Telescope Discovers Water Vapor Plumes in Deep Space",
        snippet: "Astronomers using the James Webb Space Telescope detected water vapor and atmospheric layers on a distant exoplanet.",
      },
      de: {
        title: "James-Webb-Teleskop entdeckt Wasserdampfwolken im tiefen Weltraum",
        snippet: "Astronomen haben mit dem James-Webb-Weltraumteleskop Wasserdampf und atmosphärische Schichten auf einem fernen Exoplaneten nachgewiesen.",
      },
      fr: {
        title: "Le télescope James Webb découvre des panaches de vapeur d'eau dans l'espace profond",
        snippet: "Les astronomes utilisant le télescope spatial James Webb ont détecté de la vapeur d'eau sur une exoplanète lointaine.",
      },
      es: {
        title: "El telescopio James Webb descubre columnas de vapor de agua en el espacio profundo",
        snippet: "Los astrónomos que utilizan el telescopio espacial James Webb detectaron vapor de agua en un exoplaneta lejano.",
      },
      it: {
        title: "Il telescopio James Webb scopre pennacchi di vapore acqueo nello spazio profondo",
        snippet: "Gli astronomi che utilizzano il telescopio spaziale James Webb hanno rilevato vapore acqueo su un esopianeta lontano.",
      },
      pt: {
        title: "O telescópio James Webb descobre plumas de vapor de água no espaço profundo",
        snippet: "Astrônomos usando o Telescópio Espacial James Webb detectaram vapor de água em um exoplaneta distante.",
      },
      ar: {
        title: "تلسكوب جيمس ويب يكتشف أعمدة من بخار الماء في الفضاء العميق",
        snippet: "رصد علماء الفلك باستخدام تلسكوب جيمس ويب الفضائي بخار الماء وطبقات غلاف جوي على كوكب خارج المجموعة الشمسية.",
      },
      ko: {
        title: "제임스 웹 망원경, 심우주에서 수증기 기둥 발견",
        snippet: "천문학자들은 제임스 웹 우주망원경을 사용하여 먼 외계 행성에서 생명체의 핵심 요소인 수증기와 대기층을 포착했습니다.",
      },
    },
  },
  {
    id: "newsglo-2",
    category: "Technology",
    source: "Global AI Review",
    link: "https://www.reuters.com",
    published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "Çin ve ABD Arasında Yapay Zeka Yarışı: Yeni Nesil Model Dengeleri Değiştiriyor",
        snippet: "Yapay zeka alanındaki son teknolojik gelişmeler, küresel yazılım rekabetini yeni bir seviyeye taşıdı.",
      },
      en: {
        title: "AI Race Escalates Between US & China: Next-Gen Models Shift Global Balance",
        snippet: "Recent technological breakthroughs in artificial intelligence are driving global software competition to unprecedented heights.",
      },
      de: {
        title: "KI-Wettlauf zwischen USA & China: Modelle der nächsten Generation verändern das Gleichgewicht",
        snippet: "Jüngste technologische Durchbrüche in der künstlichen Intelligenz heben den globalen Softwarewettbewerb auf ein neues Niveau.",
      },
      fr: {
        title: "La course à l'IA s'intensifie entre les États-Unis et la Chine : les nouveaux modèles redéfinissent la donne",
        snippet: "Les récentes avancées technologiques en intelligence artificielle propulsent la compétition logicielle mondiale à un niveau supérieur.",
      },
      es: {
        title: "La carrera de IA se intensifica entre EE.UU. y China: Nuevos modelos cambian el equilibrio global",
        snippet: "Los avances recientes en inteligencia artificial están llevando la competencia mundial de software a un nivel sin precedentes.",
      },
      it: {
        title: "Corsa all'IA tra USA e Cina: I modelli di nuova generazione cambiano gli equilibri globali",
        snippet: "I recenti sviluppi tecnologici nell'intelligenza artificiale stanno portando la competizione globale sui software a nuovi livelli.",
      },
      pt: {
        title: "Corrida de IA se intensifica entre EUA e China: Novos modelos mudam o equilíbrio global",
        snippet: "Avanços recentes em inteligência artificial estão elevando a competição global de software a patamares inéditos.",
      },
      ar: {
        title: "سباق الذكاء الاصطناعي بين الولايات المتحدة والصين: النماذج الجديدة تعيد توازن القوى العالمية",
        snippet: "تؤدي التطورات التكنولوجية الأخيرة في مجال الذكاء الاصطناعي إلى رفع مستوى المنافسة البرمجية العالمية إلى آفاق غير سبقت.",
      },
      ko: {
        title: "미국-중국 AI 경쟁 심화: 차세대 모델이 글로벌 균형을 변화시키다",
        snippet: "최근 인공지능 분야의 기술적 대도약으로 전 세계 소프트웨어 경쟁이 새로운 차원으로 진입했습니다.",
      },
    },
  },
  {
    id: "newsglo-3",
    category: "Statmatik",
    source: "StatMatik / NewsGlo",
    link: "https://statmatik.com",
    published_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    translations: {
      tr: {
        title: "StatMatik ekosistemi büyüyor: NewsGlo yayında",
        snippet: "MinMat ve diğer StatMatik projelerinin ardından geliştirilen NewsGlo kullanıma açıldı. Platform, farklı ülkelerden güvenilir kaynakları bir araya getirerek teknoloji, bilim, sağlık, ekonomi ve çevre alanlarında güncel haberler sunuyor.",
      },
      en: {
        title: "The StatMatik Ecosystem Grows: NewsGlo Is Live",
        snippet: "Developed following MinMat and other StatMatik projects, NewsGlo is officially launched. The platform aggregates trusted global publishers covering tech, science, health, economy, and environment.",
      },
      de: {
        title: "Das StatMatik-Ökosystem wächst: NewsGlo ist online",
        snippet: "Nach MinMat und anderen StatMatik-Projekten wurde NewsGlo veröffentlicht. Die Plattform bündelt vertrauenswürdige globale Quellen für Technologie, Wissenschaft, Gesundheit, Wirtschaft und Umwelt.",
      },
      fr: {
        title: "L'écosystème StatMatik s'agrandit : NewsGlo est en ligne",
        snippet: "Développé dans la foulée de MinMat et des autres projets StatMatik, NewsGlo est officiellement disponible. La plateforme rassemble des sources fiables mondiales en technologie, science, santé, économie et environnement.",
      },
      es: {
        title: "El ecosistema StatMatik crece: NewsGlo ya está disponible",
        snippet: "Desarrollado tras MinMat y otros proyectos de StatMatik, NewsGlo ha sido lanzado oficialmente. La plataforma reúne fuentes confiables globales en tecnología, ciencia, salud, economía y medio ambiente.",
      },
      it: {
        title: "L'ecosistema StatMatik cresce: NewsGlo è online",
        snippet: "Sviluppato dopo MinMat e gli altri progetti StatMatik, NewsGlo è ora disponibile. La piattaforma raccoglie fonti globali affidabili su tecnologia, scienza, salute, economia e ambiente.",
      },
      pt: {
        title: "O ecossistema StatMatik cresce: NewsGlo está no ar",
        snippet: "Desenvolvido após o MinMat e outros projetos StatMatik, o NewsGlo está oficialmente disponível. A plataforma reúne fontes confiáveis globais de tecnologia, ciência, saúde, economia e meio ambiente.",
      },
      ar: {
        title: "منظومة StatMatik تتوسع: إطلاق منصة NewsGlo الإخبارية",
        snippet: "تم إطلاق منصة NewsGlo رسميًا بعد نجاح MinMat ومشاريع StatMatik الأخرى. تجمع المنصة مصادر عالمية موثوقة في مجالات التكنولوجيا والعلوم والصحة والاقتصاد والبيئة.",
      },
      ko: {
        title: "StatMatik 생태계 확장: NewsGlo 공식 오픈",
        snippet: "MinMat 및 기타 StatMatik 프로젝트에 이어 개발된 NewsGlo가 공식 출시되었습니다. 이 플랫폼은 기술, 과학, 건강, 경제, 환경 분야의 전 세계 신뢰할 수 있는 출처를 제공합니다.",
      },
    },
  },
];

// Lazy fetch has been disabled to prevent Vercel CPU limit issues.
// Cloudflare Workers (custom-worker.js) now handles automated fetching.

// In-memory translation cache to avoid repeated HTTP calls to Google Translate
const TRANSLATION_CACHE = new Map<string, string>();

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' 
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return text;
    const data = await res.json();
    const result = data[0].map((item: any) => item[0]).join("");
    if (result) {
      if (TRANSLATION_CACHE.size > 2000) TRANSLATION_CACHE.clear(); // Keep memory lean
      TRANSLATION_CACHE.set(cacheKey, result);
      return result;
    }
    return text;
  } catch (e) {
    return text;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const category = searchParams.get("category") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const lang = searchParams.get("lang") || "tr";

    // Lazy fetch is handled by Cloudflare Workers cron now.

    const offset = (page - 1) * limit;

    // 1. Try querying Supabase live DB news feed safely
    try {
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (key && key.includes(".")) {
          // Cloudflare environment base64 decode safe
          const b64 = key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = Buffer.from(b64, "base64").toString("utf8");
          const claims = JSON.parse(payload);
          const supabaseUrl = `https://${claims.ref}.supabase.co`;

          let fetchUrl = `${supabaseUrl}/rest/v1/news?select=id,title,snippet,source,category,link,published_at,featured_order&order=featured_order.asc.nullslast,published_at.desc&limit=${limit * 2}&offset=${offset}`;
          if (category !== "all") fetchUrl += `&category=eq.${encodeURIComponent(category)}`;
          if (search) fetchUrl += `&title=ilike.*${encodeURIComponent(search)}*`;

          const res = await fetch(fetchUrl, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            next: { revalidate: 60 }
          });
          
          if (res.ok) {
            const dbNews = await res.json();
            if (dbNews && dbNews.length > 0) {
              const countRes = await fetch(`${supabaseUrl}/rest/v1/news?select=id&limit=1`, {
                headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
                next: { revalidate: 120 }
              });
              let count = dbNews.length;
              if (countRes.ok) {
                const range = countRes.headers.get("content-range");
                if (range) count = parseInt(range.split("/")[1], 10) || count;
              }
            
            // Ön yüzde tekrar eden haberleri engellemek için benzerlik filtresi (Similarity Filter)
            const uniqueDbNews: any[] = [];
            for (const item of dbNews) {
              let isDuplicate = false;
              for (const existing of uniqueDbNews) {
                if (calculateTitleSimilarity(item.title || "", existing.title || "") >= 0.55) {
                  isDuplicate = true;
                  break;
                }
              }
              if (!isDuplicate) {
                uniqueDbNews.push(item);
              }
            }

            // İstenen limit kadarını alıyoruz
            const paginatedUniqueNews = uniqueDbNews.slice(0, limit);

            // Parallel asynchronous translation with caching (super fast & translates international news)
            const cleanedDbNews = await Promise.all(
              paginatedUniqueNews.map(async (item) => {
                const [translatedTitle, translatedSnippet] = await Promise.all([
                  translateText(item.title || "", lang),
                  translateText(item.snippet || "", lang),
                ]);
                return {
                  ...item,
                  title: cleanText(translatedTitle),
                  snippet: cleanText(translatedSnippet),
                };
              })
            );

            // 10 Kasım Atatürk'ü Anma Günü özel haberini ilk sayfada en üste sabitle (NewsGlo Akış Bandı ve /haberler için)
            const now = new Date();
            const isNov10Window =
              now.getFullYear() === 2026 &&
              now.getMonth() === 10 &&
              (now.getDate() === 9 || now.getDate() === 10);

            if (page === 1 && (category === "all" || category.toLowerCase() === "general") && !search && isNov10Window) {
              const nov10Base = MULTILINGUAL_NEWS_DATASET[0];
              if (nov10Base && nov10Base.id === "newsglo-10-kasim-ataturk-2026") {
                const trans =
                  nov10Base.translations[lang] ||
                  nov10Base.translations["en"] ||
                  nov10Base.translations["tr"];
                if (trans && !cleanedDbNews.some((n) => n.id === nov10Base.id || (n.title && n.title.includes("10 Kasım")))) {
                  cleanedDbNews.unshift({
                    id: nov10Base.id,
                    source: nov10Base.source,
                    category: nov10Base.category,
                    link: nov10Base.link,
                    published_at: new Date().toISOString(),
                    title: cleanText(trans.title),
                    snippet: cleanText(trans.snippet),
                  });
                  if (cleanedDbNews.length > limit) {
                    cleanedDbNews.pop();
                  }
                }
              }
            }

            return NextResponse.json({
              success: true,
              articles: cleanedDbNews,
              page,
              limit,
              total: count || cleanedDbNews.length,
              hasMore: offset + cleanedDbNews.length < (count || cleanedDbNews.length),
              isMock: false,
            }, {
              headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
              },
            });
            }
          }
        }
      } catch (dbErr) {
        // Fallback
      }

    // 2. Multilingual Dataset Fallback (100% safe)
    let formattedDataset = MULTILINGUAL_NEWS_DATASET.map((base) => {
      const trans =
        base.translations[lang] ||
        base.translations["en"] ||
        base.translations["tr"] ||
        { title: "NewsGlo", snippet: "" };

      return {
        id: base.id,
        source: base.source,
        category: base.category,
        link: base.link,
        published_at: base.published_at,
        title: cleanText(trans.title || ""),
        snippet: cleanText(trans.snippet || ""),
      };
    });

    if (category !== "all") {
      formattedDataset = formattedDataset.filter(
        (n) => n.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      formattedDataset = formattedDataset.filter(
        (n) => n.title.toLowerCase().includes(search) || n.snippet.toLowerCase().includes(search)
      );
    }

    const paginated = formattedDataset.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      articles: paginated,
      page,
      limit,
      total: formattedDataset.length,
      hasMore: offset + paginated.length < formattedDataset.length,
      isMock: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      articles: [],
      page: 1,
      limit: 12,
      total: 0,
      hasMore: false,
      isMock: true,
    });
  }
}
