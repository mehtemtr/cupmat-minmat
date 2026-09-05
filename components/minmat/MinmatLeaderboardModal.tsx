"use client";

import React, { useState, useEffect } from "react";
import { MinmatMode, MinmatLeaderboardScore } from "@/lib/minmat/types";
import { getMinmatTranslation } from "@/lib/minmat/i18n";
import { Trophy, X, Medal } from "lucide-react";

interface MinmatLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  currentScore?: number;
  initialMode?: MinmatMode;
}

export function MinmatLeaderboardModal({
  isOpen,
  onClose,
  lang = "tr",
  currentScore,
  initialMode = "add",
}: MinmatLeaderboardModalProps) {
  const t = getMinmatTranslation(lang);
  const [filterMode, setFilterMode] = useState<string>("all");
  const [scores, setScores] = useState<MinmatLeaderboardScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadScores() {
      setLoading(true);
      try {
        const catMap: Record<string, string> = {
          add: "topla",
          sub: "cikar",
          mul: "carp",
          div: "bol",
          mix: "karisik",
        };
        const query = filterMode !== "all" ? "?category=" + (catMap[filterMode] || filterMode) : "";
        const res = await fetch("/api/minmat/scores" + query + (query ? "&" : "?") + "t=" + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped: MinmatLeaderboardScore[] = data.map((entry: any) => {
              const reverseMap: Record<string, MinmatMode> = {
                topla: "add",
                add: "add",
                cikar: "sub",
                sub: "sub",
                carp: "mul",
                mul: "mul",
                bol: "div",
                div: "div",
                karisik: "mix",
                mix: "mix",
              };
              return {
                name: entry.nickname || entry.name || "Kullanıcı",
                score: entry.high_score ?? entry.score ?? 0,
                level: entry.level ?? (Math.floor((entry.high_score || 0) / 10)),
                mode: reverseMap[entry.category] || (reverseMap[entry.mode] || "mix"),
                date: new Date(entry.updated_at || Date.now()).toLocaleDateString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                timestamp: new Date(entry.updated_at || Date.now()).getTime(),
              };
            });
            setScores(mapped);
          }
        }
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadScores();
  }, [isOpen, filterMode]);

  if (!isOpen) return null;

  const modeLabels: Record<string, string> = {
    all: t.all,
    add: t.shortAdd,
    sub: t.shortSub,
    mul: t.shortMul,
    div: t.shortDiv,
    mix: t.shortMix,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t.puanTablosu}</h3>
              <p className="text-xs text-slate-400">{t.leaderboardSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 my-4 justify-center">
          {(["all", "add", "sub", "mul", "div", "mix"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={"px-3 py-1.5 rounded-xl text-xs font-bold transition-all border " + (
                filterMode === m
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
            >
              {m === "add" && "➕ "}
              {m === "sub" && "➖ "}
              {m === "mul" && "✖️ "}
              {m === "div" && "➗ "}
              {m === "mix" && "🎲 "}
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">{t.scoresLoading}</span>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              {t.noScores}
            </div>
          ) : (
            scores.map((s, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={idx}
                  className={"flex items-center justify-between p-3 rounded-2xl border transition-all text-xs " + (
                    isTop1
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : isTop2
                      ? "bg-slate-300/10 border-slate-400/30 text-slate-200"
                      : isTop3
                      ? "bg-amber-700/10 border-amber-700/30 text-amber-300"
                      : "bg-slate-950/40 border-slate-800/80 text-slate-300"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 text-center font-black">
                      {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : idx + 1}
                    </span>
                    <div className="truncate font-bold text-white text-xs">{s.name}</div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[11px] text-slate-400 px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800">
                      {t.round} {s.level}
                    </span>
                    <span className="text-[11px] text-slate-400 px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800">
                      {modeLabels[s.mode] || s.mode}
                    </span>
                    <span className="font-black text-emerald-400 text-sm">⭐ {s.score}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
