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
  const [activeBanner, setActiveBanner] = useState<"none" | "19mayis" | "birthday">("none");
  const [showTrabzonsporBanner, setShowTrabzonsporBanner] = useState(false);

  // Trabzonspor Banner Check (24hr from first load + localStorage)
  useEffect(() => {
    const TRABZONSPOR_BANNER_KEY = "trabzonspor_banner_shown";
    const TRABZONSPOR_BANNER_EXPIRY_KEY = "trabzonspor_banner_expiry";

    const checkBanner = () => {
      const now = Date.now();
      const expiryStr = localStorage.getItem(TRABZONSPOR_BANNER_EXPIRY_KEY);
      const dismissed = localStorage.getItem(TRABZONSPOR_BANNER_KEY) === "dismissed";

      if (dismissed) {
        setShowTrabzonsporBanner(false);
        return;
      }

      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10);
        if (now > expiry) {
          setShowTrabzonsporBanner(false);
          localStorage.setItem(TRABZONSPOR_BANNER_KEY, "dismissed");
          return;
        }
      } else {
        // Set expiry for 24 hours from now
        localStorage.setItem(TRABZONSPOR_BANNER_EXPIRY_KEY, (now + 24 * 60 * 60 * 1000).toString());
      }

      setShowTrabzonsporBanner(true);
    };

    checkBanner();
  }, []);

  const handleDismissTrabzonspor = () => {
    setShowTrabzonsporBanner(false);
    localStorage.setItem("trabzonspor_banner_shown", "dismissed");
  };

  useEffect(() => {
    const checkDate = () => {
      // Check query parameter for easy testing: ?preview=birthday or ?preview=19mayis
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

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 4 = May (0-indexed)
      const date = now.getDate();

      if (year === 2026 && month === 4 && date === 19) {
        setActiveBanner("19mayis");
      } else if (year === 2026 && month === 4 && date === 20) {
        setActiveBanner("birthday");
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

      {/* Duyuru Banner */}
      <div className="w-full bg-gradient-to-r from-amber-600 to-amber-500 py-3 px-4 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 text-center">
          <span className="text-2xl">📢</span>
          <p className="text-sm sm:text-base font-semibold text-amber-950">
            Bilgilendirme: Altyapı ve sunucu senkronizasyonlarından kaynaklanan teknik nedenlerden dolayı, kullanıcı kayıtları ve puan sıralamalarının listelenmesinde geçici aksaklıklar yaşanmaktadır. Mühendislerimiz sorunu tamamen çözmek için çalışıyorlar; bu süreçte sistemlerimizi keyifle kullanmaya devam edebilirsiniz. Anlayışınız için teşekkür ederiz!
          </p>
        </div>
      </div>

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
        {/* Trabzonspor Türkiye Kupası Şampiyonluğu Tebrik Banner */}
        {showTrabzonsporBanner && (
          <div className="w-full mb-10 relative group overflow-hidden rounded-3xl border border-bordeaux-500/25 bg-gradient-to-r from-[#6C0A2F] via-[#7A0C35] to-[#0F52BA] p-5 sm:p-6 shadow-[0_0_40px_rgba(124,10,47,0.45)] transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_55px_rgba(15,82,186,0.35)] z-20">
            {/* Close Button */}
            <button
              onClick={handleDismissTrabzonspor}
              className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm hover:bg-white/25 hover:text-white transition-all duration-200 shadow-md"
              title="Kapat"
            >
              <span className="text-lg font-bold leading-none">✕</span>
            </button>
            
            <div className="relative flex flex-col items-center gap-4 sm:gap-5 z-10">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                <span className="text-4xl sm:text-5xl select-none animate-bounce">🏆</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight text-center">
                  2025-2026 Ziraat Türkiye Kupası Şampiyonu
                  <br />
                  <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                    Trabzonspor'u Kutlarız!
                  </span>
                </h2>
                <div className="flex gap-2 text-4xl sm:text-5xl select-none">
                  <span>🔴</span>
                  <span>🔵</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 font-semibold tracking-wider uppercase">
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">
                  statmatik.com
                </span>
              </div>
            </div>
          </div>
        )}

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
