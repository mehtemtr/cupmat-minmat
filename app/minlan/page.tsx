"use client";

import React, { useState, useEffect } from "react";
import { MinlanHeader } from "@/components/minlan/MinlanHeader";
import { MinlanGameBoard } from "@/components/minlan/MinlanGameBoard";
import { MinlanLeaderboardModal } from "@/components/minlan/MinlanLeaderboardModal";
import { LanguageCode, MinlanCategory, MinlanCommunityStats } from "@/lib/minlan/types";
import { MOCK_MINLAN_CATEGORIES, MOCK_COMMUNITY_STATS } from "@/lib/minlan/mock-data";
import { Sparkles, Trophy, ShieldCheck, HeartHandshake } from "lucide-react";

import { useLocale } from "@/contexts/LocaleContext";

export default function MinlanPage() {
  const { locale } = useLocale();
  const nativeLang: LanguageCode = (locale as LanguageCode) || "tr";
  const [targetLang, setTargetLang] = useState<LanguageCode>("en");
  const [categories, setCategories] = useState<MinlanCategory[]>(MOCK_MINLAN_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-1");
  const [communityStats, setCommunityStats] = useState<MinlanCommunityStats>(MOCK_COMMUNITY_STATS);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [userLevel] = useState<number>(1);


  // Fetch Categories and Community Stats
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/minlan/categories");
        const data = await res.json();
        if (data.success) {
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.communityStats) {
            setCommunityStats(data.communityStats);
          }
        }
      } catch (err) {
        console.warn("Using mock categories & stats:", err);
      }
    }

    loadData();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Callback when a game round is completed to record match progress & update local community bar
  const handleRecordProgress = async (matches: number, score: number) => {
    try {
      // Optimistically update local community stats
      setCommunityStats((prev) => ({
        ...prev,
        total_card_matches: prev.total_card_matches + matches,
      }));

      // Call API
      await fetch("/api/minlan/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchesEarned: matches,
          scoreEarned: score,
          categoryId: selectedCategoryId,
        }),
      });
    } catch (e) {
      console.error("Progress save error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#04080e] text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
      {/* Background Neon Accent Glows */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Single Unified Card Container (One Single Box Layout matching MinMat) */}
        <div className="w-full max-w-xl mx-auto bg-[#060b14] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center select-none">
          {/* 1. Header with Centered Brand Title, Slogan & Compact Community Progress */}
          <MinlanHeader
            nativeLang={nativeLang}
            communityStats={communityStats}
          />

          {/* 2. Interactive Memory Game Board */}
          <MinlanGameBoard
            categoryId={selectedCategoryId}
            categoryName={selectedCategory.name_tr}
            categories={categories}
            nativeLang={nativeLang}
            targetLang={targetLang}
            communityStats={communityStats}
            onTargetLangChange={setTargetLang}
            onSelectCategory={setSelectedCategoryId}
            onRecordProgress={handleRecordProgress}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        </div>

        {/* 4. 3-Filter Leaderboard Modal */}
        <MinlanLeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      </div>
    </div>
  );
}
