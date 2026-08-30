"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LanguageCode, MinlanCard, SUPPORTED_LANGUAGES, MinlanCategory, MinlanCommunityStats } from "@/lib/minlan/types";
import { getMinlanTranslation } from "@/lib/minlan/i18n";
import { Trophy, RotateCcw, CheckCircle2, Pause, Play, Heart, AlertTriangle, Flame, Home, Globe, LogOut, BrainCircuit } from "lucide-react";

const ROUND_TIMER_TABLE: Record<number, number> = {
  1: 27, 2: 36, 3: 45, 4: 54, 5: 63,
  6: 71, 7: 79, 8: 87, 9: 95, 10: 103,
  11: 102, 12: 101, 13: 100, 14: 99, 15: 98,
  16: 96, 17: 94, 18: 92, 19: 90, 20: 88,
  21: 85, 22: 82, 23: 79, 24: 73, 25: 70
};

const MINLAN_CATEGORY_SCORE_TABLE: Record<number, {
  basePoint: number;
  roundMultiplier: number;
  streakMultiplier: number;
  timeMultiplier: number;
  streakBonuses: Record<number, number>;
  masterBonuses: Record<number, number>;
}> = {
  1: { basePoint: 100, roundMultiplier: 10, streakMultiplier: 20, timeMultiplier: 5, streakBonuses: { 4: 400, 7: 500, 9: 700 }, masterBonuses: { 4: 900, 7: 1100, 9: 1400 } },
  2: { basePoint: 110, roundMultiplier: 11, streakMultiplier: 21, timeMultiplier: 5, streakBonuses: { 4: 410, 7: 510, 9: 710 }, masterBonuses: { 4: 915, 7: 1120, 9: 1430 } },
  3: { basePoint: 120, roundMultiplier: 12, streakMultiplier: 22, timeMultiplier: 6, streakBonuses: { 4: 420, 7: 520, 9: 720 }, masterBonuses: { 4: 930, 7: 1140, 9: 1460 } },
  4: { basePoint: 130, roundMultiplier: 13, streakMultiplier: 23, timeMultiplier: 6, streakBonuses: { 4: 430, 7: 530, 9: 730 }, masterBonuses: { 4: 945, 7: 1160, 9: 1490 } },
  5: { basePoint: 140, roundMultiplier: 14, streakMultiplier: 24, timeMultiplier: 7, streakBonuses: { 4: 440, 7: 540, 9: 740 }, masterBonuses: { 4: 960, 7: 1180, 9: 1520 } },
  6: { basePoint: 150, roundMultiplier: 15, streakMultiplier: 25, timeMultiplier: 7, streakBonuses: { 4: 450, 7: 550, 9: 750 }, masterBonuses: { 4: 975, 7: 1200, 9: 1550 } },
  7: { basePoint: 165, roundMultiplier: 17, streakMultiplier: 27, timeMultiplier: 8, streakBonuses: { 4: 460, 7: 560, 9: 760 }, masterBonuses: { 4: 990, 7: 1220, 9: 1580 } },
  8: { basePoint: 180, roundMultiplier: 19, streakMultiplier: 28, timeMultiplier: 8, streakBonuses: { 4: 470, 7: 570, 9: 770 }, masterBonuses: { 4: 1005, 7: 1240, 9: 1610 } },
  9: { basePoint: 195, roundMultiplier: 21, streakMultiplier: 29, timeMultiplier: 9, streakBonuses: { 4: 480, 7: 580, 9: 780 }, masterBonuses: { 4: 1020, 7: 1260, 9: 1640 } },
  10: { basePoint: 210, roundMultiplier: 23, streakMultiplier: 30, timeMultiplier: 9, streakBonuses: { 4: 490, 7: 590, 9: 790 }, masterBonuses: { 4: 1035, 7: 1280, 9: 1670 } },
};

function getTimerSecondsForRound(round: number): number {
  if (ROUND_TIMER_TABLE[round]) {
    return ROUND_TIMER_TABLE[round];
  }
  // 25. turdan sonrası 70 saniyede sabitlenir
  return 70;
}

interface MinlanGameBoardProps {
  categoryId: string;
  categoryName: string;
  categories: MinlanCategory[];
  nativeLang: LanguageCode;
  targetLang: LanguageCode;
  communityStats: MinlanCommunityStats;
  onTargetLangChange: (lang: LanguageCode) => void;
  onSelectCategory: (id: string) => void;
  onRecordProgress: (matches: number, score: number, sessionScore?: number, roundReached?: number) => void;
  onOpenLeaderboard: () => void;
  onOpenMistakes: () => void;
}

export function MinlanGameBoard({
  categoryId,
  categoryName,
  categories,
  nativeLang,
  targetLang,
  communityStats,
  onTargetLangChange,
  onSelectCategory,
  onRecordProgress,
  onOpenLeaderboard,
  onOpenMistakes,
}: MinlanGameBoardProps) {
  const router = useRouter();
  const t = getMinlanTranslation(nativeLang);
  const [roundLevel, setRoundLevel] = useState<number>(1);
  const [cards, setCards] = useState<MinlanCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MinlanCard[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [mistakes, setMistakes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(27);
  const [carryOverTime, setCarryOverTime] = useState<number>(0);
  const [totalLifetimeMatches, setTotalLifetimeMatches] = useState<number>(0);
  const [nextBonusTarget, setNextBonusTarget] = useState<number>(20);
  const [bonusLevel, setBonusLevel] = useState<number>(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "game_over">("idle");
  const [loading, setLoading] = useState<boolean>(false);
  const [showRoundSuccess, setShowRoundSuccess] = useState<boolean>(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Permanently unlocked category IDs stored in localStorage as a dictionary of language pairs
  const [unlockedCategoryDict, setUnlockedCategoryDict] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("minlan_unlocked_categories_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {};
  });

  const currentPairKey = `${nativeLang}-${targetLang}`;
  const unlockedCategoryIds = unlockedCategoryDict[currentPairKey] || ["cat-1"];

  const unlockNextCategoryPermanent = (nextCatId: string) => {
    setUnlockedCategoryDict((prev) => {
      const currentList = prev[currentPairKey] || ["cat-1"];
      if (!currentList.includes(nextCatId)) {
        const updatedList = [...currentList, nextCatId];
        const updatedDict = { ...prev, [currentPairKey]: updatedList };
        if (typeof window !== "undefined") {
          localStorage.setItem("minlan_unlocked_categories_v2", JSON.stringify(updatedDict));
        }
        return updatedDict;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (categoryId !== "cat-1" && !unlockedCategoryIds.includes(categoryId)) {
      onSelectCategory("cat-1");
    }
  }, [currentPairKey, categoryId, unlockedCategoryIds, onSelectCategory]);

  // Round progression: Round 1 = 3 pairs (6 cards). Every round adds 2 cards (+1 pair). Max 12 pairs (24 cards) at round 10.
  const pairCount = Math.min(12, 3 + (roundLevel - 1));
  const maxTimerSeconds = getTimerSecondsForRound(roundLevel);

  // Fetch cards for current round
  const loadRoundCards = useCallback(async () => {
    setLoading(true);
    setFlippedCards([]);
    setMatchedPairsCount(0);

    try {
      const res = await fetch(
        `/api/minlan/words?categoryId=${categoryId}&nativeLang=${nativeLang}&targetLang=${targetLang}&pairCount=${pairCount}&roundLevel=${roundLevel}`
      );
      const data = await res.json();

      if (data.success && data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, nativeLang, targetLang, pairCount, roundLevel]);

  useEffect(() => {
    if (gameState === "playing") {
      setTimeLeft(maxTimerSeconds + carryOverTime);
      loadRoundCards();
    }
  }, [roundLevel, categoryId, nativeLang, targetLang, gameState, loadRoundCards, maxTimerSeconds, carryOverTime]);

  const startRound = () => {
    setGameState("playing");
    setCarryOverTime(0);
    setTimeLeft(maxTimerSeconds);
    loadRoundCards();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("game_over");
            if (score > 0) {
              onRecordProgress(0, 0, score, roundLevel);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, onRecordProgress]);

  const resetEntireGame = () => {
    if (score > 0 && gameState === "playing") {
      onRecordProgress(0, 0, score, roundLevel);
    }
    setGameState("idle");
    setRoundLevel(1);
    setScore(0);
    setLives(3);
    setMistakes(0);
    setStreak(0);
    setTimeLeft(27);
    setCarryOverTime(0);
    setTotalLifetimeMatches(0);
    setNextBonusTarget(20);
    setBonusLevel(1);
    setFlippedCards([]);
    setCards([]);
    setMatchedPairsCount(0);
    setShowRoundSuccess(false);
  };

  const handleCardClick = (clickedCard: MinlanCard) => {
    if (
      gameState !== "playing" ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    const updatedCards = cards.map((c) => (c.id === clickedCard.id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [card1, card2] = newFlipped;

      if (card1.wordPairId === card2.wordPairId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordPairId === card1.wordPairId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setFlippedCards([]);
          const newMatchedCount = matchedPairsCount + 1;
          setMatchedPairsCount(newMatchedCount);
          const newStreak = streak + 1;
          setStreak(newStreak);
          setMistakes(0);

          const newTotalMatches = totalLifetimeMatches + 1;
          setTotalLifetimeMatches(newTotalMatches);

          const currentCatIdx = categories.findIndex((c) => c.id === categoryId);
          const categoryNumber = currentCatIdx >= 0 ? currentCatIdx + 1 : 1;
          const scoreConfig = MINLAN_CATEGORY_SCORE_TABLE[categoryNumber] || MINLAN_CATEGORY_SCORE_TABLE[1];

          if (newTotalMatches >= nextBonusTarget) {
            let nextGap = 50;
            if (bonusLevel === 1) nextGap = 30;
            else if (bonusLevel === 2) nextGap = 38;
            else if (bonusLevel === 3) nextGap = 44;
            else if (bonusLevel === 4) nextGap = 48;
            
            setNextBonusTarget(nextBonusTarget + nextGap);
            setBonusLevel((prev) => prev + 1);

            const masterPoints = scoreConfig.masterBonuses[9] || 1000;
            setLives((currLives) => {
              if (currLives >= 5) {
                setTimeLeft((tVal) => tVal + 10);
                setScore((s) => s + masterPoints);
                setRewardToast(`Usta Bonusu: +10 Saniye & +${masterPoints} Puan! 🎁`);
                return 5;
              } else {
                setRewardToast("Usta Bonusu: +1 Can! ❤️");
                return currLives + 1;
              }
            });
            setTimeout(() => setRewardToast(null), 3000);
          }

          // MinMat / MinLan Consecutive Match Streak Life Reward Rule:
          // 4, 7, 9 consecutive matches give +1 Life (max 5)
          // If already 5/5 max lives -> Give +5s Time Bonus & Category Streak Score Bonus!
          if (newStreak === 4 || newStreak === 7 || newStreak === 9) {
            const streakPoints = scoreConfig.streakBonuses[newStreak] || 500;
            setLives((currLives) => {
              if (currLives >= 5) {
                setTimeLeft((tVal) => tVal + 5);
                setScore((s) => s + streakPoints);
                setRewardToast(`Seri ${newStreak} Bonusu: +5 Sn & +${streakPoints} Puan! 🔥`);
                return 5;
              } else {
                setRewardToast(t.streakLifeReward.replace("{streak}", String(newStreak)));
                return currLives + 1;
              }
            });
            setTimeout(() => setRewardToast(null), 2000);
          }

          // Exact Category-Progressive Scoring Formula:
          // Taban Puan + (Tur × Tur Katsayısı) + (Seri × Seri Katsayısı) + (Kalan Süre × Süre Katsayısı)
          const matchPoints = scoreConfig.basePoint + (roundLevel * scoreConfig.roundMultiplier) + (newStreak * scoreConfig.streakMultiplier) + (timeLeft * scoreConfig.timeMultiplier);
          setScore((s) => s + matchPoints);

          if (newMatchedCount >= pairCount) {
            onRecordProgress(pairCount, matchPoints * pairCount);
            setShowRoundSuccess(true);

            if (roundLevel >= 4) {
              const currentCatIdx = categories.findIndex((c) => c.id === categoryId);
              if (currentCatIdx >= 0 && currentCatIdx + 1 < categories.length) {
                const nextCatId = categories[currentCatIdx + 1].id;
                unlockNextCategoryPermanent(nextCatId);
              }
            }

            setTimeout(() => {
              setShowRoundSuccess(false);
              setCarryOverTime(Math.floor(timeLeft / 2));
              setRoundLevel((prev) => prev + 1);
            }, 800);
          }
        }, 350);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setStreak(0);

          // Track the mistake asynchronously
          fetch("/api/minlan/mistakes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wordId: card1.wordPairId,
              nativeLang,
              targetLang
            })
          }).catch((err) => console.error("Failed to track mistake", err));

          const newMistakes = mistakes + 1;
          setMistakes(newMistakes);

          if (newMistakes >= 3) {
            setMistakes(0);
            setLives((l) => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState("game_over");
                onRecordProgress(0, 0, score, roundLevel);
              }
              return Math.max(0, newLives);
            });
          }
        }, 800);
      }
    }
  };

  const getCategoryTitle = (cat: MinlanCategory) => {
    const key = `name_${nativeLang}` as keyof MinlanCategory;
    return (cat[key] as string) || cat.name_tr;
  };

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const selectedCategoryTitle = getCategoryTitle(selectedCategory);

  // Check Community Lock status for Cat 4 (25,000 matches required)
  const isCommunityGoalMet = communityStats.total_card_matches >= communityStats.target_card_matches;

  // Custom Category Selector Items according to user instructions:
  // Cat 1: 🏠 (Open)
  // Cat 2: 💻 (Open if Cat 1 Tur 4 finished for THIS language pair)
  // Cat 3: 🔬 (Open if Cat 2 Tur 4 finished for THIS language pair)
  // Cat 4: 🩺 (Locked / Yakında)
  // Cat 5 & 6: 🌿 & 📈 (Locked / Yakında)
  // Cat 7, 8, 9: Removed from UI
  const getCatLabel = (id: string, defaultName: string) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? getCategoryTitle(c) : defaultName;
  };

  const selectorItems = [
    { id: "cat-1", icon: "🏠", label: getCatLabel("cat-1", "Günlük Yaşam"), isUnlocked: true, lockReason: "" },
    { id: "cat-2", icon: "💻", label: getCatLabel("cat-2", "Teknoloji"), isUnlocked: unlockedCategoryIds.includes("cat-2"), lockReason: "🔒 1. Kategoride Tur 4'ü Bitir" },
    { id: "cat-3", icon: "🔬", label: getCatLabel("cat-3", "Bilim"), isUnlocked: unlockedCategoryIds.includes("cat-3"), lockReason: "🔒 2. Kategoride Tur 4'ü Bitir" },
    { id: "cat-4", icon: "🩺", label: getCatLabel("cat-4", "Sağlık"), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
    { id: "cat-5", icon: "🌿", label: getCatLabel("cat-5", "Çevre & İklim"), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
    { id: "cat-6", icon: "📈", label: getCatLabel("cat-6", "Ekonomi & Finans"), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
  ];

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. MinMat Exact Header Badges Row: Active Category + Target Language Dropdown */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
        {/* Active Category Badge */}
        <div className="px-4 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center gap-2 shadow-lg">
          <span className="text-xl">🎯</span>
          <span className="text-sm sm:text-base font-extrabold text-white">{selectedCategoryTitle}</span>
        </div>

        {/* Target Language Selector Badge (MinMat Style) */}
        <div className="px-4 py-2 bg-slate-900 border border-cyan-500/40 rounded-2xl flex items-center gap-2 shadow-lg">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">{t.targetLangLabel}</span>
          <select
            value={targetLang}
            onChange={(e) => onTargetLangChange(e.target.value as LanguageCode)}
            className="bg-slate-950 text-cyan-300 font-extrabold text-xs sm:text-sm px-2 py-0.5 rounded-lg border border-cyan-500/30 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.filter((l) => l.code !== nativeLang).map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* 4. Category Selector Icons (MinMat '+' '-' 'x' '/' style directly on top of board) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-5 flex-wrap">
        {selectorItems.map((item) => {
          const isCurrent = item.id === categoryId;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => item.isUnlocked && onSelectCategory(item.id)}
                disabled={!item.isUnlocked}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer border relative ${
                  isCurrent
                    ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/60 font-black"
                    : item.isUnlocked
                    ? "bg-slate-900 border-slate-700/80 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:scale-102"
                    : "bg-slate-950 border-slate-800/80 text-slate-700 opacity-40 cursor-not-allowed"
                }`}
              >
                <span>{item.icon}</span>
                {!item.isUnlocked && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-slate-900 text-slate-400 p-0.5 rounded-full border border-slate-700">
                    🔒
                  </span>
                )}
              </button>

              {/* Hover Tooltip for Category Name & Lock Reason */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 whitespace-nowrap">
                <div className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {!item.isUnlocked && (
                    <span className="text-amber-400 font-normal"> ({item.lockReason})</span>
                  )}
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Action Buttons: Menu & Leaderboard & Mistakes */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => {
            if (gameState === "idle") {
              router.push("/");
            } else {
              resetEntireGame();
            }
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          {gameState === "idle" ? <LogOut className="w-4 h-4 text-cyan-400" /> : <Home className="w-4 h-4 text-cyan-400" />}
          <span>{gameState === "idle" ? "Ana Sayfa" : t.menuText}</span>
        </button>

        <button
          onClick={onOpenMistakes}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold rounded-xl text-xs hover:bg-purple-500/20 transition-all cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4" />
          Hatalarım
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t.scoreTableText}</span>
        </button>
      </div>

      {/* 3. MinLan Stats Row: Left (Score, Round, Combo), Center (Timer), Right (Hearts, Mistakes, Pause) */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 bg-slate-950/80 border border-slate-800 px-3 sm:px-5 py-2.5 rounded-2xl mb-5 w-full max-w-xl">
        {/* Left: Score & Round & Combo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Score */}
          <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-base sm:text-lg">
            <span>⭐</span>
            <span>{score}</span>
          </div>

          {/* Round Level */}
          <div className="text-xs sm:text-sm font-extrabold text-white whitespace-nowrap bg-slate-900/90 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-800">
            {t.roundText} {roundLevel}
          </div>

          {/* Combo Streak */}
          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>{streak}x</span>
            </div>
          )}
        </div>

        {/* Center: Timer (Highlighted in center) */}
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center gap-1.5 font-mono font-black text-base sm:text-lg px-3 py-1 rounded-xl border transition-all ${
              timeLeft <= 5 && gameState === "playing"
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse"
                : "bg-slate-900/90 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/10"
            }`}
          >
            <span>⏱️</span>
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Right: Hearts, Mistakes & Pause Button on the edge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
          {/* Hearts / Lives (Max 5 Hearts) */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                  i < lives
                    ? "text-rose-500 fill-rose-500 scale-100"
                    : "text-slate-800 fill-slate-900 opacity-40"
                }`}
              />
            ))}
          </div>

          {/* Mistake Counter */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-lg">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>{mistakes}/3</span>
          </div>

          {/* Pause Button (On the edge) */}
          {(gameState === "playing" || gameState === "paused") && (
            <button
              onClick={() => setGameState(gameState === "paused" ? "playing" : "paused")}
              className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-all cursor-pointer hover:border-cyan-500/40"
              title={gameState === "paused" ? t.resumeText : "Duraklat"}
            >
              {gameState === "paused" ? (
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              ) : (
                <Pause className="w-4 h-4 text-cyan-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 6. Active Memory Game Board Cards */}
      {gameState === "idle" ? (
        <div className="py-10 px-6 text-center bg-slate-950/70 border border-slate-800/80 rounded-3xl w-full max-w-sm mx-auto my-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 overflow-hidden p-1 shadow-lg shadow-cyan-500/20">
            <img
              src="/minlan-logo.png"
              alt="MinLan Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-xl font-black text-white mb-1">MinLan — Dil Avı</h3>
          <p className="text-xs text-slate-400 mb-6 italic">
            {t.slogan}
          </p>
          <button
            onClick={startRound}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          >
            {t.startGameText}
          </button>
        </div>
      ) : gameState === "paused" ? (
        <div className="py-16 text-center text-slate-400 bg-slate-950/70 border border-slate-800/80 rounded-3xl w-full max-w-sm mx-auto my-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-xl shadow-cyan-500/10 animate-pulse">
            <Pause className="w-8 h-8" />
          </div>
          <p className="text-lg font-black text-white mb-2">{t.pausedTitle}</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
            Oyun duraklatıldı. Kartlar gizlendi. Hazır olduğunda devam edebilirsin.
          </p>
          <button
            onClick={() => setGameState("playing")}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{t.resumeText}</span>
          </button>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-cyan-400">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-sm font-bold">{t.cardsLoadingText}</span>
        </div>
      ) : (
        /* Dynamic Grid Container: 3 cols initially, 4 on mobile and 6 on desktop for >16 cards */
        <div className={`grid ${cards.length > 16 ? "grid-cols-4 sm:grid-cols-6 max-w-full sm:max-w-3xl gap-2 sm:gap-3" : "grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-md"} w-full mx-auto my-2`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || card.isFlipped}
              className={`${cards.length > 16 ? "h-20 sm:h-24 rounded-xl p-1" : "h-28 sm:h-36 rounded-2xl p-2"} flex flex-col items-center justify-center text-center transition-all duration-300 transform cursor-pointer border relative overflow-hidden ${
                card.isMatched
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 opacity-60 scale-95"
                  : card.isFlipped
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-400 text-white shadow-xl shadow-cyan-500/20 scale-105 ring-2 ring-cyan-500/40"
                  : "bg-slate-950 border-slate-800 hover:border-cyan-500/40 shadow-md hover:scale-102"
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                /* Flipped Card: Clean Large Word Text ONLY */
                <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 animate-fadeIn">
                  <span className={`${cards.length > 16 ? "text-[10px] leading-tight sm:text-xs" : "text-sm sm:text-base"} font-black text-white leading-tight break-words px-1`}>
                    {card.text}
                  </span>
                </div>
              ) : (
                /* Card Back: LARGE FULL MINLAN LOGO IMAGE WITH 85% SIZE (NEGATIVE SPACE) */
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="/minlan-logo.png"
                    alt="MinLan Logo"
                    className="w-full h-full object-contain max-w-[85%] max-h-[85%] opacity-90 drop-shadow-sm"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 6.5 Consecutive Match Streak Reward Banner Toast */}
      {rewardToast && (
        <div className="fixed inset-x-0 top-16 z-50 flex items-center justify-center p-4 pointer-events-none animate-fadeIn">
          <div className="bg-amber-950/90 border border-amber-500/60 px-5 py-3 rounded-2xl text-center shadow-2xl flex items-center gap-3 text-white backdrop-blur-md">
            <span className="text-xl animate-bounce">🎁</span>
            <span className="font-extrabold text-xs sm:text-sm text-amber-300">
              {rewardToast}
            </span>
          </div>
        </div>
      )}

      {/* 7. Quick Round Success Banner Toast */}
      {showRoundSuccess && (
        <div className="fixed inset-x-0 top-24 z-50 flex items-center justify-center p-4 pointer-events-none animate-fadeIn">
          <div className="bg-emerald-950/90 border border-emerald-500/60 px-6 py-3.5 rounded-2xl text-center shadow-2xl flex items-center gap-3 text-white backdrop-blur-md">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
            <div>
              <span className="font-extrabold text-sm text-emerald-300 block">
                {t.roundCompletedTitle.replace("{round}", String(roundLevel))}
              </span>
              <span className="text-xs text-slate-300">
                {t.roundCompletedDesc}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Game Over Modal */}
      {gameState === "game_over" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
            <div className="text-5xl mb-4">⏰</div>
            <h3 className="text-2xl font-black text-white mb-2">{t.gameOverTitle}</h3>
            <p className="text-sm text-slate-400 mb-6">
              {t.roundText} {roundLevel}. {t.totalScoreText}: <span className="text-amber-400 font-bold">{score}</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={resetEntireGame}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-5 h-5 text-cyan-400" />
                <span>{t.playAgainText}</span>
              </button>

              <button
                onClick={onOpenMistakes}
                className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold rounded-2xl border border-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <span>Hatalarım</span>
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{t.scoreTableText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
