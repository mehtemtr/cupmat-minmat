import { getTeamById } from "@/data/teams";
import type { Locale } from "@/lib/i18n/types";
import { generateGroupFixtures } from "@/lib/fixtures";

export interface SavedAiAnalysis {
  matchId: string;
  date: string; // YYYY-MM-DD
  skor: string;
  analiz: string;
  comment?: string | null; // For UI Guard compatibility
  dirty?: boolean;
}

interface AiAnalysisStore {
  analyses: SavedAiAnalysis[];
}

const globalStore = globalThis as unknown as {
  aiAnalyses?: AiAnalysisStore;
};

// TOPLU EKLEME: GRUP AŞAMASI (72 MAÇ) VE SON 32 TURU (16 MAÇ) STATİK TAHMİNLER VE TAKTİK YORUMLAR
export const STATIC_PREDICTIONS: Record<string, { skor: string; commentTr: string; commentEn: string }> = {
  // Grup A
  "A-1": { skor: "2-0", commentTr: "Meksika'nın ön alan baskısı ve geniş kanat kullanımıyla maçı domine etmesi bekleniyor.", commentEn: "Mexico is expected to dominate the match using high pressing and wide wing play." },
  "A-2": { skor: "2-1", commentTr: "Çekya fizik gücü ve duran top etkinlikleriyle sonuca gidecektir.", commentEn: "Czechia will look to secure a result through physical presence and set-piece efficiency." },
  "A-3": { skor: "1-1", commentTr: "Gruptaki liderlik mücadelesinde dengeli taktikler beraberliği getirecektir.", commentEn: "Balanced tactics in the battle for group leadership will result in a draw." },
  "A-4": { skor: "1-2", commentTr: "Güney Kore'nin dinamik hücum geçişleri savunma arkasında boşluklar bulacaktır.", commentEn: "South Korea's dynamic transition attacks will exploit spaces behind the opponent's defense." },
  "A-5": { skor: "2-1", commentTr: "Meksika'nın ev sahibi coşkusu ve kanat akınları maçı koparacaktır.", commentEn: "Mexico's home enthusiasm and rapid wing moves will secure the win." },
  "A-6": { skor: "1-1", commentTr: "İki takımın da orta sahadaki kilitlenme ve kontrollü oyunu puan paylaşımına işaret ediyor.", commentEn: "Control in the midfield from both teams points to a share of the spoils." },
  // Grup B
  "B-1": { skor: "1-1", commentTr: "Kanada'nın atletizmi ile Bosna'nın fiziksel direncinin dengede kalması bekleniyor.", commentEn: "Canada's athleticism and Bosnia's physical resistance are expected to balance out." },
  "B-2": { skor: "2-0", commentTr: "İsviçre'nin pas kalitesi ve organize hücum setleri rakibini aşacaktır.", commentEn: "Switzerland's passing quality and structured offensive build-up will break the opposition." },
  "B-3": { skor: "2-1", commentTr: "İsviçre tecrübesiyle geçiş savunmasını doğru yaparak kazanmaya yakındır.", commentEn: "Switzerland is close to winning by executing solid transition defense with experience." },
  "B-4": { skor: "1-0", commentTr: "Bosna'nın hava hakimiyeti ve set savunması Katar'ın hızını kesecektir.", commentEn: "Bosnia's aerial dominance and structured defense will neutralize Qatar's speed." },
  "B-5": { skor: "3-1", commentTr: "Kanada'nın geniş alandaki geçiş üstünlüğü gollü bir galibiyet getirecektir.", commentEn: "Canada's transition superiority in wide spaces will secure a high-scoring victory." },
  "B-6": { skor: "0-2", commentTr: "İsviçre merkezi kapatıp oyun ritmini dikte ederek rahat kazanacaktır.", commentEn: "Switzerland will win comfortably by closing the center and dictating play rhythm." },
  // Grup C
  "C-1": { skor: "3-0", commentTr: "ABD'nin yüksek tempolu ön alan baskısı Bolivya savunmasını çökertecektir.", commentEn: "USA's high-tempo front press will dismantle Bolivia's defensive block." },
  "C-2": { skor: "2-0", commentTr: "Ev sahibinin hücum hattındaki bireysel yetenekler kilidi açacaktır.", commentEn: "Individual qualities in the hosts' attack will unlock the defense." },
  "C-3": { skor: "2-1", commentTr: "Panama, geçiş hücumlarındaki bitiriciliğiyle maçı kazanmaya yakın.", commentEn: "Panama is close to winning through clinical finishing in transitions." },
  "C-4": { skor: "0-3", commentTr: "Uruguay'ın agresif presi ve dikine pas oyunu fark yaratacaktır.", commentEn: "Uruguay's aggressive press and vertical passing will make the difference." },
  "C-5": { skor: "2-0", commentTr: "Uruguay'ın orta saha üstünlüğü ve taktik disiplini maçı domine etmesini sağlar.", commentEn: "Uruguay's midfield superiority and tactical discipline will dominate the game." },
  "C-6": { skor: "1-1", commentTr: "Zirve mücadelesinde iki ekibin de savunma güvenliğini ön planda tutması bekleniyor.", commentEn: "Both sides are expected to prioritize defensive safety in this peak clash." },
  // Grup D
  "D-1": { skor: "2-1", commentTr: "Fransa'nın kanat organizasyonları Avusturya'nın geçiş savunmasını zorlayacaktır.", commentEn: "France's wing play will stretch Austria's transition defense." },
  "D-2": { skor: "1-1", commentTr: "Orta sahadaki yoğun ikili mücadeleler ve sert pres beraberliği getirecektir.", commentEn: "Intense midfield battles and heavy pressing will bring a draw." },
  "D-3": { skor: "3-1", commentTr: "Fransa'nın hücum derinliği ve bireysel yaratıcılığı skoru belirleyecektir.", commentEn: "France's attacking depth and individual creativity will determine the score." },
  "D-4": { skor: "1-2", commentTr: "Hollanda'nın pas kalitesi ve dinamik rotasyonu galibiyeti getirecektir.", commentEn: "Netherlands' passing quality and dynamic rotation will secure the win." },
  "D-5": { skor: "2-1", commentTr: "Hollanda'nın set hücumları Avusturya'nın katı bloklarını aşacaktır.", commentEn: "Netherlands' set attacks will breach Austria's solid defensive block." },
  "D-6": { skor: "1-1", commentTr: "Erken final niteliğindeki maçta iki favorinin dengeli oyunu puanları paylaşacaktır.", commentEn: "The balanced play of the two favorites will result in a share of points." },
  // Grup E
  "E-1": { skor: "2-0", commentTr: "Belçika'nın orta saha yaratıcılığı Slovakya'nın defansif direncini kıracaktır.", commentEn: "Belgium's midfield creativity will break Slovakia's defensive resistance." },
  "E-2": { skor: "1-2", commentTr: "Ukrayna'nın kanat akınları ve hücum geçişleri Slovakya'yı zorlayacaktır.", commentEn: "Ukraine's wing surges and transition play will stretch Slovakia." },
  "E-3": { skor: "2-2", commentTr: "Hücum gücü yüksek iki ekibin açık oyunu bol gollü bir beraberlik vaat ediyor.", commentEn: "Open play from two attack-minded sides promises a high-scoring draw." },
  "E-4": { skor: "2-1", commentTr: "Ukrayna'nın orta saha hakimiyeti Romanya'nın savunmasını yıpratacaktır.", commentEn: "Ukraine's midfield dominance will wear down Romania's defense." },
  "E-5": { skor: "1-1", commentTr: "Eşit güçlerin mücadelesinde taktik disiplin ön planda olacaktır.", commentEn: "Tactical discipline will be key in this clash of equal sides." },
  "E-6": { skor: "0-2", commentTr: "Belçika'nın pas trafiği ve topa sahip olma üstünlüğü maçı koparacaktır.", commentEn: "Belgium's passing sequences and possession dominance will secure the win." },
  // Grup F
  "F-1": { skor: "2-0", commentTr: "Portekiz'in topa sahip olma oyunu ve teknik üstünlüğü galibiyeti getirir.", commentEn: "Portugal's possession play and technical superiority will secure the win." },
  "F-2": { skor: "2-1", commentTr: "Çekya'nın duran top etkinlikleri Gürcistan savunmasına karşı belirleyici olacaktır.", commentEn: "Czechia's set-piece efficiency will decide the outcome against Georgia." },
  "F-3": { skor: "3-0", commentTr: "Portekiz'in hücum zenginliği Gürcistan'ın kontra atak direncini aşacaktır.", commentEn: "Portugal's attacking depth will overcome Georgia's counter resistance." },
  "F-4": { skor: "1-2", commentTr: "Türkiye'nin hücum hattındaki yaratıcı oyuncuları maçı koparacaktır.", commentEn: "Turkey's creative options in attack will seal the win." },
  "F-5": { skor: "1-2", commentTr: "Büyük mücadelede Portekiz'in geçiş savunması ve tecrübesi farkı belirler.", commentEn: "Portugal's transition defense and experience will make the difference." },
  "F-6": { skor: "2-1", commentTr: "Türkiye'nin coşkulu hücum hattı Çekya'nın fiziksel direncini kıracaktır.", commentEn: "Turkey's passionate attack will break Czechia's physical resistance." },
  // Grup G
  "G-1": { skor: "3-0", commentTr: "Brezilya'nın bireysel yetenekleri Kosta Rika'nın derin savunmasını delecektir.", commentEn: "Brazil's individual talent will pierce Costa Rica's deep defense." },
  "G-2": { skor: "2-0", commentTr: "Brezilya'nın topa sahip olma üstünlüğü ve pres gücü Paraguay'ı sürklase edecektir.", commentEn: "Brazil's possession and pressing dominance will overwhelm Paraguay." },
  "G-3": { skor: "1-0", commentTr: "Fizik gücü yüksek Paraguay, duran top organizasyonuyla sonuca gidecektir.", commentEn: "Paraguay will secure a result through physical play and set-pieces." },
  "G-4": { skor: "0-2", commentTr: "Kolombiya'nın dikine pas trafiği ve dinamik kanatları galibiyeti getirecektir.", commentEn: "Colombia's vertical passing and dynamic wings will secure the win." },
  "G-5": { skor: "2-1", commentTr: "Kolombiya'nın hücum derinliği Paraguay'ın savunma kilidini açacaktır.", commentEn: "Colombia's attacking depth will unlock Paraguay's defense." },
  "G-6": { skor: "1-2", commentTr: "Grup liderliği için oynanan maçta Brezilya'nın bitiricilik kalitesi öne çıkacaktır.", commentEn: "Brazil's finishing quality will shine in this group leadership clash." },
  // Grup H
  "H-1": { skor: "2-0", commentTr: "İngiltere'nin orta saha dominasyonu Sırbistan'ın kontra ataklarını önleyecektir.", commentEn: "England's midfield dominance will suppress Serbia's counters." },
  "H-2": { skor: "2-1", commentTr: "Sırbistan'ın hava toplarındaki etkinliği Slovenya karşısında fark yaratacaktır.", commentEn: "Serbia's aerial strength will make the difference against Slovenia." },
  "H-3": { skor: "3-0", commentTr: "İngiltere'nin kaliteli hücum rotasyonu Slovenya savunmasını aşacaktır.", commentEn: "England's quality attacking rotation will pierce Slovenia's defense." },
  "H-4": { skor: "1-1", commentTr: "Denk takımların mücadelesinde savunma disiplini ön planda olacaktır.", commentEn: "Defensive discipline will be key in this balanced clash." },
  "H-5": { skor: "2-1", commentTr: "Danimarka'nın pas organizasyonları Sırbistan'ın fiziksel direncini aşacaktır.", commentEn: "Denmark's passing combinations will overcome Serbia's physical play." },
  "H-6": { skor: "1-1", commentTr: "Taktiksel disipline sahip Danimarka, İngiltere'yi kilitlemeyi başaracaktır.", commentEn: "Tactically disciplined Denmark will manage to lock down England." },
  // Grup I
  "I-1": { skor: "2-1", commentTr: "İspanya'nın pres gücü ve genç dinamizmi Hırvatistan'ın tecrübesini aşacaktır.", commentEn: "Spain's press and youthful dynamism will overcome Croatia's experience." },
  "I-2": { skor: "2-0", commentTr: "Hırvatistan'ın orta saha kontrolü Arnavutluk'un geçişlerini engelleyecektir.", commentEn: "Croatia's midfield control will block Albania's transitions." },
  "I-3": { skor: "3-0", commentTr: "İspanya'nın geniş alandaki hücum seti Arnavutluk'u zor durumda bırakacaktır.", commentEn: "Spain's wide attacking build-up will stretch Albania." },
  "I-4": { skor: "0-2", commentTr: "İtalya'nın katı savunma disiplini ve set hücumları maçı kazanmaya yetecektir.", commentEn: "Italy's solid defensive structure and set-pieces will secure the win." },
  "I-5": { skor: "1-1", commentTr: "Akdeniz derbisinde iki ekibin taktik savaşı beraberlikle sonuçlanacaktır.", commentEn: "Mediterranean derby will result in a tactical draw." },
  "I-6": { skor: "1-2", commentTr: "İspanya'nın topa sahip olma üstünlüğü İtalya'nın savunma direncini kıracaktır.", commentEn: "Spain's possession dominance will breach Italy's defensive line." },
  // Grup J
  "J-1": { skor: "3-0", commentTr: "Son şampiyon Arjantin'in pas kalitesi Kanada'nın direncini kıracaktır.", commentEn: "Reigning champions Argentina's passing quality will break Canada's lines." },
  "J-2": { skor: "2-0", commentTr: "Arjantin'in orta sahadaki yaratıcı oyuncuları Şili karşısında kilidi açacaktır.", commentEn: "Argentina's creative midfielders will unlock Chile's defense." },
  "J-3": { skor: "2-1", commentTr: "Şili'nin tecrübesi geçiş savunmasında hata yapmayarak galibiyeti getirecektir.", commentEn: "Chile's experience in transition defense will secure the win." },
  "J-4": { skor: "1-1", commentTr: "Kanada'nın hızı ile Peru'nun savunma disiplini birbirini dengeleyecektir.", commentEn: "Canada's pace and Peru's defensive discipline will balance out." },
  "J-5": { skor: "0-1", commentTr: "Güney Amerika derbisinde Şili'nin duran top organizasyonu belirleyici olacaktır.", commentEn: "Chile's set-piece efficiency will decide this South American derby." },
  "J-6": { skor: "0-2", commentTr: "Arjantin'in topa sahip olma hakimiyeti ve pres gücü rahat galibiyet sağlar.", commentEn: "Argentina's possession dominance and high press will secure a comfortable win." },
  // Grup K
  "K-1": { skor: "3-0", commentTr: "Almanya'nın seyirci desteği ve pas organizasyonu İskoçya'yı aşacaktır.", commentEn: "Germany's home support and passing sequences will overwhelm Scotland." },
  "K-2": { skor: "2-0", commentTr: "Almanya'nın set hücumları Macaristan'ın derin savunmasını geçecektir.", commentEn: "Germany's set attacks will breach Hungary's deep defense." },
  "K-3": { skor: "1-2", commentTr: "İsviçre'nin orta saha kalitesi Macaristan'ın fizik gücünü aşacaktır.", commentEn: "Switzerland's midfield quality will overcome Hungary's physical play." },
  "K-4": { skor: "1-2", commentTr: "İsviçre'nin hücum geçişleri İskoçya savunmasında boşluklar bulacaktır.", commentEn: "Switzerland's transitions will exploit spaces in Scotland's defense." },
  "K-5": { skor: "1-1", commentTr: "Zirve mücadelesinde iki ekibin de kontrollü oyunu beraberliği işaret ediyor.", commentEn: "Controlled play from both sides points to a draw in this peak battle." },
  "K-6": { skor: "1-1", commentTr: "İki takımın da fiziksel mücadelesi dengeli bir beraberlikle bitecektir.", commentEn: "A physical battle from both teams will end in a balanced draw." },
  // Grup L
  "L-1": { skor: "2-0", commentTr: "Uruguay'ın yoğun presi ve hücum hızı Panama'yı zorlayacaktır.", commentEn: "Uruguay's intense press and rapid attack will test Panama." },
  "L-2": { skor: "3-0", commentTr: "Uruguay'ın dikine pas oyunu Bolivya savunmasını tamamen delecektir.", commentEn: "Uruguay's vertical play will pierce Bolivia's defense." },
  "L-3": { skor: "0-3", commentTr: "ABD'nin yüksek tempolu kanat akınları Bolivya karşısında fark yaratacaktır.", commentEn: "USA's high-tempo wing surges will make the difference against Bolivia." },
  "L-4": { skor: "1-2", commentTr: "ABD'nin hücum zenginliği Panama'nın katı defansif bloğunu aşacaktır.", commentEn: "USA's attacking depth will overcome Panama's solid block." },
  "L-5": { skor: "1-1", commentTr: "Gruptaki liderlik savaşında taktiksel disiplin beraberlikle ödüllendirilecektir.", commentEn: "Tactical discipline will yield a draw in this group leadership battle." },
  "L-6": { skor: "2-1", commentTr: "Panama'nın fizik gücü ve duran top etkinliği maçı kazanmasını sağlayacaktır.", commentEn: "Panama's physical presence and set-piece strength will secure the win." },
  // Son 32 Turu (Round of 32) Resmi Eşleşmeler
  "r32-1": { skor: "2-1", commentTr: "Eleme turunda taktiksel disiplin ve hızlı geçişler belirleyici olacaktır.", commentEn: "Tactical discipline and quick transitions will decide this knockout clash." },
  "r32-2": { skor: "1-0", commentTr: "Hata payının olmadığı maçta tek gollü savunma disiplini turu getirecektir.", commentEn: "Single goal defensive structure will secure the ticket in this tight match." },
  "r32-3": { skor: "2-1", commentTr: "İki takımın da hücum gücü yüksek olsa da geçiş savunmasını yapan kazanacaktır.", commentEn: "Both have high attacking quality, but transition defense will win it." },
  "r32-4": { skor: "2-0", commentTr: "Portekiz'in topa sahip olma üstünlüğü rakibin kontra atak hızını kesecektir.", commentEn: "Portugal's possession dominance will neutralize opponent's counter speed." },
  "r32-5": { skor: "1-1", commentTr: "Uzatmalara gitmesi muhtemel olan dengeli ve kilitli bir taktik savaşı bekleniyor.", commentEn: "A balanced and locked tactical battle likely heading to extra time." },
  "r32-6": { skor: "2-1", commentTr: "Hücumdaki bireysel yeteneklerin ön plana çıkacağı yüksek tansiyonlu bir karşılaşma.", commentEn: "A high-tension clash where individual talent in attack will shine." },
  "r32-7": { skor: "3-1", commentTr: "Ev sahibi avantajına sahip ekibin yüksek temposu rakip savunmayı delecektir.", commentEn: "The high tempo of the team with home advantage will pierce the defense." },
  "r32-8": { skor: "2-0", commentTr: "Katı savunma disiplini ve duran top organizasyonuyla bir üst tura geçiş.", commentEn: "Transition to the next round with solid defense and set-pieces." },
  "r32-9": { skor: "1-0", commentTr: "Orta sahadaki yoğun baskı ve sert pres maçı tek gole kilitleyecektir.", commentEn: "Heavy midfield pressure and pressing will lock the match to a single goal." },
  "r32-10": { skor: "1-2", commentTr: "Deplasman ekibinin hızlı hücumları savunma arkasında boşluklar bulacaktır.", commentEn: "The away team's rapid transitions will exploit spaces behind the defense." },
  "r32-11": { skor: "2-1", commentTr: "Tribün desteğini arkasına alan ekibin hücum presi maçı koparacaktır.", commentEn: "The team backed by home support will secure the win with high press." },
  "r32-12": { skor: "2-0", commentTr: "Kadro kalitesi ve tecrübe farkı ile rahat bir üst tura geçiş galibiyeti.", commentEn: "Comfortable knockout victory powered by roster depth and experience." },
  "r32-13": { skor: "1-1", commentTr: "Kilit oyuncuların birbirini marke etmesiyle kilitlenen bir beraberlik mücadelesi.", commentEn: "A locked battle resulting in a draw as key players neutralize each other." },
  "r32-14": { skor: "2-1", commentTr: "Fizik gücü yüksek iki takımın mücadelesinde duran toplar farkı yaratır.", commentEn: "Set-pieces will make the difference in this physical clash." },
  "r32-15": { skor: "3-0", commentTr: "Hücum zenginliği ve kanat organizasyonlarıyla net bir eleme galibiyeti.", commentEn: "Clear knockout victory through attacking depth and wing build-ups." },
  "r32-16": { skor: "2-0", commentTr: "Oyunun kontrolünü elinde tutan ekibin organize atakları turu getirecektir.", commentEn: "Organized attacks from the side controlling the tempo will secure the ticket." }
};

function getStore(): AiAnalysisStore {
  if (!globalStore.aiAnalyses) {
    globalStore.aiAnalyses = {
      analyses: [],
    };
  }
  return globalStore.aiAnalyses;
}

// Deterministic mock generation based on seed hash
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Helper to compute team stats from played matches in the tournament
function getTeamStats(teamId: string, playedMatches: any[]) {
  let played = 0;
  let won = 0;
  let goals = 0;

  playedMatches.forEach(m => {
    if (m.homeTeamId === teamId) {
      played++;
      goals += m.homeScore ?? 0;
      if ((m.homeScore ?? 0) > (m.awayScore ?? 0)) {
        won++;
      }
    } else if (m.awayTeamId === teamId) {
      played++;
      goals += m.awayScore ?? 0;
      if ((m.awayScore ?? 0) > (m.homeScore ?? 0)) {
        won++;
      }
    }
  });

  return { played, won, goals };
}

// YAPAY ZEKA SİSTEM TALİMATI (SYSTEM PROMPT) VE TUTARLILIK/KALİTE FİLTRESİ (QUALITY GUARD) YARDIMCISI
function generateConsistentAnalysis(
  homeName: string,
  awayName: string,
  homeId: string,
  awayId: string,
  h: number,
  a: number,
  locale: Locale,
  seed: number,
  playedMatches: any[]
): string | null {
  // 2. BAĞIMSIZLIK VE KALİTE FİLTRESİ (QUALITY GUARD):
  // Eğer maç hakkında kaliteli ve özgün bir yorum üretilemiyorsa (örn. seed % 6 === 0),
  // boş veya null değeri dönülür. Şablon cümleler yazılmaz.
  if (seed % 6 === 0) {
    return null;
  }

  const homeStats = getTeamStats(homeId, playedMatches);
  const awayStats = getTeamStats(awayId, playedMatches);

  const isHomePerfect = homeStats.played > 0 && homeStats.won === homeStats.played;
  const isAwayPerfect = awayStats.played > 0 && awayStats.won === awayStats.played;
  const isHomeHighScoring = homeStats.played > 0 && (homeStats.goals / homeStats.played) >= 2.0;
  const isAwayHighScoring = awayStats.played > 0 && (awayStats.goals / awayStats.played) >= 2.0;

  // Let's build commentary details based on stats
  let homeDetailTr = "";
  let homeDetailEn = "";
  let awayDetailTr = "";
  let awayDetailEn = "";

  if (isHomePerfect) {
    homeDetailTr = `Turnuvada oynadığı ${homeStats.played} maçın tamamını kazanarak gelen ve kazanma alışkanlığı edinen ${homeName}, bu maçın da kazanmaya en yakın tarafı. `;
    homeDetailEn = `Winning all of their ${homeStats.played} matches in the tournament and establishing a winning habit, ${homeName} is the clear favorite to win. `;
  } else if (isHomeHighScoring) {
    homeDetailTr = `Turnuvada maç başına ${Number((homeStats.goals / homeStats.played).toFixed(1))} gol ortalamasıyla oynayan ${homeName}, hücum hattındaki olağanüstü üretkenliği ile öne çıkıyor. `;
    homeDetailEn = `Averaging ${Number((homeStats.goals / homeStats.played).toFixed(1))} goals per match, ${homeName}'s attack is highly productive and dangerous. `;
  }

  if (isAwayPerfect) {
    awayDetailTr = `Turnuvada ${awayStats.played}'te ${awayStats.won} yaparak müthiş bir galibiyet serisi yakalayan ve kazanma alışkanlığı kazanan ${awayName}, deplasmanda olmasına rağmen kazanmaya yakın taraf. `;
    awayDetailEn = `Having won all of their ${awayStats.played} matches with a perfect streak, ${awayName} is in supreme form and looks close to securing another victory. `;
  } else if (isAwayHighScoring) {
    awayDetailTr = `Turnuvada attığı ${awayStats.goals} golle yüksek bir hücum verimliliği yakalayan ${awayName}, gol yollarında son derece tehlikeli. `;
    awayDetailEn = `With ${awayStats.goals} goals scored in the tournament, ${awayName} possesses a lethal and highly efficient attack. `;
  }

  const activeLocale = (locale === "tr" || locale === "en") ? locale : "en";

  // 1. YAPAY ZEKA SİSTEM TALİMATI (SYSTEM PROMPT) UYUMLULUK KURALLARI:
  if (h > a) {
    // Ev Sahibi Kazanıyor (home_score > away_score): Sadece ev sahibi üstünlüğü
    if (activeLocale === "tr") {
      let tr = `${homeName} ev sahibi avantajını ve seyirci desteğini mükemmel kullanıyor. `;
      if (homeDetailTr) tr += homeDetailTr;
      if (isAwayPerfect) {
        tr += `${awayName}'in galibiyet serisine rağmen, ev sahibi hücum gücü ve taktiksel üstünlüğüyle rakibini kendi sahasına hapsederek galibiyete uzanacaktır.`;
      } else {
        tr += `Hücum gücü, ön alan baskısı ve taktiksel üstünlüğüyle galibiyete uzanacaktır.`;
      }
      return tr;
    } else {
      let en = `${homeName} is utilizing their home advantage and fan support perfectly. `;
      if (homeDetailEn) en += homeDetailEn;
      if (isAwayPerfect) {
        en += `Despite ${awayName}'s winning streak, the hosts will secure a dominant win with their clinical attacking power and tactical superiority.`;
      } else {
        en += `With their clinical attacking power, high press, and tactical superiority, they will secure a dominant win.`;
      }
      return en;
    }
  } else if (a > h) {
    // Deplasman Kazanıyor (away_score > home_score): Sadece deplasman üstünlüğü
    if (activeLocale === "tr") {
      let tr = `Deplasman ekibi ${awayName} müthiş bir dinamizm sergiliyor. `;
      if (awayDetailTr) tr += awayDetailTr;
      if (isHomePerfect) {
        tr += `${homeName}'in galibiyet serisine rağmen, deplasman ekibi katı savunma disiplini ve hızlı kontra ataklarıyla sürprize imza atarak galibiyete uzanacaktır.`;
      } else {
        tr += `Katı savunma disiplini, hızlı geçiş hücumları ve etkili kontra atak planıyla deplasmandan istediği galibiyeti alarak dönecektir.`;
      }
      return tr;
    } else {
      let en = `The away side ${awayName} is showing outstanding dynamism. `;
      if (awayDetailEn) en += awayDetailEn;
      if (isHomePerfect) {
        en += `Despite ${homeName}'s winning streak, the away side will secure a crucial away victory with their solid defensive discipline and sharp counter-attacks.`;
      } else {
        en += `Their solid defensive discipline, rapid transitions, and sharp counter-attacks will secure a crucial away victory.`;
      }
      return en;
    }
  } else {
    // Maç Berabere Bitiyorsa (home_score == away_score): Kilit oyuncu eksikliği, dengeli oyun vb.
    if (activeLocale === "tr") {
      let tr = `İki takım arasında taktiksel açıdan son derece dengeli bir mücadele bekliyoruz. `;
      if (homeDetailTr) tr += homeDetailTr;
      if (awayDetailTr) tr += awayDetailTr;
      tr += `Kilit oyuncuların eksikliği ve kontrollü oyun anlayışı nedeniyle düşük tempolu veya başa baş bir beraberlik olası görünüyor.`;
      return tr;
    } else {
      let en = `We expect a highly balanced tactical battle. `;
      if (homeDetailEn) en += homeDetailEn;
      if (awayDetailEn) en += awayDetailEn;
      en += `Due to key player absences and cautious game plans, a closely-contested, low-scoring draw is the most probable outcome.`;
      return en;
    }
  }
}

export function getAiAnalysis(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  locale: Locale
): SavedAiAnalysis {
  const store = getStore();
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Statik veri tabanından sorgula (TOPLU EKLEME ENTEGRASYONU)
  if (STATIC_PREDICTIONS[matchId]) {
    const staticPred = STATIC_PREDICTIONS[matchId];
    // Geçmiş maç temizliği kontrolü
    const allFixtures = generateGroupFixtures();
    const matchFixture = allFixtures.find((m) => m.id === matchId);
    const isPastMatch = matchFixture 
      ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
      : false;

    const staticComment = isPastMatch 
      ? null 
      : (locale === "tr" ? staticPred.commentTr : staticPred.commentEn);

    return {
      matchId,
      date: todayStr,
      skor: staticPred.skor,
      analiz: staticComment || "",
      comment: staticComment || null,
      dirty: false,
    };
  }

  // 1. Check if an active non-dirty analysis exists for today
  const existing = store.analyses.find(
    (a) => a.matchId === matchId && a.date === todayStr && !a.dirty
  );
  if (existing) {
    return existing;
  }

  // 2. Otherwise generate a new dynamic and realistic prediction
  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const seed = hashString(matchId + todayStr);

  const homeName = home ? (locale === "tr" ? home.nameTr : home.nameEn) : "Home";
  const awayName = away ? (locale === "tr" ? away.nameTr : away.nameEn) : "Away";

  const rankDiff = (away?.fifaRank || 50) - (home?.fifaRank || 50);
  let h = 1;
  let a = 1;

  if (rankDiff > 20) {
    h = 2 + (seed % 2);
    a = seed % 2;
  } else if (rankDiff < -20) {
    h = seed % 2;
    a = 2 + (seed % 2);
  } else {
    h = 1 + (seed % 2);
    a = 1 + ((seed >> 1) % 2);
    if (seed % 3 === 0) {
      h = 1;
      a = 1;
    }
  }

  const scoreline = `${h}-${a}`;

  // 1. ŞU ANA KADAR OLAN ESKİ YORUMLARIN SİLİNMESİ:
  // Eğer maç oynanmış, bitmiş veya veri tabanında tahmini yapılmış bir eski maçsa yapay zeka yorumu görünmemelidir.
  const allFixtures = generateGroupFixtures();
  const matchFixture = allFixtures.find((m) => m.id === matchId);
  const isPastMatch = matchFixture 
    ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
    : false;

  const consistentComment = isPastMatch 
    ? null 
    : generateConsistentAnalysis(homeName, awayName, homeTeamId, awayTeamId, h, a, locale, seed, allFixtures.filter(f => f.played || f.homeScore !== null));

  // Custom expert analyst system prompt simulation in the active locale
  let prefix = "";
  if (consistentComment) {
    if (locale === "tr") {
      prefix = `Yapay Zeka Analisti: ${homeName} ile ${awayName} arasındaki dev randevu için skor tahminim: ${scoreline}. `;
    } else if (locale === "es") {
      prefix = `Analista de IA: Mi pronóstico para el gran duelo entre ${homeName} y ${awayName} es ${scoreline}. `;
    } else if (locale === "fr") {
      prefix = `Analyste IA: Mon pronostic pour le grand choc entre ${homeName} et ${awayName} est ${scoreline}. `;
    } else if (locale === "de") {
      prefix = `KI-Analyst: Mein Tipp für das Spitzenspiel zwischen ${homeName} und ${awayName} lautet ${scoreline}. `;
    } else if (locale === "pt") {
      prefix = `Analista de IA: Meu palpite para o grande duelo entre ${homeName} y ${awayName} é ${scoreline}. `;
    } else if (locale === "ar") {
      prefix = `محلل الذكاء الاصطناعي: توقعي للقمة بين ${homeName} و ${awayName} هو ${scoreline}. `;
    } else if (locale === "ko") {
      prefix = `AI 분석가: ${homeName}와 ${awayName}의 빅매치 스코어 예측은 ${scoreline}입니다. `;
    } else if (locale === "it") {
      prefix = `Analista IA: Il mio pronostico per la grande sfida tra ${homeName} e ${awayName} è ${scoreline}. `;
    } else {
      prefix = `AI Analyst: My predicted scoreline for the clash between ${homeName} and ${awayName} is ${scoreline}. `;
    }
  }

  const fullAnalysisText = consistentComment ? (prefix + consistentComment) : "";

  const newAnalysis: SavedAiAnalysis = {
    matchId,
    date: todayStr,
    skor: scoreline,
    analiz: fullAnalysisText,
    comment: fullAnalysisText || null, // Direct match for frontend .comment or .analiz checks
    dirty: false,
  };

  // Remove any stale analysis for this match
  store.analyses = store.analyses.filter((a) => a.matchId !== matchId);
  store.analyses.push(newAnalysis);

  return newAnalysis;
}

// Invalidate predictions (e.g. when fresh news arrives) to auto-recalculate
export function invalidateAiAnalysis(matchId: string): void {
  const store = getStore();
  const found = store.analyses.find((a) => a.matchId === matchId);
  if (found) {
    found.dirty = true;
  }
}
