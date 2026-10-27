"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";

export function WavingTurkishFlag() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isHome = pathname === "/";
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkActive = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const preview = params.get("preview") || "";
        if (
          preview.includes("29ekim") ||
          preview.includes("cumhuriyet") ||
          preview.includes("29_ekim")
        ) {
          setIsActive(true);
          return;
        }
      }

      const now = new Date();
      const nowTime = now.getTime();
      const start = new Date("2026-10-28T00:00:00+03:00").getTime();
      const end = new Date("2026-10-30T00:00:00+03:00").getTime();

      const isOct28Or29Local =
        now.getFullYear() === 2026 &&
        now.getMonth() === 9 &&
        (now.getDate() === 28 || now.getDate() === 29);

      setIsActive((nowTime >= start && nowTime < end) || isOct28Or29Local);
    };

    checkActive();
    const timer = setInterval(checkActive, 10000);
    return () => clearInterval(timer);
  }, [pathname]);

  if (!isActive) return null;

  const badgeText =
    locale === "tr"
      ? "1923 • Cumhuriyet"
      : locale === "de"
      ? "1923 • Republik"
      : locale === "fr"
      ? "1923 • République"
      : locale === "es"
      ? "1923 • República"
      : locale === "pt"
      ? "1923 • República"
      : locale === "it"
      ? "1923 • Repubblica"
      : locale === "ar"
      ? "1923 • الجمهورية"
      : locale === "ko"
      ? "1923 • 공화국"
      : "1923 • Republic";

  return (
    <div
      className={`fixed z-50 pointer-events-none select-none transition-all duration-300 ${
        isHome
          ? "top-4 left-4 sm:top-6 sm:left-6"
          : "top-3 left-3 md:top-[74px] md:left-5"
      }`}
      aria-label="Dalgalanan Türk Bayrağı - 29 Ekim Cumhuriyet Bayramı"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes trFlagWave {
              0% {
                transform: perspective(300px) rotateY(-6deg) skewY(-1.5deg) scaleX(1);
              }
              25% {
                transform: perspective(300px) rotateY(4deg) skewY(1.2deg) scaleX(0.98);
              }
              50% {
                transform: perspective(300px) rotateY(-4deg) skewY(2deg) scaleX(1.02);
              }
              75% {
                transform: perspective(300px) rotateY(6deg) skewY(-1deg) scaleX(0.99);
              }
              100% {
                transform: perspective(300px) rotateY(-6deg) skewY(-1.5deg) scaleX(1);
              }
            }
            @keyframes trFlagRipple {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
            .tr-waving-flag-cloth {
              transform-origin: left center;
              animation: trFlagWave 3.2s ease-in-out infinite;
            }
            .tr-waving-flag-shine {
              background: linear-gradient(
                105deg,
                rgba(0, 0, 0, 0.18) 0%,
                rgba(255, 255, 255, 0.16) 22%,
                rgba(0, 0, 0, 0.25) 45%,
                rgba(255, 255, 255, 0.14) 68%,
                rgba(0, 0, 0, 0.22) 90%,
                rgba(255, 255, 255, 0.1) 100%
              );
              background-size: 250% 100%;
              animation: trFlagRipple 3.2s ease-in-out infinite;
            }
          `,
        }}
      />

      <div className="flex flex-col items-start gap-1">
        <div className="relative flex items-start">
          {/* Golden-topped Flagpole */}
          <div className="relative flex flex-col items-center z-10">
            {/* Aleph / Finial */}
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            {/* Pole */}
            <div className="w-[2.5px] h-11 sm:h-12 bg-gradient-to-b from-amber-200 via-zinc-300 to-zinc-600 rounded-b-full shadow-sm" />
          </div>

          {/* Waving Flag Cloth */}
          <div className="tr-waving-flag-cloth relative -ml-[1px] mt-1 w-12 h-8 sm:w-14 sm:h-[38px] rounded-r-md overflow-hidden shadow-[0_0_20px_rgba(227,10,23,0.55)] border border-red-400/30">
            {/* Official Turkish Flag SVG */}
            <svg
              viewBox="0 0 1200 800"
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1200" height="800" fill="#E30A17" />
              {/* Outer White Crescent Circle */}
              <circle cx="425" cy="400" r="200" fill="#ffffff" />
              {/* Inner Red Crescent Cutout */}
              <circle cx="475" cy="400" r="160" fill="#E30A17" />
              {/* 5-Pointed White Star */}
              <polygon
                fill="#ffffff"
                points="583.334,400 764.235,458.779 652.431,304.894 652.431,495.106 764.235,341.221"
              />
            </svg>

            {/* 3D Cloth Ripple Overlay */}
            <div className="tr-waving-flag-shine absolute inset-0 pointer-events-none mix-blend-overlay" />
          </div>
        </div>

        {/* Tiny Commemorative Badge Under the Flag */}
        <div className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 backdrop-blur-md shadow-[0_0_12px_rgba(220,38,38,0.3)]">
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-red-200 uppercase whitespace-nowrap flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
