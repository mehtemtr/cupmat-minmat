import { supabaseAdmin } from "./supabase";
import { getTeamById, getTeams } from "@/data/teams";
import { getStadiumByTeamId } from "@/data/stadiums";
import type { Locale } from "@/lib/i18n/types";

// ============================================================
// TÜRLER (TYPES)
// ============================================================

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  precipitationChance: number;
}

export interface PlayerStatusData {
  playerName: string;
  teamId: string;
  status: "fit" | "injured" | "suspended";
  injuryType?: string;
  expectedReturn?: Date;
  suspensionReason?: string;
  suspensionMatches?: number;
}

export interface MatchPrediction {
  matchId: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  predictedScoreline: string;
  confidence: number;
}

export interface AiCommentary {
  tr: string;
  en: string;
  es: string;
  fr: string;
  de: string;
}

// ============================================================
// YARDIMCI FONKSİYONLAR (HELPERS)
// ============================================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ============================================================
// 1. KADRO GÜNCELLEYİCİ (ROSTER UPDATER)
// ============================================================

export async function updateTeamRosters(): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let updatedCount = 0;
  const startedAt = Date.now();

  try {
    const teams = getTeams();
    
    for (const team of teams) {
      try {
        // Mevcut kadro sayısını kontrol et
        const { count, error: countError } = await supabaseAdmin
          .from("team_rosters")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id);

        if (countError) {
          errors.push(`Takım ${team.id} kadro sayısı çekilemedi: ${countError.message}`);
          continue;
        }

        // Eğer kadro eksikse (24'ten azsa), örnek oyuncular ekle (gerçek API entegrasyonu için yer tutucu)
        if (!count || count < 24) {
          console.log(`Takım ${team.nameTr} kadrosu güncelleniyor (mevcut: ${count || 0})`);
          
          // Örnek oyuncu listesi (gerçek FIFA entegrasyonu buraya gelecek)
          const samplePlayers = generateSampleRoster(team);
          
          for (const player of samplePlayers) {
            const { error } = await supabaseAdmin
              .from("team_rosters")
              .upsert({
                team_id: team.id,
                player_name: player.name,
                player_position: player.position,
                player_number: player.number,
                is_captain: player.isCaptain,
              }, {
                onConflict: "team_id, player_name"
              });

            if (error && error.code !== "23505") {
              errors.push(`Oyuncu ${player.name} eklenemedi: ${error.message}`);
            }
          }
          
          updatedCount++;
        }
      } catch (teamError) {
        errors.push(`Takım ${team.id} işlenirken hata: ${teamError}`);
      }
    }

    // Log kaydı
    await logAgentActivity("roster_updater", "success", updatedCount, errors);

  } catch (error) {
    await logAgentActivity("roster_updater", "failed", 0, [String(error)]);
    errors.push(String(error));
  }

  return {
    success: errors.length === 0,
    updated: updatedCount,
    errors
  };
}

// Örnek kadro üretici (gerçek API entegrasyonu için yer tutucu)
function generateSampleRoster(team: any) {
  const positions = ["Kaleci", "Stoper", "Sol Bek", "Sağ Bek", "Ön Libero", 
                     "Merkez Midfielder", "Sol Açık", "Sağ Açık", "Ofansif Midfielder", "Forvet"];
  
  const players = [];
  for (let i = 1; i <= 26; i++) {
    players.push({
      name: `${team.nameTr} Oyuncu ${i}`,
      position: positions[i % positions.length],
      number: i,
      isCaptain: i === 1
    });
  }
  return players;
}

// ============================================================
// 2. TAHMİN MOTORU (PREDICTION ENGINE)
// ============================================================

export async function generatePredictions(matches: Array<{
  id: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  date?: Date;
}>): Promise<{
  predictions: MatchPrediction[];
  weatherData: Map<string, WeatherData>;
  playerStatuses: PlayerStatusData[];
}> {
  const predictions: MatchPrediction[] = [];
  const weatherData = new Map<string, WeatherData>();
  const playerStatuses: PlayerStatusData[] = [];

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) continue;

    const home = getTeamById(match.homeTeamId);
    const away = getTeamById(match.awayTeamId);
    const seed = hashString(match.id + new Date().toISOString().split("T")[0]);

    if (!home || !away) continue;

    // 1. Hava durumu verisi (simülasyon)
    const stadium = getStadiumByTeamId(match.homeTeamId);
    const mockWeather = generateMockWeather(stadium?.city || home.nameTr, seed);
    weatherData.set(match.id, mockWeather);

    // 2. Oyuncu durumu (simülasyon)
    const mockInjuries = generateMockPlayerStatuses(home.id, away.id, seed);
    playerStatuses.push(...mockInjuries);

    // 3. Tahmin hesaplama
    const rankDiff = (away.fifaRank || 50) - (home.fifaRank || 50);
    let homeWin = 33.33;
    let draw = 33.33;
    let awayWin = 33.33;

    // FIFA sıralamasına göre ağırlık
    if (rankDiff > 20) {
      homeWin = 55 + (seed % 15);
      awayWin = 15 + (seed % 10);
      draw = 100 - homeWin - awayWin;
    } else if (rankDiff < -20) {
      awayWin = 55 + (seed % 15);
      homeWin = 15 + (seed % 10);
      draw = 100 - homeWin - awayWin;
    } else {
      homeWin = 30 + (seed % 15);
      awayWin = 30 + ((seed >> 2) % 15);
      draw = 100 - homeWin - awayWin;
    }

    // Hava durumu etkisi
    if (mockWeather.condition === "snow" || mockWeather.temperature < 5) {
      draw += 10;
      homeWin -= 5;
      awayWin -= 5;
    }

    // Skor tahmini
    let h = 1 + Math.floor((homeWin / 40) * (seed % 3));
    let a = 1 + Math.floor((awayWin / 40) * ((seed >> 1) % 3));
    if (h === 0 && a === 0) h = 1;

    predictions.push({
      matchId: match.id,
      homeWin: Math.round(homeWin * 100) / 100,
      draw: Math.round(draw * 100) / 100,
      awayWin: Math.round(awayWin * 100) / 100,
      predictedScoreline: `${h}-${a}`,
      confidence: 0.6 + (Math.abs(rankDiff) / 200)
    });

    // 4. Veritabanına kaydet
    await saveMatchAnalysis(match.id, match.homeTeamId, match.awayTeamId, {
      homeWin,
      draw,
      awayWin,
      scoreline: `${h}-${a}`,
      confidence: 0.6 + (Math.abs(rankDiff) / 200),
      weather: mockWeather,
      injuries: mockInjuries
    });
  }

  return { predictions, weatherData, playerStatuses };
}

function generateMockWeather(city: string, seed: number): WeatherData {
  const conditions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
  const condition = conditions[seed % conditions.length];
  return {
    city,
    temperature: 10 + (seed % 25),
    condition,
    windSpeed: 5 + (seed % 30),
    humidity: 40 + (seed % 50),
    precipitationChance: condition === "rainy" ? 70 + (seed % 30) : condition === "snowy" ? 60 + (seed % 40) : 10 + (seed % 20)
  };
}

function generateMockPlayerStatuses(homeTeamId: string, awayTeamId: string, seed: number): PlayerStatusData[] {
  const statuses: PlayerStatusData[] = [];
  
  // Rastgele sakatlık/ceza oluştur (gerçek API entegrasyonu için yer tutucu)
  if (seed % 7 === 0) {
    statuses.push({
      playerName: "Kritik Forvet",
      teamId: homeTeamId,
      status: "injured",
      injuryType: "Ayak bileği burkulması",
      expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }
  
  if (seed % 11 === 0) {
    statuses.push({
      playerName: "Defansif Midfielder",
      teamId: awayTeamId,
      status: "suspended",
      suspensionReason: "Sarı kart birikmesi",
      suspensionMatches: 1
    });
  }
  
  return statuses;
}

async function saveMatchAnalysis(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  data: {
    homeWin: number;
    draw: number;
    awayWin: number;
    scoreline: string;
    confidence: number;
    weather: WeatherData;
    injuries: PlayerStatusData[];
  }
) {
  try {
    await supabaseAdmin
      .from("match_analyses")
      .upsert({
        match_id: matchId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        prediction_home_win: data.homeWin,
        prediction_draw: data.draw,
        prediction_away_win: data.awayWin,
        predicted_scoreline: data.scoreline,
        analysis_confidence: data.confidence,
        weather_data: data.weather,
        injury_data: data.injuries,
        last_updated: new Date().toISOString()
      }, {
        onConflict: "match_id"
      });
  } catch (error) {
    console.error("Maç analizi kaydedilemedi:", error);
  }
}

// ============================================================
// 3. YAPAY ZEKA YORUMLARI (AI COMMENTARY)
// ============================================================

export function generateAiCommentary(
  matchId: string,
  homeTeamId: string,
  awayTeamId: string,
  prediction: MatchPrediction,
  weather: WeatherData,
  injuries: PlayerStatusData[]
): AiCommentary {
  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const seed = hashString(matchId);

  const homeNameTr = home?.nameTr || "Ev Sahibi";
  const homeNameEn = home?.nameEn || "Home";
  const awayNameTr = away?.nameTr || "Deplasman";
  const awayNameEn = away?.nameEn || "Away";

  // Hava durumu etkisi
  let weatherNoteTr = "";
  let weatherNoteEn = "";
  if (weather.condition === "snowy" || weather.temperature < 5) {
    weatherNoteTr = `${weather.city}'da kar yağışı ve aşırı soğuk bekleniyor. Bu durum ${homeNameTr}'ın oyununu etkileyebilir. `;
    weatherNoteEn = `Snow and extreme cold expected in ${weather.city}. This may affect ${homeNameEn}'s performance. `;
  } else if (weather.condition === "rainy") {
    weatherNoteTr = `${weather.city}'da yağmur bekleniyor. Kaygan zemin pas trafiğini yavaşlatabilir. `;
    weatherNoteEn = `Rain expected in ${weather.city}. Slippery pitch may slow down passing. `;
  }

  // Sakatlık etkisi
  let injuryNoteTr = "";
  let injuryNoteEn = "";
  const homeInjuries = injuries.filter(i => i.teamId === homeTeamId);
  const awayInjuries = injuries.filter(i => i.teamId === awayTeamId);

  if (homeInjuries.length > 0) {
    injuryNoteTr = `${homeNameTr}'da ${homeInjuries.length} kritik oyuncu sakat/cezalı. Bu durum gücü düşürüyor. `;
    injuryNoteEn = `${homeNameEn} has ${homeInjuries.length} key players injured/suspended. This weakens their strength. `;
  }
  if (awayInjuries.length > 0) {
    injuryNoteTr = `${awayNameTr}'da ${awayInjuries.length} oyuncu eksik. `;
    injuryNoteEn = `${awayNameEn} missing ${awayInjuries.length} players. `;
  }

  // Ana yorum
  const trTemplates = [
    `Bu maçta ${homeNameTr} ev sahibi avantajıyla %${prediction.homeWin} kazanma şansıyla oynuyor. ${awayNameTr} ise %${prediction.awayWin} ile sürpriz arıyor. ${weatherNoteTr}${injuryNoteTr}Tahmin skorum: ${prediction.predictedScoreline}.`,
    `${homeNameTr} ve ${awayNameTr} arasında zorlu bir mücadele bekliyorum. Beraberlik ihtimali %${prediction.draw} oldukça yüksek. ${weatherNoteTr}${injuryNoteTr}Sonucun ${prediction.predictedScoreline} olacağını düşünüyorum.`,
    `Deplasman ekibi ${awayNameTr} formda görünse de, ${homeNameTr}'ın taraftar desteği belirleyici olabilir. ${weatherNoteTr}${injuryNoteTr}Benim tahminim: ${prediction.predictedScoreline}.`
  ];

  const enTemplates = [
    `${homeNameEn} plays at home with ${prediction.homeWin}% chance of winning. ${awayNameEn} looks for an upset with ${prediction.awayWin}%. ${weatherNoteEn}${injuryNoteEn}My predicted score: ${prediction.predictedScoreline}.`,
    `I expect a tough battle between ${homeNameEn} and ${awayNameEn}. Draw probability is quite high at ${prediction.draw}%. ${weatherNoteEn}${injuryNoteEn}I think it will end ${prediction.predictedScoreline}.`,
    `Although away side ${awayNameEn} looks in form, ${homeNameEn}'s fan support could be decisive. ${weatherNoteEn}${injuryNoteEn}My prediction: ${prediction.predictedScoreline}.`
  ];

  return {
    tr: trTemplates[seed % trTemplates.length],
    en: enTemplates[seed % enTemplates.length],
    es: trTemplates[seed % trTemplates.length],
    fr: trTemplates[seed % trTemplates.length],
    de: trTemplates[seed % trTemplates.length]
  };
}

// ============================================================
// AJAN ÇALIŞMA KAYDI (AGENT LOGGING)
// ============================================================

async function logAgentActivity(
  agentName: string,
  taskType: string,
  status: "success" | "failed" | "partial",
  itemsProcessed: number,
  errors?: string[]
) {
  try {
    await supabaseAdmin
      .from("ai_agent_logs")
      .insert({
        agent_name: agentName,
        task_type: taskType,
        status,
        items_processed: itemsProcessed,
        error_message: errors?.join(" | "),
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Log kaydedilemedi:", error);
  }
}

// ============================================================
// ANA ÇALIŞTIRICI (MAIN RUNNER)
// ============================================================

export async function runAiAgent(): Promise<{
  rosterUpdate: any;
  predictions: any;
  success: boolean;
}> {
  console.log("🤖 Akıllı Dünya Kupası Yapay Zeka Ajanı çalışıyor...");

  try {
    // 1. Kadro güncellemesi
    const rosterResult = await updateTeamRosters();
    console.log("✅ Kadro güncellemesi tamamlandı:", rosterResult);

    // 2. Maç tahminleri
    const { officialGroups } = await import("@/data/official-groups");
    const allMatches = officialGroups.flatMap(g => g.matches || []);
    const predResult = await generatePredictions(allMatches);
    console.log("✅ Tahminler tamamlandı:", predResult.predictions.length, "maç");

    // 3. Yorumları kaydet
    for (const pred of predResult.predictions) {
      const weather = predResult.weatherData.get(pred.matchId);
      if (weather) {
        const commentary = generateAiCommentary(
          pred.matchId,
          allMatches.find(m => m.id === pred.matchId)?.homeTeamId || "",
          allMatches.find(m => m.id === pred.matchId)?.awayTeamId || "",
          pred,
          weather,
          predResult.playerStatuses
        );
        
        await supabaseAdmin
          .from("match_analyses")
          .update({
            ai_commentary_tr: commentary.tr,
            ai_commentary_en: commentary.en,
            ai_commentary_es: commentary.es,
            ai_commentary_fr: commentary.fr,
            ai_commentary_de: commentary.de
          })
          .eq("match_id", pred.matchId);
      }
    }

    await logAgentActivity("ai_sports_agent", "full_run", "success", predResult.predictions.length);
    console.log("🎉 Yapay Zeka Ajanı tamamlandı!");

    return {
      rosterUpdate: rosterResult,
      predictions: predResult,
      success: true
    };

  } catch (error) {
    await logAgentActivity("ai_sports_agent", "full_run", "failed", 0, [String(error)]);
    console.error("❌ Yapay Zeka Ajanı hatası:", error);
    throw error;
  }
}
