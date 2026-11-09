"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";

export function WavingTurkishFlag() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isHome = pathname === "/";
  const [mode, setMode] = useState<"none" | "29ekim" | "10kasim">("none");

  useEffect(() => {
    const checkActive = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const preview = params.get("preview") || "";
        if (
          preview.includes("10kasim") ||
          preview.includes("10_kasim") ||
          preview.includes("ataturk")
        ) {
          setMode("10kasim");
          return;
        }
        if (
          preview.includes("29ekim") ||
          preview.includes("cumhuriyet") ||
          preview.includes("29_ekim")
        ) {
          setMode("29ekim");
          return;
        }
      }

      const now = new Date();
      const nowTime = now.getTime();

      // 10 Kasım Atatürk'ü Anma Günü: 9 Kasım akşamından 11 Kasım sabahına kadar tüm sayfalarda gün boyu
      const nov10Start = new Date("2026-11-09T18:00:00+03:00").getTime();
      const nov10End = new Date("2026-11-11T00:00:00+03:00").getTime();
      const isNov10Local =
        now.getFullYear() === 2026 &&
        now.getMonth() === 10 &&
        (now.getDate() === 9 || now.getDate() === 10);

      if ((nowTime >= nov10Start && nowTime < nov10End) || isNov10Local) {
        setMode("10kasim");
        return;
      }

      // 29 Ekim Cumhuriyet Bayramı
      const oct29Start = new Date("2026-10-28T00:00:00+03:00").getTime();
      const oct29End = new Date("2026-10-30T00:00:00+03:00").getTime();
      const isOct28Or29Local =
        now.getFullYear() === 2026 &&
        now.getMonth() === 9 &&
        (now.getDate() === 28 || now.getDate() === 29);

      if ((nowTime >= oct29Start && nowTime < oct29End) || isOct28Or29Local) {
        setMode("29ekim");
        return;
      }

      setMode("none");
    };

    checkActive();
    const timer = setInterval(checkActive, 10000);
    return () => clearInterval(timer);
  }, [pathname]);

  if (mode === "none") return null;

  const isNov10 = mode === "10kasim";

  const badgeText = isNov10
    ? locale === "tr"
      ? "1881–193∞ • Atatürk"
      : "1881–193∞ • Atatürk"
    : locale === "tr"
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
        isNov10
          ? isHome
            ? "top-16 right-4 sm:top-20 sm:right-6"
            : "top-3 right-3 md:top-[74px] md:right-6"
          : isHome
          ? "top-4 left-4 sm:top-6 sm:left-6"
          : "top-3 left-3 md:top-[74px] md:left-5"
      }`}
      aria-label={
        isNov10
          ? "Atatürklü Türk Bayrağı - 10 Kasım Atatürk'ü Anma Günü"
          : "Dalgalanan Türk Bayrağı - 29 Ekim Cumhuriyet Bayramı"
      }
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

      <div className={`flex flex-col ${isNov10 ? "items-end" : "items-start"} gap-1`}>
        <div className="relative flex items-start">
          {/* Golden-topped Flagpole */}
          <div className="relative flex flex-col items-center z-10">
            {/* Aleph / Finial */}
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            {/* Pole */}
            <div
              className={`w-[2.5px] ${
                isNov10 ? "h-14 sm:h-16" : "h-11 sm:h-12"
              } bg-gradient-to-b from-amber-200 via-zinc-300 to-zinc-600 rounded-b-full shadow-sm`}
            />
          </div>

          {/* Waving Flag Cloth (Slightly lowered / respectful position for 10 Kasım with Atatürk silhouette & Kocatepe/portrait emblem) */}
          <div
            className={`tr-waving-flag-cloth relative -ml-[1px] ${
              isNov10
                ? "mt-2.5 w-14 h-9 sm:w-16 sm:h-[42px] shadow-[0_0_24px_rgba(227,10,23,0.65)] border border-amber-400/40"
                : "mt-1 w-12 h-8 sm:w-14 sm:h-[38px] shadow-[0_0_20px_rgba(227,10,23,0.55)] border border-red-400/30"
            } rounded-r-md overflow-hidden`}
          >
            {isNov10 ? (
              /* Atatürklü Türk Bayrağı (Turkish Flag with Noble Atatürk Silhouette & Crescent-Star) */
              <svg
                viewBox="0 0 1200 800"
                className="w-full h-full object-cover"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="trRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E30A17" />
                    <stop offset="65%" stopColor="#c80814" />
                    <stop offset="100%" stopColor="#99050e" />
                  </linearGradient>
                  <linearGradient id="goldSilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fcd34d" />
                  </linearGradient>
                </defs>
                <rect width="1200" height="800" fill="url(#trRedGrad)" />

                {/* Subtle Sunburst / Vision Rays behind Crescent */}
                <circle cx="360" cy="400" r="310" fill="#ffffff" fillOpacity="0.06" />

                {/* Outer White Crescent Circle */}
                <circle cx="355" cy="400" r="185" fill="#ffffff" />
                {/* Inner Red Crescent Cutout */}
                <circle cx="402" cy="400" r="148" fill="#d40915" />
                {/* 5-Pointed White Star */}
                <polygon
                  fill="#ffffff"
                  points="500,400 660,452 561,316 561,484 660,348"
                />

                {/* Iconic Atatürk Profile & Kocatepe Silhouette on the Right Side of the Flag */}
                <g transform="translate(690, 95)">
                  {/* Subtle Golden Halo behind Atatürk */}
                  <circle cx="215" cy="300" r="235" fill="#fbbf24" fillOpacity="0.12" />
                  {/* Noble Atatürk Side Profile & Kalpak/Coat Silhouette */}
                  <path
                    fill="url(#goldSilGrad)"
                    d="M170,95 C205,75 265,78 295,108 C318,132 322,168 315,198 L332,224 C336,232 330,240 320,242 L312,244 C312,258 316,268 308,278 C302,285 292,286 290,295 C288,308 294,320 278,330 C264,338 242,336 232,348 L245,385 L355,435 C390,455 415,510 425,610 L35,610 C45,505 72,450 112,428 L168,395 L162,340 C138,315 128,270 132,220 C135,165 142,112 170,95 Z"
                    opacity="0.96"
                  />
                  {/* Collar & Tie Accent */}
                  <polygon fill="#99050e" points="205,395 238,395 222,475" opacity="0.75" />
                  {/* K. Atatürk Signature Inspired Golden Line */}
                  <path
                    d="M95,555 Q165,525 225,548 T345,530"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </g>

                {/* Black Mourning Ribbon (Siyah Kurdele) at Top-Right Corner of Flag */}
                <path
                  d="M1070,0 L1200,0 L1200,130 Z"
                  fill="#09090b"
                  fillOpacity="0.88"
                />
                <line
                  x1="1070"
                  y1="0"
                  x2="1200"
                  y2="130"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeOpacity="0.6"
                />
              </svg>
            ) : (
              /* Standard Official Turkish Flag SVG */
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
            )}

            {/* 3D Cloth Ripple Overlay */}
            <div className="tr-waving-flag-shine absolute inset-0 pointer-events-none mix-blend-overlay" />
          </div>
        </div>

        {/* Commemorative Badge Under the Flag */}
        <div
          className={`px-2.5 py-0.5 rounded-full backdrop-blur-md ${
            isNov10
              ? "bg-zinc-950/90 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              : "bg-red-950/80 border border-red-500/40 shadow-[0_0_12px_rgba(220,38,38,0.3)]"
          }`}
        >
          <span
            className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase whitespace-nowrap flex items-center gap-1 ${
              isNov10 ? "text-amber-200" : "text-red-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-ping ${
                isNov10 ? "bg-amber-400" : "bg-red-500"
              }`}
            />
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
