"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LanguageCode, MinlanCard, SUPPORTED_LANGUAGES, MinlanCategory, MinlanCommunityStats } from "@/lib/minlan/types";
import { getMinlanTranslation } from "@/lib/minlan/i18n";
import { Trophy, RotateCcw, CheckCircle2, Pause, Play, Heart, AlertTriangle, Flame, Home, Globe, LogOut } from "lucide-react";

const ROUND_TIMER_TABLE: Record<number, number> = {
  1: 27,
  2: 36,
  3: 45,
  4: 54,
  5: 63,
  6: 71,
  7: 79,
  8: 87,
  9: 95,
  10: 103,
  11: 110,
  12: 117,
  13: 124,
  14: 131,
  15: 138,
  16: 144,
  17: 150,
  18: 156,
  19: 162,
  20: 168,
  21: 174,
  22: 180,
  23: 186,
};

function getTimerSecondsForRound(round: number): number {
  if (ROUND_TIMER_TABLE[round]) {
    return ROUND_TIMER_TABLE[round];
  }
  // For round 24+, continue adding +6 seconds per round
  return 186 + (round - 23) * 6;
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
  onRecordProgress: (matches: number, score: number, sessionScore?: number) => void;
  onOpenLeaderboard: () => void;
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

  // Round progression: Round 1 = 3 pairs (6 cards). Every round adds 2 cards (+1 pair)
  const pairCount = 3 + (roundLevel - 1);
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
      setTimeLeft(maxTimerSeconds);
      loadRoundCards();
    }
  }, [roundLevel, categoryId, nativeLang, targetLang, gameState, loadRoundCards, maxTimerSeconds]);

  const startRound = () => {
    setGameState("playing");
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
              onRecordProgress(0, 0, score);
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
      onRecordProgress(0, 0, score);
    }
    setGameState("idle");
    setRoundLevel(1);
    setScore(0);
    setLives(3);
    setMistakes(0);
    setStreak(0);
    setTimeLeft(27);
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

          // MinMat Consecutive Match Streak Life Reward Rule:
          // 4, 7, 9 consecutive matches give +1 Life (max 5)
          // If already 5/5 max lives -> Give +5s Time Bonus & +500 Points Score Bonus!
          if (newStreak === 4 || newStreak === 7 || newStreak === 9) {
            setLives((currLives) => {
              if (currLives >= 5) {
                setTimeLeft((tVal) => tVal + 5);
                setScore((s) => s + 500);
                setRewardToast(t.maxLifeReward);
                return 5;
              } else {
                setRewardToast(t.streakLifeReward.replace("{streak}", String(newStreak)));
                return currLives + 1;
              }
            });
            setTimeout(() => setRewardToast(null), 2000);
          }

          const bonusScore = 100 + newStreak * 20 + timeLeft * 5;
          setScore((s) => s + bonusScore);

          if (newMatchedCount >= pairCount) {
            onRecordProgress(pairCount, bonusScore * pairCount);
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

          const newMistakes = mistakes + 1;
          setMistakes(newMistakes);

          if (newMistakes >= 3) {
            setMistakes(0);
            setLives((l) => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState("game_over");
                onRecordProgress(0, 0, score);
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
  const selectorItems = [
    { id: "cat-1", icon: "🏠", label: getCategoryTitle(categories[0] || { name_tr: "Günlük Yaşam" } as any), isUnlocked: true, lockReason: "" },
    { id: "cat-2", icon: "💻", label: getCategoryTitle(categories[1] || { name_tr: "Teknoloji" } as any), isUnlocked: unlockedCategoryIds.includes("cat-2"), lockReason: "🔒 1. Kategoride Tur 4'ü Bitir" },
    { id: "cat-3", icon: "🔬", label: getCategoryTitle(categories[2] || { name_tr: "Bilim" } as any), isUnlocked: unlockedCategoryIds.includes("cat-3"), lockReason: "🔒 2. Kategoride Tur 4'ü Bitir" },
    { id: "cat-4", icon: "🩺", label: getCategoryTitle(categories[3] || { name_tr: "Sağlık" } as any), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
    { id: "cat-5", icon: "🌿", label: getCategoryTitle(categories[4] || { name_tr: "Çevre & İklim" } as any), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
    { id: "cat-6", icon: "📈", label: getCategoryTitle(categories[5] || { name_tr: "Ekonomi & Finans" } as any), isUnlocked: false, lockReason: "🔒 Yakında Açılacak" },
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

      {/* 3. MinMat Exact Stats Row: Score, Timer, Round, Pause, Hearts, Mistakes, Combo */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-slate-950/80 border border-slate-800 px-4 sm:px-6 py-3 rounded-2xl mb-5 w-full max-w-xl">
        {/* Score */}
        <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-lg">
          <span>⭐</span>
          <span>{score}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 font-mono font-black text-cyan-300 text-lg">
          <span>⏱️</span>
          <span>{timeLeft}</span>
        </div>

        {/* Round Level */}
        <div className="text-sm font-extrabold text-white">
          {t.roundText} {roundLevel}
        </div>

        {/* Pause Button */}
        <button
          onClick={() => setGameState(gameState === "paused" ? "playing" : "paused")}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-all cursor-pointer"
          title={gameState === "paused" ? "Devam Et" : "Duraklat"}
        >
          {gameState === "paused" ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Hearts / Lives (Max 5 Hearts) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 transition-all ${
                i < lives
                  ? "text-rose-500 fill-rose-500 scale-100"
                  : "text-slate-800 fill-slate-900 opacity-40"
              }`}
            />
          ))}
        </div>

        {/* Mistake Counter */}
        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{mistakes}/3</span>
        </div>

        {/* Combo Streak */}
        <div className="flex items-center gap-1 text-xs font-bold text-orange-400">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>{streak}</span>
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

      {/* 5. Action Buttons: Menu & Leaderboard */}
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
          onClick={onOpenLeaderboard}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{t.scoreTableText}</span>
        </button>
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
        <div className="py-16 text-center text-slate-400">
          <Pause className="w-12 h-12 mx-auto mb-3 text-cyan-400 animate-pulse" />
          <p className="text-lg font-bold text-white">{t.pausedTitle}</p>
          <button
            onClick={() => setGameState("playing")}
            className="mt-4 px-6 py-2.5 bg-cyan-500 text-slate-950 font-black rounded-xl cursor-pointer"
          >
            {t.resumeText}
          </button>
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-cyan-400">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-sm font-bold">{t.cardsLoadingText}</span>
        </div>
      ) : (
        /* Fixed 3-Column Grid Container with Larger Cards & Full Logo Backs */
        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md mx-auto my-2">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || card.isFlipped}
              className={`h-28 sm:h-36 rounded-2xl p-2 flex flex-col items-center justify-center text-center transition-all duration-300 transform cursor-pointer border relative overflow-hidden ${
                card.isMatched
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 opacity-60 scale-95"
                  : card.isFlipped
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-400 text-white shadow-xl shadow-cyan-500/20 scale-105 ring-2 ring-cyan-500/40"
                  : "bg-slate-950 border-slate-800 hover:border-cyan-500/40 shadow-md hover:scale-102"
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                /* Flipped Card: Clean Large Word Text ONLY */
                <div className="w-full h-full flex items-center justify-center p-2 animate-fadeIn">
                  <span className="text-sm sm:text-base font-black text-white leading-tight break-words px-1">
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
            <button
              onClick={resetEntireGame}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              <span>{t.playAgainText}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
