"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { MinmatCard, MinmatMode } from "@/lib/minmat/types";
import { generateMinmatCards } from "@/lib/minmat/generator";
import { getMinmatTranslation } from "@/lib/minmat/i18n";
import { Trophy, RotateCcw, Pause, Play, Heart, AlertTriangle, Flame, Share2, Award, Zap } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";

interface MinmatGameBoardProps {
  lang?: string;
  onOpenLeaderboard: () => void;
}

export function MinmatGameBoard({ lang = "tr", onOpenLeaderboard }: MinmatGameBoardProps) {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const t = getMinmatTranslation(lang);

  const [gameMode, setGameMode] = useState<MinmatMode>("add");
  const [level, setLevel] = useState<number>(1);
  const [cards, setCards] = useState<MinmatCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MinmatCard[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "game_over">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasShareBoost, setHasShareBoost] = useState<boolean>(false);

  // Unlocked modes in localStorage
  const [unlockedModes, setUnlockedModes] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      return {
        add: true,
        sub: localStorage.getItem("minmat_unlocked_sub") === "true",
        mul: localStorage.getItem("minmat_unlocked_mul") === "true",
        div: localStorage.getItem("minmat_unlocked_div") === "true",
        mix: localStorage.getItem("minmat_unlocked_mix") === "true",
      };
    }
    return { add: true, sub: false, mul: false, div: false, mix: false };
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Show floating toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1200);
  };

  // Check if mode is unlocked
  const isModeUnlocked = (mode: MinmatMode) => {
    if (mode === "add") return true;
    return !!unlockedModes[mode];
  };

  // Start new level
  const startLevel = useCallback((lvl: number, currentMode: MinmatMode, prevTime: number = 0) => {
    const newCards = generateMinmatCards(currentMode, lvl);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setWrongCount(0);

    const pairs = Math.min(18, lvl + 2);
    const timePerPair = Math.max(8 - lvl * 0.5, 5);
    const baseTime = Math.floor(pairs * timePerPair);

    let newTime = 30;
    if (lvl === 1) {
      newTime = 30;
    } else {
      const carryOver = Math.max(0, Math.floor(prevTime * 0.5));
      const completionBonusSeconds = lvl >= 6 ? 5 + 2 * Math.floor((lvl - 3) / 3) : 5;
      newTime = baseTime + carryOver + completionBonusSeconds;
    }

    setTimeLeft(newTime);
    showToast(t.round + " " + lvl);
  }, [t.round]);

  // Start entire new game
  const startGame = (modeToStart: MinmatMode = gameMode) => {
    setGameMode(modeToStart);
    setLevel(1);
    setScore(0);
    setLives(3);
    setCombo(0);
    setWrongCount(0);
    setGameState("playing");
    startLevel(1, modeToStart, 0);
  };

  // Mode selection
  const handleSelectMode = (m: MinmatMode) => {
    if (!isModeUnlocked(m)) {
      const needed: Record<string, string> = { sub: "add", mul: "sub", div: "mul", mix: "div" };
      alert(needed[m] + " " + t.round + " 4 ❗");
      return;
    }
    setGameMode(m);
    startGame(m);
  };

  // Card click / Flip logic
  const handleCardClick = (card: MinmatCard) => {
    if (gameState !== "playing" || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const isMatch = first.pairId === second.pairId && first.isQuestion !== second.isQuestion;

      if (isMatch) {
        // MATCH SUCCESS
        const newCombo = combo + 1;
        setCombo(newCombo);
        setWrongCount(0);

        // Score calculation matching original exact formula
        let baseScore = 10;
        if (gameMode === "sub") baseScore = 11;
        else if (gameMode === "mul") baseScore = 12;
        else if (gameMode === "div") baseScore = 13;
        else if (gameMode === "mix") baseScore = 15;

        const matchPoints = (baseScore + (level - 1) + Math.max(newCombo - 1, 0)) * 5;
        setScore((prev) => prev + matchPoints);

        // Life recovery on combo 4, 7, 9
        if (newCombo === 4 || newCombo === 7 || newCombo === 9) {
          setLives((prev) => Math.min(5, prev + 1));
          showToast("❤️ +1 Can Bonusu!");
        }

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true } : c))
          );
          setFlippedCards([]);
          setMatchedPairsCount((prev) => {
            const nextPairs = prev + 1;
            const totalPairsInRound = Math.min(18, level + 2);

            if (nextPairs >= totalPairsInRound) {
              // ROUND COMPLETED
              const completionBonus = 100 + (level - 1) * 50;
              const timeBonus = timeLeft * 10;
              setScore((s) => s + completionBonus + timeBonus);

              const nextLvl = level + 1;
              setLevel(nextLvl);

              // Unlock next category on round 4
              if (gameMode === "add" && nextLvl >= 4) {
                localStorage.setItem("minmat_unlocked_sub", "true");
                setUnlockedModes((u) => ({ ...u, sub: true }));
              } else if (gameMode === "sub" && nextLvl >= 4) {
                localStorage.setItem("minmat_unlocked_mul", "true");
                setUnlockedModes((u) => ({ ...u, mul: true }));
              } else if (gameMode === "mul" && nextLvl >= 4) {
                localStorage.setItem("minmat_unlocked_div", "true");
                setUnlockedModes((u) => ({ ...u, div: true }));
              } else if (gameMode === "div" && nextLvl >= 4) {
                localStorage.setItem("minmat_unlocked_mix", "true");
                setUnlockedModes((u) => ({ ...u, mix: true }));
              }

              showToast("🎉 +" + completionBonus + " Tur Bonusu!");
              setTimeout(() => {
                startLevel(nextLvl, gameMode, timeLeft);
              }, 800);
            }
            return nextPairs;
          });
        }, 300);
      } else {
        // MATCH FAILED
        setCombo(0);
        setWrongCount((prev) => {
          const nextWrong = prev + 1;
          if (nextWrong >= 3) {
            setLives((l) => {
              const remainingLives = l - 1;
              if (remainingLives <= 0) {
                handleGameOver();
              }
              return remainingLives;
            });
            return 0;
          }
          return nextWrong;
        });

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 600);
      }
    }
  };

  // Game over handler & save score to API
  const handleGameOver = useCallback(async () => {
    setGameState("game_over");
    if (timerRef.current) clearInterval(timerRef.current);

    const catMap: Record<string, string> = {
      add: "topla",
      sub: "cikar",
      mul: "carp",
      div: "bol",
      mix: "karisik",
    };

    const finalScoreToSave = hasShareBoost ? Math.round(score * 1.20) : score;

    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;

      await fetch("/api/minmat/scores?t=" + Date.now(), {
        method: "POST",
        headers,
        body: JSON.stringify({
          score: finalScoreToSave,
          highScore: finalScoreToSave,
          puan: finalScoreToSave,
          level,
          tur: level,
          mode: catMap[gameMode] || "karisik",
          mappedMode: catMap[gameMode] || "karisik",
          category: catMap[gameMode] || "karisik",
          kategori: catMap[gameMode] || "karisik",
        }),
      });
    } catch (err) {
      console.error("Score save error:", err);
    }
  }, [score, level, gameMode, hasShareBoost, getToken]);

  // Timer loop
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, handleGameOver]);

  // Share score
  const handleShare = () => {
    const text = "MinMat - Sayı Avı oyununda " + score + " puan yaptım! Rekorumu geçebilir misin? 🏆";
    const url = window.location.origin + "/minmat?score=" + score + "&mode=" + gameMode;
    if (navigator.share) {
      navigator.share({ title: "MinMat", text, url }).then(() => {
        setHasShareBoost(true);
        alert(t.shareSuccess);
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text + " " + url).then(() => {
        setHasShareBoost(true);
        alert(t.shareSuccess);
      });
    }
  };

  // Card grid column calculation
  const cols = Math.ceil(Math.sqrt(cards.length || 4));

  return (
    <div className="w-full flex flex-col items-center select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 z-50 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm rounded-full shadow-xl shadow-emerald-500/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 justify-center">
        {(["add", "sub", "mul", "div", "mix"] as const).map((m) => {
          const unlocked = isModeUnlocked(m);
          return (
            <button
              key={m}
              onClick={() => handleSelectMode(m)}
              disabled={!unlocked && gameState !== "playing"}
              className={"px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 " + (
                gameMode === m
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                  : unlocked
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  : "bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-60"
              )}
            >
              {m === "add" && "➕ "}
              {m === "sub" && "➖ "}
              {m === "mul" && "✖️ "}
              {m === "div" && "➗ "}
              {m === "mix" && "🎲 "}
              {m === "add" ? t.shortAdd : m === "sub" ? t.shortSub : m === "mul" ? t.shortMul : m === "div" ? t.shortDiv : t.shortMix}
              {!unlocked && " 🔒"}
            </button>
          );
        })}
      </div>

      {/* HUD Stats Bar */}
      <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-lg">
        {/* Lives & Mistakes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={"w-4 h-4 " + (i < lives ? "text-rose-500 fill-rose-500" : "text-slate-700")}
              />
            ))}
          </div>
          <div className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            ⚠️ {wrongCount}/3
          </div>
        </div>

        {/* Level & Combo */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800">
            Tur {level}
          </span>
          {combo > 1 && (
            <span className="text-xs font-black text-amber-400 flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-xl border border-amber-500/30 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {combo}x
            </span>
          )}
        </div>

        {/* Score & Time */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Puan</div>
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">⭐ {score}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Süre</div>
            <div className={"text-sm sm:text-base font-black font-mono " + (timeLeft <= 5 ? "text-rose-400 animate-ping" : "text-cyan-400")}>
              ⏱️ {timeLeft}s
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      {gameState === "idle" ? (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-500/10">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">{t.title}</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Hızlı matematiksel işlemlerle kartları eşleştir, turları tamamla ve liderlik tablosunda yerini al!
          </p>
          <button
            onClick={() => startGame(gameMode)}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-sm uppercase tracking-wider transform hover:scale-105 active:scale-95"
          >
            Oyuna Başla 🚀
          </button>
        </div>
      ) : gameState === "game_over" ? (
        <div className="w-full py-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-lg">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">{t.gameOver}</h2>
          <p className="text-xs text-slate-400 mb-4">Ulaşılan Tur: <span className="text-emerald-400 font-bold">Lv{level}</span></p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 w-full max-w-xs mb-5">
            <div className="text-xs text-slate-400 mb-1">Toplam Skor</div>
            <div className="text-3xl font-black text-emerald-400 font-mono">⭐ {score}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
            <button
              onClick={() => startGame(gameMode)}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> {t.retry}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" /> {t.shareScore}
            </button>
          </div>

          <button
            onClick={onOpenLeaderboard}
            className="mt-3 text-xs text-slate-400 hover:text-emerald-400 font-bold transition-all underline"
          >
            🏆 Liderlik Tablosunu Gör
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div
          className="w-full grid gap-2 sm:gap-2.5 my-2 max-w-xl mx-auto"
          style={{ gridTemplateColumns: "repeat(" + cols + ", minmax(0, 1fr))" }}
        >
          {cards.map((card) => {
            const isFlipped = card.isFlipped || card.isMatched;
            // Dinamik font boyutu: Az kart varken büyük font, kart sayısı çoğaldıkça orantılı font
            const totalCards = cards.length;
            const fontClass =
              totalCards <= 10
                ? "text-base sm:text-xl md:text-2xl font-black"
                : totalCards <= 18
                ? "text-sm sm:text-lg md:text-xl font-extrabold"
                : totalCards <= 26
                ? "text-xs sm:text-base md:text-lg font-bold"
                : "text-[11px] sm:text-sm md:text-base font-bold";

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={"aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 transform select-none p-1 text-center relative overflow-hidden " + (
                  card.isMatched
                    ? "bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-300 opacity-60 scale-95 pointer-events-none"
                    : isFlipped
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-100"
                    : "bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-md group"
                )}
              >
                {!isFlipped ? (
                  /* Kartın arkası: MinMat Logosu */
                  <div className="w-full h-full flex items-center justify-center p-2 opacity-85 group-hover:opacity-100 transition-opacity">
                    <img
                      src="/minmat/icon.png"
                      alt="MinMat"
                      className="w-full h-full object-contain pointer-events-none drop-shadow"
                    />
                  </div>
                ) : (
                  /* Kartın önü: Soru veya Sayı */
                  <span className={"tracking-tight leading-tight px-0.5 " + fontClass}>
                    {card.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Bottom Controls */}
      <div className="w-full flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80">
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
        >
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>{t.puanTablosu}</span>
        </button>

        {gameState === "playing" && (
          <button
            onClick={() => setGameState(gameState === "paused" ? "playing" : "paused")}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all"
          >
            {gameState === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
