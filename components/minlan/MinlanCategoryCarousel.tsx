"use client";

import React, { useRef } from "react";
import { MinlanCategory } from "@/lib/minlan/types";
import { ChevronLeft, ChevronRight, Lock, Clock, Sparkles } from "lucide-react";

interface MinlanCategoryCarouselProps {
  categories: MinlanCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  userLevel: number;
}

export function MinlanCategoryCarousel({
  categories,
  selectedCategoryId,
  onSelectCategory,
  userLevel,
}: MinlanCategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full mb-8">
      {/* Title & Carousel Controls */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Kategoriler & Seviye Haritası</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all"
            title="Sola Kaydır"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all"
            title="Sağa Kaydır"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          // Tier 1: Open & Playable
          // Tier 2: Dynamic Countdown
          // Tier 3: Coming Soon
          // Tier 4: Secret Mystery ❓/🎁

          if (cat.tier === 4) {
            // Tier 4: Mystery Secret Box
            return (
              <div
                key={cat.id}
                className="flex-shrink-0 w-64 min-h-[140px] bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 opacity-60 flex flex-col justify-between select-none relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-2xl border border-slate-700/50">
                    {cat.icon || "🎁"}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                    GİZLİ KATEGORİ
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 tracking-wide mt-2">❓ Sürpriz Kutu</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Gelecekte Topluluk Hedefiyle Açılacak</p>
                </div>
              </div>
            );
          }

          if (cat.tier === 3) {
            // Tier 3: Coming Soon
            return (
              <div
                key={cat.id}
                className="flex-shrink-0 w-64 min-h-[140px] bg-slate-900/60 border border-slate-800 rounded-2xl p-4 opacity-75 flex flex-col justify-between select-none relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                    {cat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3" />
                    <span>YAKINDA</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mt-2">{cat.name_tr}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">İlerleyen Sezonlarda Yayında</p>
                </div>
              </div>
            );
          }

          if (cat.tier === 2) {
            // Tier 2: Dynamic Countdown
            return (
              <div
                key={cat.id}
                className="flex-shrink-0 w-64 min-h-[140px] bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between select-none shadow-lg relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl border border-indigo-500/30">
                    {cat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 rounded-md animate-pulse">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>SON 3 GÜN!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-200 mt-2">{cat.name_tr}</h3>
                  <p className="text-[11px] text-indigo-300/80 mt-1">Geri Sayım Devam Ediyor</p>
                </div>
              </div>
            );
          }

          // Tier 1: Check Round 4 completion requirement for previous category
          const indexInTier1 = categories.filter((c) => c.tier === 1).findIndex((c) => c.id === cat.id);
          const isLockedByLevel = indexInTier1 > 0 && userLevel < (indexInTier1 * 4 + 1);

          if (isLockedByLevel) {
            return (
              <div
                key={cat.id}
                className="flex-shrink-0 w-64 min-h-[140px] bg-slate-950/80 border border-slate-800 rounded-2xl p-4 opacity-75 flex flex-col justify-between select-none relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl opacity-60">
                    {cat.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>KİLİTLİ</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 mt-2">{cat.name_tr}</h3>
                  <p className="text-[11px] text-amber-400/90 font-semibold mt-1">
                    🔒 Önceki Kategoride Tur 4'ü Bitir
                  </p>
                </div>
              </div>
            );
          }

          // Open & Playable Category
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 w-64 min-h-[140px] rounded-2xl p-4 flex flex-col justify-between text-left transition-all duration-300 cursor-pointer relative overflow-hidden border ${
                isSelected
                  ? "bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-500/50"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform ${
                    isSelected ? "bg-cyan-500/20 border border-cyan-500/40 scale-110" : "bg-slate-800 border border-slate-700"
                  }`}
                >
                  {cat.icon}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-black border-cyan-400"
                      : "bg-slate-800 text-cyan-400 border-slate-700"
                  }`}
                >
                  AÇIK & OYNA
                </span>
              </div>

              <div>
                <h3
                  className={`text-base font-bold tracking-tight ${
                    isSelected ? "text-cyan-300 font-extrabold" : "text-white"
                  }`}
                >
                  {cat.name_tr}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Kart Eşle & Seviye Atla</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
