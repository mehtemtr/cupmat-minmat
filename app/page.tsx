"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";
import { locales, type Locale } from "@/lib/i18n/types";
import { Trophy, Sparkles, ChevronRight, Calculator, Activity, Globe } from "lucide-react";

function BirthdayCake() {
  const [isBlownOut, setIsBlownOut] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isBlownOut) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isBlownOut]);

  // Automatic blow out after 5.5 seconds for demo, or click to blow out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlownOut(true);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBlownOut(false);
    setShowConfetti(false);
    // Restart automatic blowout
    setTimeout(() => setIsBlownOut(true), 5500);
  };

  return (
    <div 
      onClick={() => setIsBlownOut(true)}
      className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[5/4] max-w-[380px] rounded-2xl overflow-hidden border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.25)] bg-[#070b13] flex flex-col items-center justify-center p-4 cursor-pointer select-none group/cake transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0% { transform: scale(1) rotate(-1.5deg); filter: drop-shadow(0 0 3px #f59e0b); }
          50% { transform: scale(1.15) rotate(2deg) translateY(-1px); filter: drop-shadow(0 0 6px #f97316); }
          100% { transform: scale(1) rotate(-0.5deg); filter: drop-shadow(0 0 3px #ef4444); }
        }
        .flame {
          animation: flicker 0.6s infinite ease-in-out;
          transform-origin: bottom center;
        }
        @keyframes puff {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(1.8) translateY(-25px); opacity: 0; }
        }
        .smoke {
          animation: puff 0.9s forwards ease-out;
          transform-origin: center;
        }
        @keyframes float-confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 7px;
          height: 7px;
          animation: float-confetti 3.5s infinite linear;
        }
      `}} />

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {[...Array(18)].map((_, i) => {
            const colors = ['bg-pink-500', 'bg-purple-500', 'bg-yellow-400', 'bg-sky-400', 'bg-emerald-400', 'bg-orange-400'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const style = {
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2.5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            };
            return <div key={i} className={`confetti-piece rounded-sm ${randomColor}`} style={style} />;
          })}
        </div>
      )}

      {/* Wind / Blow animation overlay */}
      {!isBlownOut && (
        <div className="absolute top-4 right-4 text-zinc-400/40 text-lg font-bold animate-pulse z-10 pointer-events-none flex items-center gap-1">
          <span>🌬️</span>
          <span className="text-[10px] tracking-widest uppercase font-black">Üfleniyor...</span>
        </div>
      )}

      {/* Main SVG Graphic */}
      <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] z-10">
        {/* Cake Stand */}
        <path d="M 40 160 L 160 160 L 150 170 L 50 170 Z" fill="#1e293b" />
        <rect x="95" y="170" width="10" height="15" fill="#334155" />
        <ellipse cx="100" cy="185" rx="35" ry="5" fill="#1e293b" />

        {/* Cake Tier 1 (Base) */}
        <rect x="50" y="110" width="100" height="50" rx="6" fill="#311042" />
        {/* Cream / Drip on Tier 1 */}
        <path d="M 50 115 Q 60 123 70 115 Q 80 123 90 115 Q 100 123 110 115 Q 120 123 130 115 Q 140 123 150 115 L 150 110 L 50 110 Z" fill="#9d174d" />

        {/* Cake Tier 2 (Top) */}
        <rect x="65" y="70" width="70" height="40" rx="4" fill="#4c1d95" />
        {/* Cream / Drip on Tier 2 */}
        <path d="M 65 74 Q 72 80 79 74 Q 86 80 93 74 Q 100 80 107 74 Q 114 80 121 74 Q 128 80 135 74 L 135 70 L 65 70 Z" fill="#be185d" />

        {/* 12 Candles */}
        {[
          { x: 72, h: 22 }, { x: 77, h: 20 }, { x: 82, h: 24 }, { x: 87, h: 21 },
          { x: 92, h: 23 }, { x: 97, h: 20 }, { x: 102, h: 20 }, { x: 107, h: 23 },
          { x: 112, h: 21 }, { x: 117, h: 24 }, { x: 122, h: 20 }, { x: 127, h: 22 }
        ].map((c, idx) => {
          const candleY = 70 - c.h;
          const candleColor = idx % 3 === 0 ? "#facc15" : idx % 3 === 1 ? "#38bdf8" : "#fb7185";
          return (
            <g key={idx}>
              {/* Candle Body */}
              <rect x={c.x} y={candleY} width="3.2" height={c.h} fill={candleColor} rx="1" />
              {/* Wick */}
              <line x1={c.x + 1.6} y1={candleY} x2={c.x + 1.6} y2={candleY - 3} stroke="#94a3b8" strokeWidth="1" />
              
              {/* Flame or Smoke */}
              {!isBlownOut ? (
                // Flame
                <path 
                  d={`M ${c.x + 1.6} ${candleY - 3} C ${c.x - 1.4} ${candleY - 7} ${c.x + 4.6} ${candleY - 7} ${c.x + 1.6} ${candleY - 12} C ${c.x - 1.4} ${candleY - 7} ${c.x + 4.6} ${candleY - 7} ${c.x + 1.6} ${candleY - 3}`}
                  fill="#f59e0b"
                  className="flame"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                />
              ) : (
                // Smoke trail (appears once when blown out)
                <path
                  d={`M ${c.x + 1.6} ${candleY - 3} Q ${c.x - 2} ${candleY - 8} ${c.x + 2} ${candleY - 13}`}
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  className="smoke"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Info / Reset Button */}
      <div className="absolute bottom-3 left-0 right-0 text-center z-20">
        {isBlownOut ? (
          <button 
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/40 transition active:scale-95 font-semibold"
          >
            <span>🔄</span>
            <span>Tekrar Üfle</span>
          </button>
        ) : (
          <span className="text-[9px] text-zinc-400/50 uppercase tracking-widest font-black animate-pulse">
            Söndürmek için pastaya tıkla! 👆
          </span>
        )}
      </div>
    </div>
  );
}

export default function EntryPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const [activeBanner, setActiveBanner] = useState<"none" | "19mayis" | "birthday" | "kurban">("none");

  useEffect(() => {
    const checkDate = () => {
      // Check query parameter for easy testing: ?preview=birthday, ?preview=19mayis, ?preview=kurban
      const urlParams = new URLSearchParams(window.location.search);
      const preview = urlParams.get("preview");
      if (preview === "birthday") {
        setActiveBanner("birthday");
        return;
      }
      if (preview === "19mayis") {
        setActiveBanner("19mayis");
        return;
      }
      if (preview === "kurban") {
        setActiveBanner("kurban");
        return;
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 4 = May (0-indexed)
      const date = now.getDate();

      if (year === 2026 && month === 4 && date === 19) {
        setActiveBanner("19mayis");
      } else if (year === 2026 && month === 4 && date === 20) {
        setActiveBanner("birthday");
      } else if (year === 2026 && month === 4 && date >= 27 && date <= 30) {
        setActiveBanner("kurban");
      } else {
        setActiveBanner("none");
      }
    };
    checkDate();
    const interval = setInterval(checkDate, 20000);
    return () => clearInterval(interval);
  }, []);

  const toggleLocale = () => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04080e] selection:bg-emerald-500/30">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      
      {/* Floating Language Toggle */}
      <div className="fixed right-6 top-6 z-50">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-[#060b14]/80 px-4 py-2 text-sm font-bold text-zinc-200 backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
        >
          <Globe className="h-4 w-4 text-emerald-400" />
          <span className="uppercase">{locale}</span>
        </button>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-20">

        <header className="mb-16 w-full">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t("hero.mainBadge")}
            </div>
          </div>
          
          <div className="relative flex overflow-x-hidden border-y border-white/5 bg-white/[0.02] py-6">
            <div className="animate-marquee flex whitespace-nowrap gap-12">
              {[1, 2, 3, 4].map((i) => (
                <h1 key={i} className="text-2xl font-black tracking-tight text-white uppercase sm:text-4xl">
                  {t("hero.slogan").split("statmatik.com")[0]}
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    statmatik.com {t("hero.slogan").split("statmatik.com")[1]}
                  </span>
                </h1>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Celebrations Section */}
        {activeBanner === "kurban" && (
          <div className="w-full mb-12 relative group rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-[#060b14]/85 to-zinc-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:border-emerald-500/30">
            
            {/* Custom Animations for Eid */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes float-eid {
                0% { transform: translateY(80px) scale(0.6) rotate(0deg); opacity: 0; }
                15% { opacity: 0.5; }
                85% { opacity: 0.5; }
                100% { transform: translateY(-280px) scale(1.1) rotate(15deg); opacity: 0; }
              }
              .eid-star-1 { animation: float-eid 9s infinite ease-in-out; left: 15%; animation-delay: 0s; }
              .eid-star-2 { animation: float-eid 12s infinite ease-in-out; left: 35%; animation-delay: 3.5s; }
              .eid-star-3 { animation: float-eid 8s infinite ease-in-out; left: 55%; animation-delay: 1.2s; }
              .eid-star-4 { animation: float-eid 10s infinite ease-in-out; left: 78%; animation-delay: 5s; }
            `}} />

            {/* Eid Particle elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <span className="absolute text-2xl eid-star-1 select-none">✨</span>
              <span className="absolute text-xl eid-star-2 select-none">🌙</span>
              <span className="absolute text-2xl eid-star-3 select-none">🕌</span>
              <span className="absolute text-xl eid-star-4 select-none">✨</span>
            </div>

            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-600 to-amber-500 opacity-10 blur transition duration-500 group-hover:opacity-15" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 z-10">
              
              {/* Celebration Graphic */}
              <div className="w-full md:w-[42%] flex justify-center relative">
                <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[5/4] max-w-[380px] rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-[#070b13] flex flex-col items-center justify-center p-4 transition-all duration-300">
                  {/* Beautiful Glowing Mosque & Crescent Moon Graphic */}
                  <svg viewBox="0 0 200 200" className="w-[85%] h-[85%]">
                    {/* Crescent Moon */}
                    <path d="M 120 40 A 50 50 0 1 0 160 110 A 42 42 0 1 1 120 40 Z" fill="#fbbf24" filter="drop-shadow(0 0 8px rgba(251,191,36,0.5))" />
                    
                    {/* Stars */}
                    <circle cx="60" cy="50" r="1.5" fill="#fff" opacity="0.8" />
                    <circle cx="85" cy="35" r="2" fill="#fff" filter="drop-shadow(0 0 2px #fff)" />
                    <circle cx="150" cy="30" r="1.5" fill="#fff" opacity="0.5" />
                    <circle cx="45" cy="80" r="2.5" fill="#fbbf24" filter="drop-shadow(0 0 3px #fbbf24)" />
                    
                    {/* Mosque Dome Base */}
                    <rect x="50" y="140" width="100" height="30" rx="3" fill="#047857" />
                    {/* Mosque Main Dome */}
                    <path d="M 65 140 C 65 95 135 95 135 140 Z" fill="#059669" />
                    {/* Dome Pinnacle */}
                    <line x1="100" y1="95" x2="100" y2="85" stroke="#fbbf24" strokeWidth="2" />
                    <path d="M 98 85 L 102 85 L 100 81 Z" fill="#fbbf24" />
                    
                    {/* Minaret Left */}
                    <rect x="35" y="110" width="12" height="60" rx="1" fill="#065f46" />
                    <path d="M 32 110 L 50 110 L 41 98 Z" fill="#fbbf24" />
                    
                    {/* Minaret Right */}
                    <rect x="153" y="110" width="12" height="60" rx="1" fill="#065f46" />
                    <path d="M 150 110 L 168 110 L 159 98 Z" fill="#fbbf24" />
                    
                    {/* Arch Door */}
                    <path d="M 90 170 C 90 152 110 152 110 170 Z" fill="#064e3b" />
                  </svg>
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-[3px] bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                      KURBAN BAYRAMI
                    </span>
                  </div>
                </div>
              </div>

              {/* Celebration Message */}
              <div className="w-full md:w-[58%] text-center md:text-left flex flex-col justify-center">
                <span className="inline-flex self-center md:self-start items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-400 tracking-wider uppercase mb-3.5 select-none animate-pulse">
                  {"🕌 BAYRAMINIZ KUTLU OLSUN"}
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                  {locale === "tr" ? (
                    "Kurban Bayramınız Mübarek Olsun! 💫"
                  ) : (
                    "Eid al-Adha Mubarak! 💫"
                  )}
                </h2>

                <p className="text-base sm:text-lg text-zinc-200 leading-relaxed mb-4 max-w-[580px]">
                  {locale === "tr" ? (
                    "Kurban Bayramı'nın ülkemize, milletimize ve tüm insanlığa barış, huzur, sağlık ve mutluluk getirmesini dileriz. Sevdiklerinizle birlikte nice mutlu ve huzurlu bayramlara!"
                  ) : (
                    "We wish Eid al-Adha brings peace, serenity, health, and happiness to you, your family, and all humanity. Have a blessed and joyful holiday with your loved ones!"
                  )}
                </p>

                {/* Islamic/Tradition quote or message */}
                <div className="relative border-l-2 border-amber-500/60 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl max-w-[580px] text-left">
                  <p className="text-xs sm:text-sm font-semibold italic text-amber-300 leading-snug">
                    {locale === "tr" ? (
                      "\"Bayramlar, kırgınlıkların unutulduğu, sevgi ve saygının katlanarak çoğaldığı en özel günlerdir. Paylaştıkça çoğalan kurban ibadetinin kabul olmasını dileriz.\""
                    ) : (
                      "\"Holidays are the most special days when resentments are forgotten, and love and respect multiply. We wish that the sacrifices shared bring blessing and unity.\""
                    )}
                  </p>
                  <span className="block text-[10px] font-black tracking-widest text-amber-400 uppercase mt-2">
                    {"— Statmatik Ekibi"}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {activeBanner === "19mayis" && (
          <div className="w-full mb-12 relative group rounded-3xl overflow-hidden border border-red-500/20 bg-gradient-to-r from-red-950/20 via-[#060b14]/80 to-zinc-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:border-red-500/30">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-red-600 to-amber-600 opacity-10 blur transition duration-500 group-hover:opacity-15" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              
              {/* Celebration Image */}
              <div className="w-full md:w-[42%] flex justify-center relative">
                <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[5/4] max-w-[380px] rounded-2xl overflow-hidden border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.25)] bg-zinc-900 group-hover:scale-[1.01] transition-transform duration-300">
                  <img
                    src="/19_mayis_celebration.png"
                    alt="19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı"
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Celebration Message */}
              <div className="w-full md:w-[58%] text-center md:text-left flex flex-col justify-center">
                <span className="inline-flex self-center md:self-start items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-black text-red-400 tracking-wider uppercase mb-3.5 select-none animate-pulse">
                  {"🇹🇷 19 MAYIS ÖZEL"}
                </span>
                
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
                  {locale === "tr" ? (
                    <>{`19 Mayıs Atatürk'ü Anma,`}<br />{`Gençlik ve Spor Bayramı Kutlu Olsun!`}</>
                  ) : (
                    <>{`Commemoration of Atatürk,`}<br />{`Youth and Sports Day Happy May 19th!`}</>
                  )}
                </h2>

                <p className="text-sm text-zinc-300 leading-relaxed mb-4 max-w-[580px]">
                  {locale === "tr" ? (
                    "Gazi Mustafa Kemal Atatürk'ün Samsun'a çıkışıyla yaktığı bağımsızlık meşalesini bugün de aynı coşku ve inançla taşıyoruz. Atatürk'ün Türk gençliğine armağan ettiği bu kutlu bayram hepimize kutlu olsun!"
                  ) : (
                    "We carry the independence torch lit by Gazi Mustafa Kemal Atatürk with his landing in Samsun, with the same enthusiasm and faith today. Happy May 19th to all of us!"
                  )}
                </p>

                {/* Quote Block */}
                <div className="relative border-l-2 border-amber-500/60 pl-4 py-1.5 bg-amber-500/5 rounded-r-xl max-w-[580px] text-left">
                  <p className="text-xs sm:text-sm font-medium italic text-amber-300 leading-snug">
                    {"\"Ey Türk gençliği! Birinci vazifen; Türk istiklalini, Türk cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir. Muhtaç olduğun kudret, damarlarındaki asil kanda mevcuttur!\""}
                  </p>
                  <span className="block text-[10px] font-black tracking-widest text-amber-400 uppercase mt-2">
                    {"— MUSTAFA KEMAL ATATÜRK"}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {activeBanner === "birthday" && (
          <div className="w-full mb-12 relative group rounded-3xl overflow-hidden border border-pink-500/20 bg-gradient-to-r from-purple-950/20 via-[#060b14]/85 to-zinc-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:border-pink-500/30">
            
            {/* Custom Animations for Birthday Balloons */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes float-balloon {
                0% { transform: translateY(150px) scale(0.6) rotate(0deg); opacity: 0; }
                15% { opacity: 0.6; }
                85% { opacity: 0.6; }
                100% { transform: translateY(-380px) scale(1.1) rotate(25deg); opacity: 0; }
              }
              .balloon-1 { animation: float-balloon 8s infinite ease-in-out; left: 10%; animation-delay: 0s; }
              .balloon-2 { animation: float-balloon 11s infinite ease-in-out; left: 25%; animation-delay: 3s; }
              .balloon-3 { animation: float-balloon 7s infinite ease-in-out; left: 48%; animation-delay: 1s; }
              .balloon-4 { animation: float-balloon 9s infinite ease-in-out; left: 72%; animation-delay: 4.5s; }
              .balloon-5 { animation: float-balloon 12s infinite ease-in-out; left: 88%; animation-delay: 1.5s; }
            `}} />

            {/* Balloon Particles container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <span className="absolute text-3xl balloon-1 select-none">🎈</span>
              <span className="absolute text-4xl balloon-2 select-none">🎁</span>
              <span className="absolute text-3xl balloon-3 select-none">🎈</span>
              <span className="absolute text-2xl balloon-4 select-none">✨</span>
              <span className="absolute text-4xl balloon-5 select-none">🎈</span>
            </div>

            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 opacity-10 blur transition duration-500 group-hover:opacity-15" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 z-10">
              
              {/* Celebration Interactive Component */}
              <div className="w-full md:w-[42%] flex justify-center relative">
                <BirthdayCake />
              </div>

              {/* Celebration Message */}
              <div className="w-full md:w-[58%] text-center md:text-left flex flex-col justify-center">
                <span className="inline-flex self-center md:self-start items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-black text-pink-400 tracking-wider uppercase mb-3.5 select-none animate-pulse">
                  {"🎉 DOĞUM GÜNÜ ÖZEL"}
                </span>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                  {"İyi ki Doğdun! 🎂"}
                </h2>

                <p className="text-base sm:text-lg text-zinc-200 font-semibold leading-relaxed mb-4 max-w-[580px]">
                  {"En kıymetlimiz Mehmet Ali Hayri, yeni yaşının sana her zaman sağlık, mutluluk ve başarı getirmesini diliyoruz."}
                </p>

                {/* Love quote / signature block */}
                <div className="relative border-l-2 border-pink-500/60 pl-4 py-1.5 bg-pink-500/5 rounded-r-xl max-w-[580px] text-left">
                  <p className="text-sm font-bold text-pink-300 leading-snug">
                    {"Seni çok seviyoruz! İyi ki varsın! ❤️"}
                  </p>
                  <span className="block text-[10px] font-black tracking-widest text-pink-400 uppercase mt-2">
                    {"— AİLEN"}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        )}

        <div className="grid w-full gap-8 md:grid-cols-2">
          {/* CupMat Card */}
          <Link href="/cupmat" className="group relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#060b14] p-12 text-center transition-transform duration-300 group-hover:-translate-y-2">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                <Trophy className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">CupMat</h2>
              <p className="mb-10 max-w-[280px] text-lg leading-relaxed text-zinc-400">
                {t("hero.cupMatDesc")}
              </p>
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                {t("hero.playStart")} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* MinMat Card */}
          <Link href="/minmat" className="group relative">
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#060b14] p-12 text-center transition-transform duration-300 group-hover:-translate-y-2">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-500/10 ring-1 ring-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden p-4">
                <Image 
                  src="/minmat/icon.png" 
                  alt="MinMat Icon" 
                  width={64} 
                  height={64} 
                  className="object-contain"
                />
              </div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white uppercase">MinMat</h2>
              <p className="mb-10 max-w-[280px] text-lg leading-relaxed text-zinc-400">
                {t("hero.minMatDesc")}
              </p>
              <div className="flex items-center gap-2 font-bold text-blue-400">
                {t("hero.mindRefresh")} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        <footer className="mt-20 flex items-center gap-8 text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>AI powered</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Math logic</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
