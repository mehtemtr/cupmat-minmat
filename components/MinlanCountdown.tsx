"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, ArrowRight, Clock, Sparkles } from "lucide-react";

export function MinlanCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Target time: Today at 19:03 (Local time)
    const target = new Date();
    target.setHours(19, 3, 0, 0);

    const updateTimer = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setIsLive(true);
        setTimeLeft(null);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mb-12 relative group rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-[#060b14]/85 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl transition duration-500 hover:border-purple-500/40 hover:shadow-purple-500/10">
      
      {/* Background Glows */}
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-10 blur transition duration-500 group-hover:opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        
        {/* Left Side: Logo/Graphic */}
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 border-dashed animate-[spin_20s_linear_infinite]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-4 bg-purple-500/20 rounded-2xl mb-3 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                <Gamepad2 className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 tracking-wider">
                MINLAN
              </h3>
            </div>
          </div>
        </div>

        {/* Right Side: Content & Timer */}
        <div className="w-full md:w-2/3 text-center md:text-left flex flex-col items-center md:items-start justify-center">
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-black text-purple-300 tracking-widest uppercase mb-4 shadow-sm shadow-purple-500/10">
            <Sparkles className="w-3.5 h-3.5" /> YENİ OYUN
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
            9 Dilde Karşılıklı <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Kelime Mücadelesi
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-300 mb-6 max-w-lg leading-relaxed">
            Statmatik'in en yeni üyesi Minlan ile rakiplerine meydan oku! Zaman bitmeden önce yerini al ve bu dev küresel rekabete ilk katılanlardan ol.
          </p>

          {/* Timer or CTA */}
          <div className="w-full max-w-md bg-black/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
            {isLive ? (
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                  <span className="text-sm font-bold text-green-400 tracking-wider">YAYINDA!</span>
                </div>
                <Link 
                  href={process.env.NODE_ENV === "development" ? "/minlan" : "https://statmatik.com/minlan"}
                  className="w-full group/btn relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl overflow-hidden font-black text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    HEMEN OYNA <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-3 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-purple-400" /> 
                  Büyük Açılışa Kalan Süre (19:03)
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  {[
                    { label: "SAAT", value: timeLeft?.hours ?? 0 },
                    { label: "DAKİKA", value: timeLeft?.minutes ?? 0 },
                    { label: "SANİYE", value: timeLeft?.seconds ?? 0 },
                  ].map((unit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.02]" />
                        <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tighter">
                          {unit.value.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-2 tracking-wider">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="w-full">
                   <button 
                     disabled
                     className="w-full py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-300 cursor-not-allowed opacity-70"
                   >
                     Hazırlanıyor...
                   </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
