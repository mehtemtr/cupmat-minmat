"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

// Native-looking Safari Share Icon SVG
const SafariShareIcon = () => (
  <span className="inline-flex items-center justify-center bg-white/10 p-1.5 rounded-lg border border-white/10 mx-1">
    <svg
      className="h-4.5 w-4.5 text-blue-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="9" width="14" height="12" rx="2" ry="2" />
      <path d="M12 2v12M12 2L8 6M12 2l4 4" />
    </svg>
  </span>
);

// Native-looking Safari Add to Home Screen Icon SVG
const SafariAddIcon = () => (
  <span className="inline-flex items-center justify-center bg-white/10 p-1.5 rounded-lg border border-white/10 mx-1">
    <svg
      className="h-4.5 w-4.5 text-zinc-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  </span>
);

export default function IOSInstallPrompt() {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check local storage if dismissed recently (7 days expiration)
    const dismissedAt = localStorage.getItem("pwa-ios-prompt-dismissed");
    if (dismissedAt) {
      const parsed = parseInt(dismissedAt, 10);
      if (!isNaN(parsed) && Date.now() - parsed < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // 2. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 3. Detect iOS platform
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(userAgent) && !(window as any).MSStream;

    // 4. Detect Safari browser (exclude Chrome, Firefox, etc.)
    const isSafari =
      /Safari/.test(userAgent) &&
      !/CriOS/.test(userAgent) &&
      !/FxiOS/.test(userAgent) &&
      !/OPiOS/.test(userAgent) &&
      !/EdgiOS/.test(userAgent);

    // Only show if user is on iOS and Safari, and not in standalone
    if (isIOS && isSafari) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        // Trigger enter animation transition
        setTimeout(() => setIsVisible(true), 50);
      }, 4000); // Wait 4 seconds after page loads to be non-intrusive

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for exit animation to complete before unmounting
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem("pwa-ios-prompt-dismissed", Date.now().toString());
    }, 300000); // Dismiss for session, but save timestamp to prevent showing for 7 days
    
    // Save immediate timestamp
    localStorage.setItem("pwa-ios-prompt-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div
      className={`fixed bottom-6 left-4 right-4 z-[9999] mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#060b14]/95 p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl transition-all duration-500 ease-out sm:left-auto sm:right-6 ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
      }`}
    >
      {/* Top Banner Content */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/icon-192.png"
            alt="MahTEM App Logo"
            className="h-10 w-10 rounded-xl object-contain border border-white/10 bg-white/5 shadow-md shadow-emerald-500/10"
          />
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              {t("pwa.title")}
            </h4>
            <p className="text-[11px] text-emerald-400 font-semibold">statmatik.com</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition"
          aria-label={t("pwa.close")}
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Steps List */}
      <div className="mt-4 space-y-3 border-t border-white/5 pt-3.5 text-xs leading-relaxed text-zinc-300">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-extrabold text-emerald-400">
            1
          </span>
          <span className="flex items-center flex-wrap">
            {t("pwa.instructionShare")}&nbsp;
            <SafariShareIcon />
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-extrabold text-emerald-400">
            2
          </span>
          <span className="flex items-center flex-wrap">
            {t("pwa.instructionAdd")}&nbsp;
            <SafariAddIcon />
          </span>
        </div>
      </div>

      {/* Decorative Bouncing Arrow directing users to the Safari bottom menu */}
      <div className="mt-3.5 flex justify-center text-emerald-400/80 animate-bounce">
        <ChevronDown className="h-5 w-5" />
      </div>
    </div>
  );
}
