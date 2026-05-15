import type { AiAnalysis, MatchResult } from "@/lib/types/tournament";
import { getTeamById } from "@/data/teams";
import type { Locale } from "@/lib/i18n/types";

const LIVE_NEWS_EVENTS_TR = [
  { news: "💥 SON DAKİKA: Yıldız oyuncu antrenmanda sakatlandı!", impact: "negative", team: "random" },
  { news: "🔥 CANLI: Takımda teknik direktör krizi patlak verdi.", impact: "negative", team: "random" },
  { news: "⚡ FLAŞ: Yedek kulübesinden sürpriz bir ilk 11 hamlesi sızdırıldı.", impact: "positive", team: "random" },
  { news: "🚨 BİLGİ: Takım kampında moraller çok yüksek, prim dopingi yapıldı.", impact: "positive", team: "random" },
  { news: "📉 SON DURUM: Stoper hattında ciddi eksikler var, savunma alarm veriyor.", impact: "negative", team: "random" },
];

const LIVE_NEWS_EVENTS_EN = [
  { news: "💥 BREAKING: Star player injured in training!", impact: "negative", team: "random" },
  { news: "🔥 LIVE: Managerial crisis hits the camp.", impact: "negative", team: "random" },
  { news: "⚡ FLASH: Surprise starting XI leak from the bench.", impact: "positive", team: "random" },
  { news: "🚨 UPDATE: Morale is sky-high following a massive bonus announcement.", impact: "positive", team: "random" },
  { news: "📉 LATEST: Major defensive absences reported, backline looks vulnerable.", impact: "negative", team: "random" },
];

export function simulateLiveUpdate(
  currentAnalysis: AiAnalysis,
  match: MatchResult,
  currentPrediction: { home: number; away: number },
  locale: Locale
): { updatedAnalysis: AiAnalysis; updatedPrediction: { home: number; away: number } } {
  const isTr = locale === "tr";
  const events = isTr ? LIVE_NEWS_EVENTS_TR : LIVE_NEWS_EVENTS_EN;
  const event = events[Math.floor(Math.random() * events.length)];
  
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  
  const homeName = home ? (isTr ? home.nameTr : home.nameEn) : "Home";
  const awayName = away ? (isTr ? away.nameTr : away.nameEn) : "Away";
  
  // Decide which team gets affected
  const affectedTeam = Math.random() > 0.5 ? "home" : "away";
  const affectedName = affectedTeam === "home" ? homeName : awayName;
  
  let newH = currentPrediction.home;
  let newA = currentPrediction.away;
  let winProb = 50;

  // Adjust scores based on impact
  if (event.impact === "negative") {
    if (affectedTeam === "home") {
      newH = Math.max(0, newH - 1);
      newA = newA + 1;
      winProb = Math.max(10, Math.floor(Math.random() * 20) + 10); // Low win prob for home
    } else {
      newA = Math.max(0, newA - 1);
      newH = newH + 1;
      winProb = Math.min(90, Math.floor(Math.random() * 20) + 70); // High win prob for home
    }
  } else {
    if (affectedTeam === "home") {
      newH = newH + 1;
      winProb = Math.min(90, Math.floor(Math.random() * 20) + 70);
    } else {
      newA = newA + 1;
      winProb = Math.max(10, Math.floor(Math.random() * 20) + 10);
    }
  }
  
  const updatedPrediction = { home: newH, away: newA };
  
  const newsPrefix = isTr 
    ? `🔴 CANLI HABER (${affectedName}): ${event.news}` 
    : `🔴 LIVE UPDATE (${affectedName}): ${event.news}`;
    
  const updatedAnalysis: AiAnalysis = {
    ...currentAnalysis,
    summary: `${newsPrefix}\n\n${currentAnalysis.summary}`,
    predictedScoreline: `${newH}-${newA}`,
    isLiveUpdate: true,
    winProbability: winProb,
  };
  
  return { updatedAnalysis, updatedPrediction };
}
