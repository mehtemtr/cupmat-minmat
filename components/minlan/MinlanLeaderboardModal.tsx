"use client";

import React, { useState } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/minlan/types";
import { MOCK_MINLAN_CATEGORIES } from "@/lib/minlan/mock-data";
import { Trophy, X, Filter, Medal, Award } from "lucide-react";

interface MinlanLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MinlanLeaderboardModal({ isOpen, onClose }: MinlanLeaderboardModalProps) {
  const [nativeFilter, setNativeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  if (!isOpen) return null;

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const timestamp = Date.now();
        const res = await fetch(
          `/api/minlan/leaderboard?native=${nativeFilter}&target=${targetFilter}&category=${categoryFilter}&t=${timestamp}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, [isOpen, nativeFilter, targetFilter, categoryFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">MinLan Liderlik Tablosu</h3>
              <p className="text-xs text-slate-400">3 Filtreli Şampiyonlar Sıralaması</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          {/* Filter 1: Native Lang */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">1. Dil (Kaynak):</label>
            <select
              value={nativeFilter}
              onChange={(e) => setNativeFilter(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">🌐 Tüm Diller</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Target Lang */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">2. Dil (Hedef):</label>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full bg-slate-900 text-cyan-400 text-xs font-bold px-3 py-2 rounded-xl border border-cyan-500/40 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">🌐 Tüm Hedef Diller</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Category */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Kategori:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/40 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">✨ Tüm Kategoriler</option>
              {MOCK_MINLAN_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name_tr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-y-auto flex-1 scrollbar-none pr-1">
          <div className="space-y-2">
            {loading ? (
               <div className="p-8 text-center text-slate-400">Yükleniyor...</div>
            ) : (!leaderboard || leaderboard.length === 0) ? (
               <div className="p-8 text-center text-slate-400">Bu filtrede henüz puan yok. İlk sen ol!</div>
            ) : leaderboard.map((item, idx) => {
              const safeItem = item || {};
              const nativeObj = SUPPORTED_LANGUAGES.find((l) => l.code === safeItem.native);
              const targetObj = SUPPORTED_LANGUAGES.find((l) => l.code === safeItem.target);

              return (
                <div
                  key={safeItem.rank || idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    safeItem.rank === 1
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : safeItem.rank === 2
                      ? "bg-slate-800/80 border-slate-700 text-slate-200"
                      : safeItem.rank === 3
                      ? "bg-amber-900/20 border-amber-800/40 text-amber-400"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-sm">
                      {safeItem.rank === 1 ? (
                        <Medal className="w-5 h-5 text-amber-400" />
                      ) : safeItem.rank === 2 ? (
                        <Award className="w-5 h-5 text-slate-300" />
                      ) : safeItem.rank === 3 ? (
                        <Award className="w-5 h-5 text-amber-600" />
                      ) : (
                        safeItem.rank || "-"
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">{safeItem.name || "Bilinmeyen Oyuncu"}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{nativeObj?.flag || "🏳️"} → {targetObj?.flag || "🏳️"}</span>
                        <span>•</span>
                        <span>{safeItem.category || "Kategori Yok"}</span>
                        {safeItem.date && (
                          <>
                            <span>•</span>
                            <span>{new Date(safeItem.date).toLocaleDateString("tr-TR")} {new Date(safeItem.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-black text-base text-amber-400">
                    {Number(safeItem.score || 0).toLocaleString("tr-TR")} P
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
