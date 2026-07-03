"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTournament } from "@/contexts/TournamentContext";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { PageShell } from "@/components/PageShell";
import { getTeamById, getTeamName } from "@/data/teams";
import { generateAiPredictions } from "@/lib/ai-predictions";
import type { KnockoutMatch, MatchPrediction } from "@/lib/types/tournament";
import { 
  Calendar, 
  Trophy, 
  Bot, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  X, 
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// Translations mapping for 9 languages to avoid adding keys to JSON
const roundTitles: Record<string, Record<string, string>> = {
  tr: {
    tree: "Kupa Yolu Ağacı",
    r32: "Son 32 Turu",
    r16: "Son 16 Turu",
    qf: "Çeyrek Final",
    sf: "Yarı Final",
    final: "Final",
    predictTitle: "Maç Tahmini Yap",
    etLabel: "Uzatma Skorları",
    penLabel: "Penaltı Skorları",
    saveBtn: "Kaydet",
    closeBtn: "Kapat",
    lockedDesc: "Grup aşaması tamamlanmadığı için kupa yolu kilitlidir. Gruplar sayfasından tahmin yapabilir veya grupları manuel sıralayarak eleme turlarını açabilirsiniz.",
    goToGroups: "Gruplar Sayfasına Git",
    championship: "Şampiyonluk Maçı",
    winnerDesc: "Kazanan Takım Bir Üst Tura Yükselir",
    aiPredict: "Yapay Zeka Tahmini",
    drawNotice: "Beraberlik durumunda uzatmaları ve gerekirse penaltıları belirleyin."
  },
  en: {
    tree: "Bracket Tree",
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarterfinals",
    sf: "Semifinals",
    final: "Final",
    predictTitle: "Make Prediction",
    etLabel: "Extra Time Score",
    penLabel: "Penalty Shootout",
    saveBtn: "Save",
    closeBtn: "Close",
    lockedDesc: "The bracket is locked because the group stage is incomplete. Go to the Groups page to predict results or rank groups manually to unlock the knockout stage.",
    goToGroups: "Go to Groups Page",
    championship: "Championship Final",
    winnerDesc: "Winner advances to the next round",
    aiPredict: "AI Prediction",
    drawNotice: "In case of a tie, set extra time and penalty scores as needed."
  },
  de: {
    tree: "Turnierbaum",
    r32: "Sechzehntelfinale",
    r16: "Achtelfinale",
    qf: "Viertelfinale",
    sf: "Halbfinale",
    final: "Finale",
    predictTitle: "Tipp abgeben",
    etLabel: "Verlängerung",
    penLabel: "Elfmeterschießen",
    saveBtn: "Speichern",
    closeBtn: "Schließen",
    lockedDesc: "Der Turnierbaum ist gesperrt, da die Gruppenphase unvollständig ist. Gehen Sie zur Gruppenseite, um Ergebnisse zu tippen oder Gruppen manuell zu ordnen, um die K.o.-Phase freizuschalten.",
    goToGroups: "Zur Gruppenseite",
    championship: "Finale",
    winnerDesc: "Der Sieger kommt in die nächste Runde",
    aiPredict: "KI-Vorhersage",
    drawNotice: "Bei unentschiedenem Spielstand Verlängerung und ggf. Elfmeterschießen festlegen."
  },
  fr: {
    tree: "Arbre de Tournoi",
    r32: "Seizièmes de finale",
    r16: "Huitièmes de finale",
    qf: "Quarts de finale",
    sf: "Demi-finales",
    final: "Finale",
    predictTitle: "Faire une prédiction",
    etLabel: "Prolongations",
    penLabel: "Tirs au but",
    saveBtn: "Enregistrer",
    closeBtn: "Fermer",
    lockedDesc: "Le tableau est verrouillé car la phase de groupes est incomplète. Allez sur la page des Groupes pour pronostiquer ou classer manuellement pour déverrouiller la phase finale.",
    goToGroups: "Aller à la page des Groupes",
    championship: "Finale",
    winnerDesc: "Le vainqueur accède au tour suivant",
    aiPredict: "Prédiction IA",
    drawNotice: "En cas d'égalité, définissez les prolongations et les tirs au but."
  },
  es: {
    tree: "Árbol del Torneo",
    r32: "Dieciseisavos de final",
    r16: "Octavos de final",
    qf: "Cuartos de final",
    sf: "Semifinales",
    final: "Final",
    predictTitle: "Hacer pronóstico",
    etLabel: "Prórroga",
    penLabel: "Tanda de penaltis",
    saveBtn: "Guardar",
    closeBtn: "Cerrar",
    lockedDesc: "El cuadro está bloqueado porque la fase de grupos no está completa. Ve a la página de Grupos para pronosticar o ordenar grupos manualmente para desbloquear la fase eliminatoria.",
    goToGroups: "Ir a la página de Grupos",
    championship: "Final",
    winnerDesc: "El ganador avanza a la siguiente ronda",
    aiPredict: "Predicción de IA",
    drawNotice: "En caso de empate, defina la prórroga y los penaltis correspondientes."
  },
  pt: {
    tree: "Árvore de Torneio",
    r32: "Dezesseis-avos de final",
    r16: "Oitavas de final",
    qf: "Quantas de final",
    sf: "Semifinais",
    final: "Final",
    predictTitle: "Fazer palpite",
    etLabel: "Prorrogação",
    penLabel: "Disputa de pênaltis",
    saveBtn: "Salvar",
    closeBtn: "Fechar",
    lockedDesc: "O chaveamento está bloqueado porque a fase de grupos está incompleta. Vá para a página de Grupos para dar palpites ou ordenar manualmente para desbloquear o mata-mata.",
    goToGroups: "Ir para a página de Grupos",
    championship: "Final",
    winnerDesc: "O vencedor avança para a próxima fase",
    aiPredict: "Previsão da IA",
    drawNotice: "Em caso de empate, defina os gols da prorrogação e pênaltis."
  },
  it: {
    tree: "Tabellone Completo",
    r32: "Sedicesimi di finale",
    r16: "Ottavi di finale",
    qf: "Quarti di finale",
    sf: "Semifinali",
    final: "Finale",
    predictTitle: "Fai un pronostico",
    etLabel: "Tempi supplementari",
    penLabel: "Calci di rigore",
    saveBtn: "Salva",
    closeBtn: "Chiudi",
    lockedDesc: "Il tabellone è bloccato perché la fase a gironi è incompleta. Vai alla pagina dei Gironi per fare pronostici o ordinare i gironi manualmente per sbloccare la fase a eliminazione diretta.",
    goToGroups: "Vai alla pagina dei Gironi",
    championship: "Finale",
    winnerDesc: "Il vincitore passa al turno successivo",
    aiPredict: "Pronostico IA",
    drawNotice: "In caso di parità, imposta i supplementari e i calci di rigore."
  },
  ko: {
    tree: "토너먼트 트리",
    r32: "32강전",
    r16: "16강전",
    qf: "8강전",
    sf: "4강전",
    final: "결승전",
    predictTitle: "경기 예측하기",
    etLabel: "연장전 스코어",
    penLabel: "승부차기",
    saveBtn: "저장",
    closeBtn: "닫기",
    lockedDesc: "조별 리그가 완료되지 않아 대진표가 잠겨 있습니다. 그룹 페이지로 이동하여 결과를 예측하거나 조별 순위를 수동으로 조정하여 토너먼트를 잠금 해제하세요.",
    goToGroups: "그룹 페이지로 이동",
    championship: "결승전",
    winnerDesc: "승리팀이 다음 라운드로 진출합니다",
    aiPredict: "AI 예측",
    drawNotice: "무승부일 경우 연장전 및 승부차기 점수를 입력하세요."
  },
  ar: {
    tree: "شجرة البطولة",
    r32: "دور الـ 32",
    r16: "دور الـ 16",
    qf: "ربع النهائي",
    sf: "نصف النهائي",
    final: "النهائي",
    predictTitle: "توقع النتيجة",
    etLabel: "الأشواط الإضافية",
    penLabel: "ركلات الترجيح",
    saveBtn: "حفظ",
    closeBtn: "إغلاق",
    lockedDesc: "مسار الكأس مغلق لأن دور المجموعات غير مكتمل. اذهب إلى صفحة المجموعات للتنبؤ أو ترتيب المجموعات يدويًا لفتح الأدوار الإقصائية.",
    goToGroups: "الذهاب إلى صفحة المجموعات",
    championship: "المباراة النهائية",
    winnerDesc: "الفائز يتأهل إلى الدور التالي",
    aiPredict: "توقع الذكاء الاصطناعي",
    drawNotice: "في حال التعادل، قم بتحديد نقاط الوقت الإضافي وركلات الترجيح."
  }
};

function getMatchWinner(
  match: KnockoutMatch | undefined | null,
  predictions: Record<string, MatchPrediction>
): string | null {
  if (!match || !match.homeTeamId || !match.awayTeamId) return null;
  const p = predictions[match.id];
  if (!p) return null;

  if (p.home > p.away) return match.homeTeamId;
  if (p.away > p.home) return match.awayTeamId;

  if (p.homeET !== undefined && p.awayET !== undefined && p.homeET !== null && p.awayET !== null) {
    if (p.homeET > p.awayET) return match.homeTeamId;
    if (p.awayET > p.homeET) return match.awayTeamId;
  }

  if (p.homePen !== undefined && p.awayPen !== undefined && p.homePen !== null && p.awayPen !== null) {
    if (p.homePen > p.awayPen) return match.homeTeamId;
    if (p.awayPen > p.homePen) return match.awayTeamId;
  }

  // fallback to home team if fully unresolved
  return match.homeTeamId;
}

export default function BracketPage() {
  const { 
    knockoutBracket, 
    predictions, 
    setPrediction, 
    knockoutUnlocked 
  } = useTournament();
  const { locale } = useLocale();
  const { t } = useTranslation();

  const dict = roundTitles[locale] || roundTitles.en;

  const [activeTab, setActiveTab] = useState<"tree" | "r32" | "r16" | "qf" | "sf" | "final">("tree");
  const [selectedMatch, setSelectedMatch] = useState<KnockoutMatch | null>(null);

  // Prediction modal local inputs
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [homeET, setHomeET] = useState<number>(0);
  const [awayET, setAwayET] = useState<number>(0);
  const [homePen, setHomePen] = useState<number>(0);
  const [awayPen, setAwayPen] = useState<number>(0);

  const H = 1800; // Fixed total height of columns for perfect alignment mathematical centers

  const openPredictModal = (match: KnockoutMatch) => {
    if (!match.homeTeamId || !match.awayTeamId) return;
    setSelectedMatch(match);
    const pred = predictions[match.id];
    setHomeScore(pred?.home ?? 0);
    setAwayScore(pred?.away ?? 0);
    setHomeET(pred?.homeET ?? 0);
    setAwayET(pred?.awayET ?? 0);
    setHomePen(pred?.homePen ?? 0);
    setAwayPen(pred?.awayPen ?? 0);
  };

  const savePrediction = () => {
    if (!selectedMatch) return;
    
    const isDraw = homeScore === awayScore;
    const isEtDraw = homeET === awayET;

    setPrediction(
      selectedMatch.id,
      homeScore,
      awayScore,
      isDraw ? { home: homeET, away: awayET } : undefined,
      (isDraw && isEtDraw) ? { home: homePen, away: awayPen } : undefined
    );
    setSelectedMatch(null);
  };

  const handleAiPredictSingle = () => {
    if (!selectedMatch) return;
    const { predictions: aiPreds } = generateAiPredictions([selectedMatch], locale);
    const predVal = aiPreds[selectedMatch.id];
    if (predVal) {
      setHomeScore(predVal.home);
      setAwayScore(predVal.away);
      
      let hEt = 0;
      let aEt = 0;
      let hPen = 0;
      let aPen = 0;
      
      if (predVal.home === predVal.away) {
        // Deterministic tie-breaker simulation
        const seed = selectedMatch.id.charCodeAt(selectedMatch.id.length - 1);
        if (seed % 2 === 0) {
          hEt = 1;
          aEt = 0;
        } else {
          hPen = 5;
          aPen = 4;
        }
      }
      
      setHomeET(hEt);
      setAwayET(aEt);
      setHomePen(hPen);
      setAwayPen(aPen);
    }
  };

  const r32Matches = knockoutBracket.filter(m => m.round === "r32");
  const r16Matches = knockoutBracket.filter(m => m.round === "r16");
  const qfMatches = knockoutBracket.filter(m => m.round === "qf");
  const sfMatches = knockoutBracket.filter(m => m.round === "sf");
  const finalMatch = knockoutBracket.find(m => m.round === "final") || null;

  // Render match card in tree view
  const renderTreeCard = (match: KnockoutMatch) => {
    const home = match.homeTeamId ? getTeamById(match.homeTeamId) : null;
    const away = match.awayTeamId ? getTeamById(match.awayTeamId) : null;
    const pred = predictions[match.id];
    const winnerId = getMatchWinner(match, predictions);

    const isHomeWinner = winnerId && winnerId === match.homeTeamId;
    const isAwayWinner = winnerId && winnerId === match.awayTeamId;

    const hasTeams = home && away;

    return (
      <div 
        onClick={() => hasTeams && openPredictModal(match)}
        className={`w-64 rounded-xl border bg-black/40 p-3 transition-all ${
          hasTeams 
            ? "border-white/5 hover:border-emerald-500/50 hover:bg-black/60 cursor-pointer shadow-lg shadow-black/20" 
            : "border-white/5 opacity-55 cursor-not-allowed"
        }`}
      >
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 mb-2 font-mono">
          <span>{match.slot} {match.time ? `• ${match.time}` : ""}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {match.date || "TBD"}
          </span>
        </div>
        
        <div className="space-y-1.5">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-2 h-7">
            <div className="flex items-center gap-2 overflow-hidden">
              {home ? (
                <Link 
                  href={`/ulkeler/${home.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                >
                  <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                    <Image src={home.flagUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className={`truncate text-xs font-semibold ${isHomeWinner ? "text-emerald-400 font-bold" : "text-white/80 group-hover:text-emerald-400 transition-colors"}`}>
                    {getTeamName(home, locale)}
                  </span>
                </Link>
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono">TBD</span>
              )}
            </div>
            {hasTeams && (
              <span className={`font-mono text-xs font-bold ${isHomeWinner ? "text-emerald-400" : "text-zinc-400"}`}>
                {pred?.home ?? 0}
                {pred && pred.home === pred.away && pred.homeET !== undefined && ` (${pred.homeET})`}
                {pred && pred.home === pred.away && pred.homeET === pred.awayET && pred.homePen !== undefined && ` [${pred.homePen}]`}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-2 h-7">
            <div className="flex items-center gap-2 overflow-hidden">
              {away ? (
                <Link 
                  href={`/ulkeler/${away.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                >
                  <div className="relative h-4 w-6 shrink-0 overflow-hidden rounded ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                    <Image src={away.flagUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className={`truncate text-xs font-semibold ${isAwayWinner ? "text-emerald-400 font-bold" : "text-white/80 group-hover:text-emerald-400 transition-colors"}`}>
                    {getTeamName(away, locale)}
                  </span>
                </Link>
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono">TBD</span>
              )}
            </div>
            {hasTeams && (
              <span className={`font-mono text-xs font-bold ${isAwayWinner ? "text-emerald-400" : "text-zinc-400"}`}>
                {pred?.away ?? 0}
                {pred && pred.home === pred.away && pred.awayET !== undefined && ` (${pred.awayET})`}
                {pred && pred.home === pred.away && pred.homeET === pred.awayET && pred.awayPen !== undefined && ` [${pred.awayPen}]`}
              </span>
            )}
          </div>
        </div>

        {match.stadium && (
          <div className="mt-2 border-t border-white/5 pt-1 text-[8px] text-zinc-600 font-mono truncate">
            {match.stadium}
          </div>
        )}
      </div>
    );
  };

  // Rendering a focused list for specific round tab
  const renderFocusedList = (matches: KnockoutMatch[]) => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn">
        {matches.map((m) => {
          const home = m.homeTeamId ? getTeamById(m.homeTeamId) : null;
          const away = m.awayTeamId ? getTeamById(m.awayTeamId) : null;
          const pred = predictions[m.id];
          const hasTeams = home && away;
          const winnerId = getMatchWinner(m, predictions);

          return (
            <div 
              key={m.id} 
              onClick={() => hasTeams && openPredictModal(m)}
              className={`rounded-2xl border p-5 transition-all ${
                hasTeams 
                  ? "border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04] cursor-pointer" 
                  : "border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="mb-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold">{m.slot}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {m.date || "TBD"} {m.time ? `• ${m.time}` : ""}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {home ? (
                      <>
                        <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10">
                          <Image src={home.flagUrl} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <span className={`text-sm font-semibold ${winnerId === home.id ? "text-emerald-400 font-bold" : "text-white"}`}>
                          {getTeamName(home, locale)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">TBD</span>
                    )}
                  </div>
                  {hasTeams && <span className="font-mono text-sm font-bold text-white">{pred?.home ?? 0}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {away ? (
                      <>
                        <div className="relative h-6 w-9 overflow-hidden rounded shadow ring-1 ring-white/10">
                          <Image src={away.flagUrl} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <span className={`text-sm font-semibold ${winnerId === away.id ? "text-emerald-400 font-bold" : "text-white"}`}>
                          {getTeamName(away, locale)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">TBD</span>
                    )}
                  </div>
                  {hasTeams && <span className="font-mono text-sm font-bold text-white">{pred?.away ?? 0}</span>}
                </div>
              </div>
              
              {hasTeams && pred && pred.home === pred.away && (
                <div className="mt-4 border-t border-white/5 pt-3 space-y-1.5 text-xs text-zinc-400 font-mono">
                  <div className="flex justify-between">
                    <span>{dict.etLabel}:</span>
                    <span className="font-bold text-white">{pred.homeET ?? 0} - {pred.awayET ?? 0}</span>
                  </div>
                  {pred.homeET === pred.awayET && (
                    <div className="flex justify-between">
                      <span>{dict.penLabel}:</span>
                      <span className="font-bold text-amber-400">{pred.homePen ?? 0} - {pred.awayPen ?? 0}</span>
                    </div>
                  )}
                </div>
              )}

              {m.stadium && (
                <div className="mt-3 border-t border-white/5 pt-2 text-[10px] text-zinc-500 font-mono truncate">
                  {m.stadium}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageShell title={t("nav.bracket")} subtitle={dict.tree}>
      {/* 1. Locked Notice */}
      {!knockoutUnlocked ? (
        <div className="space-y-12">
          {/* Banner */}
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 max-w-2xl mx-auto backdrop-blur">
            <Lock className="h-12 w-12 text-amber-400 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">{locale === "tr" ? "Kupa Yolu Kilitli" : "Bracket Locked"}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{dict.lockedDesc}</p>
            <Link 
              href="/groups" 
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>{dict.goToGroups}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Locked Bracket Visual Placeholder (Blurred) */}
          <div className="relative opacity-25 select-none pointer-events-none filter blur-sm">
            <div className="flex items-center justify-center p-12">
              <p className="text-lg font-bold text-white">Preview Tree</p>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Unlocked Interactive Bracket Tree */
        <div className="space-y-6">
          {/* Navigation tabs */}
          <div className="flex items-center justify-start border-b border-white/10 pb-4 overflow-x-auto gap-2 scrollbar-none">
            {(["tree", "r32", "r16", "qf", "sf", "final"] as const).map((tab) => {
              const label = tab === "tree" ? dict.tree : dict[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* TAB: Tree View (Desktop Side-by-side Columns with SVG connecting curves) */}
          {activeTab === "tree" && (
            <div className="w-full overflow-x-auto custom-scrollbar rounded-3xl border border-white/10 bg-[#060b14]/50 p-6 backdrop-blur">
              <div 
                className="flex select-none min-w-[1440px] items-stretch justify-between" 
                style={{ height: `${H}px`, minHeight: `${H}px` }}
              >
                {/* COLUMN 1: ROUND OF 32 */}
                <div className="flex flex-col justify-around h-full py-2 z-10">
                  {r32Matches.map((m) => (
                    <div key={m.id}>{renderTreeCard(m)}</div>
                  ))}
                </div>

                {/* SVG CONNECTORS: R32 -> R16 */}
                <svg width="60" height={H} className="shrink-0 pointer-events-none">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const y1 = (i + 0.5) * (H / 16);
                    const y2 = (Math.floor(i / 2) + 0.5) * (H / 8);
                    
                    // Trace winner path
                    const r32M = r32Matches[i];
                    const r16M = r16Matches[Math.floor(i / 2)];
                    const wId = getMatchWinner(r32M, predictions);
                    const isWinner = wId && 
                      (i % 2 === 0 ? r16M?.homeTeamId === wId : r16M?.awayTeamId === wId);

                    return (
                      <path
                        key={i}
                        d={`M 0 ${y1} C 30 ${y1}, 30 ${y2}, 60 ${y2}`}
                        fill="none"
                        stroke={isWinner ? "#10b981" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isWinner ? "2.5" : "1.5"}
                        className={isWinner ? "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" : ""}
                      />
                    );
                  })}
                </svg>

                {/* COLUMN 2: ROUND OF 16 */}
                <div className="flex flex-col justify-around h-full py-4 z-10">
                  {r16Matches.map((m) => (
                    <div key={m.id}>{renderTreeCard(m)}</div>
                  ))}
                </div>

                {/* SVG CONNECTORS: R16 -> QF */}
                <svg width="60" height={H} className="shrink-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const y1 = (i + 0.5) * (H / 8);
                    const y2 = (Math.floor(i / 2) + 0.5) * (H / 4);

                    const r16M = r16Matches[i];
                    const qfM = qfMatches[Math.floor(i / 2)];
                    const wId = getMatchWinner(r16M, predictions);
                    const isWinner = wId &&
                      (i % 2 === 0 ? qfM?.homeTeamId === wId : qfM?.awayTeamId === wId);

                    return (
                      <path
                        key={i}
                        d={`M 0 ${y1} C 30 ${y1}, 30 ${y2}, 60 ${y2}`}
                        fill="none"
                        stroke={isWinner ? "#10b981" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isWinner ? "2.5" : "1.5"}
                        className={isWinner ? "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" : ""}
                      />
                    );
                  })}
                </svg>

                {/* COLUMN 3: QUARTERFINALS */}
                <div className="flex flex-col justify-around h-full py-8 z-10">
                  {qfMatches.map((m) => (
                    <div key={m.id}>{renderTreeCard(m)}</div>
                  ))}
                </div>

                {/* SVG CONNECTORS: QF -> SF */}
                <svg width="60" height={H} className="shrink-0 pointer-events-none">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y1 = (i + 0.5) * (H / 4);
                    const y2 = (Math.floor(i / 2) + 0.5) * (H / 2);

                    const qfM = qfMatches[i];
                    const sfM = sfMatches[Math.floor(i / 2)];
                    const wId = getMatchWinner(qfM, predictions);
                    const isWinner = wId &&
                      (i % 2 === 0 ? sfM?.homeTeamId === wId : sfM?.awayTeamId === wId);

                    return (
                      <path
                        key={i}
                        d={`M 0 ${y1} C 30 ${y1}, 30 ${y2}, 60 ${y2}`}
                        fill="none"
                        stroke={isWinner ? "#10b981" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isWinner ? "2.5" : "1.5"}
                        className={isWinner ? "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" : ""}
                      />
                    );
                  })}
                </svg>

                {/* COLUMN 4: SEMIFINALS */}
                <div className="flex flex-col justify-around h-full py-16 z-10">
                  {sfMatches.map((m) => (
                    <div key={m.id}>{renderTreeCard(m)}</div>
                  ))}
                </div>

                {/* SVG CONNECTORS: SF -> FINAL */}
                <svg width="60" height={H} className="shrink-0 pointer-events-none">
                  {Array.from({ length: 2 }).map((_, i) => {
                    const y1 = (i + 0.5) * (H / 2);
                    const y2 = H * 0.5;

                    const sfM = sfMatches[i];
                    const fM = finalMatch;
                    const wId = getMatchWinner(sfM, predictions);
                    const isWinner = fM && wId &&
                      (i % 2 === 0 ? fM.homeTeamId === wId : fM.awayTeamId === wId);

                    return (
                      <path
                        key={i}
                        d={`M 0 ${y1} C 30 ${y1}, 30 ${y2}, 60 ${y2}`}
                        fill="none"
                        stroke={isWinner ? "#10b981" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isWinner ? "2.5" : "1.5"}
                        className={isWinner ? "drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" : ""}
                      />
                    );
                  })}
                </svg>

                {/* COLUMN 5: FINAL */}
                <div className="flex flex-col justify-center h-full z-10 gap-16">
                  <div>
                    <h4 className="text-[10px] font-bold text-center text-amber-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      {dict.championship}
                    </h4>
                    {finalMatch ? renderTreeCard(finalMatch) : <div className="w-64 h-24 bg-white/5 rounded-xl border border-dashed border-white/10" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Round List Views */}
          {activeTab === "r32" && renderFocusedList(r32Matches)}
          {activeTab === "r16" && renderFocusedList(r16Matches)}
          {activeTab === "qf" && renderFocusedList(qfMatches)}
          {activeTab === "sf" && renderFocusedList(sfMatches)}
          {activeTab === "final" && finalMatch && renderFocusedList([finalMatch])}
        </div>
      )}

      {/* 3. Prediction Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedMatch(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />
          
          {/* Modal Box */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a1120] p-6 shadow-2xl animate-scaleUp">
            
            {/* Header */}
            <div className="mb-6 flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                {dict.predictTitle}
              </h3>
              <button 
                type="button" 
                onClick={() => setSelectedMatch(null)}
                className="rounded-full p-1 hover:bg-white/5 text-zinc-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Info bar */}
            <div className="mb-6 rounded-xl bg-white/[0.02] border border-white/5 p-3 flex gap-2.5 items-start">
              <Info className="h-4.5 w-4.5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">{dict.drawNotice}</p>
            </div>

            {/* Teams Comparison and inputs */}
            <div className="space-y-6 mb-6">
              {/* Home Team */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {selectedMatch.homeTeamId && (
                    <Link 
                      href={`/ulkeler/${selectedMatch.homeTeamId}`}
                      className="flex items-center gap-3 overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                    >
                      <div className="relative h-6 w-9 shrink-0 overflow-hidden rounded shadow ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                        <Image 
                          src={getTeamById(selectedMatch.homeTeamId)?.flagUrl || ""} 
                          alt="" 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      </div>
                      <span className="truncate text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {getTeamName(getTeamById(selectedMatch.homeTeamId)!, locale)}
                      </span>
                    </Link>
                  )}
                </div>
                <input 
                  type="number"
                  min={0}
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 h-10 rounded-xl border border-white/10 bg-black/40 text-center font-mono text-base font-bold text-white focus:border-emerald-500/50 outline-none"
                />
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {selectedMatch.awayTeamId && (
                    <Link 
                      href={`/ulkeler/${selectedMatch.awayTeamId}`}
                      className="flex items-center gap-3 overflow-hidden hover:text-emerald-400 cursor-pointer transition-colors group"
                    >
                      <div className="relative h-6 w-9 shrink-0 overflow-hidden rounded shadow ring-1 ring-white/10 group-hover:ring-emerald-500/35 transition-all">
                        <Image 
                          src={getTeamById(selectedMatch.awayTeamId)?.flagUrl || ""} 
                          alt="" 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      </div>
                      <span className="truncate text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {getTeamName(getTeamById(selectedMatch.awayTeamId)!, locale)}
                      </span>
                    </Link>
                  )}
                </div>
                <input 
                  type="number"
                  min={0}
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 h-10 rounded-xl border border-white/10 bg-black/40 text-center font-mono text-base font-bold text-white focus:border-emerald-500/50 outline-none"
                />
              </div>

              {/* Extra Time panel if draw */}
              {homeScore === awayScore && (
                <div className="space-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-fadeIn">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">
                    {dict.etLabel}
                  </h4>
                  
                  {/* ET Input row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-zinc-400">{dict.etLabel}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        min={0}
                        value={homeET}
                        onChange={(e) => setHomeET(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-10 h-8 rounded-lg border border-white/10 bg-black/40 text-center font-mono text-xs font-bold text-white focus:border-emerald-500/50 outline-none"
                      />
                      <span className="text-zinc-500">-</span>
                      <input 
                        type="number"
                        min={0}
                        value={awayET}
                        onChange={(e) => setAwayET(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-10 h-8 rounded-lg border border-white/10 bg-black/40 text-center font-mono text-xs font-bold text-white focus:border-emerald-500/50 outline-none"
                      />
                    </div>
                  </div>

                  {/* Penalty shootout if ET draw */}
                  {homeET === awayET && (
                    <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {dict.penLabel}
                      </h4>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-amber-400/90">{dict.penLabel}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            min={0}
                            value={homePen}
                            onChange={(e) => setHomePen(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-10 h-8 rounded-lg border border-white/10 bg-black/40 text-center font-mono text-xs font-bold text-amber-400 focus:border-amber-500/50 outline-none"
                          />
                          <span className="text-zinc-500">-</span>
                          <input 
                            type="number"
                            min={0}
                            value={awayPen}
                            onChange={(e) => setAwayPen(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-10 h-8 rounded-lg border border-white/10 bg-black/40 text-center font-mono text-xs font-bold text-amber-400 focus:border-amber-500/50 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="button"
                onClick={savePrediction}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                {dict.saveBtn}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={handleAiPredictSingle}
                  className="rounded-xl border border-violet-500/30 bg-violet-500/5 py-2.5 text-xs font-bold text-violet-400 hover:bg-violet-500/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>{dict.aiPredict}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 transition active:scale-95 cursor-pointer"
                >
                  {dict.closeBtn}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </PageShell>
  );
}
