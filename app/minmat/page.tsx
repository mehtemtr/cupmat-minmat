"use client";

import React, { useState } from "react";
import { MinmatHeader } from "@/components/minmat/MinmatHeader";
import { MinmatGameBoard } from "@/components/minmat/MinmatGameBoard";
import { MinmatLeaderboardModal } from "@/components/minmat/MinmatLeaderboardModal";
import { useLocale } from "@/contexts/LocaleContext";
import { SignInButton, useAuth } from "@clerk/nextjs";

export default function MinMatPage() {
  const { isLoaded, userId } = useAuth();
  const { locale } = useLocale();
  const currentLang = locale || "tr";
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#04080e] text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Unified Card Container matching MinLan */}
        <div className="w-full max-w-2xl mx-auto bg-[#060b14] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center select-none">
          {/* Header */}
          <MinmatHeader lang={currentLang} />

          {/* Auth Banner for Unauthenticated Users */}
          {isLoaded && !userId && (
            <div className="w-full bg-slate-900 border border-emerald-500/30 text-emerald-200 text-xs p-3 rounded-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-500/5">
              <span className="text-center sm:text-left leading-relaxed">
                {getMinmatTranslation(currentLang).authBannerText}
              </span>
              <SignInButton mode="modal">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-1.5 px-4 rounded-xl transition-all whitespace-nowrap">
                  {getMinmatTranslation(currentLang).signInText}
                </button>
              </SignInButton>
            </div>
          )}

          {/* Interactive Game Board */}
          <MinmatGameBoard
            lang={currentLang}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        </div>

        {/* Leaderboard Modal */}
        <MinmatLeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          lang={currentLang}
        />
      </div>
    </div>
  );
}

