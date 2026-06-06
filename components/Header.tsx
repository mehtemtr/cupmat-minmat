"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Info, HelpCircle, Calculator, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import AuthPanel from "./AuthPanel";
import { LanguageDropdown } from "./LanguageDropdown";
import { aboutHelpTranslations, type TranslationLang } from "@/data/about-help-translations";

const navKeys = [
  { href: "/teams", key: "nav.teams" },
  { href: "/futbolcular", key: "nav.footballers" },
  { href: "/groups", key: "nav.groups" },
  { href: "/venues", key: "nav.venues" },
  { href: "/tahminler", key: "nav.predictions" },
  { href: "/hakemler", key: "hero.referees" },
  { href: "/leagues", key: "nav.leagues" },
  { href: "/polls", key: "nav.polls" },
  // { href: "/fantasy", key: "nav.fantasy" },
  { href: "/leaderboard", key: "nav.leaderboard" },
  { href: "/stats", key: "nav.stats" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [taraftarPuani, setTaraftarPuani] = useState<number | null>(null);
  const [hakkindaTiklandi, setHakkindaTiklandi] = useState<boolean>(false);
  const [yardimTiklandi, setYardimTiklandi] = useState<boolean>(false);

  const activeLang = (locale in aboutHelpTranslations ? locale : "en") as TranslationLang;
  const mt = aboutHelpTranslations[activeLang];
  
  const [aboutSecondsLeft, setAboutSecondsLeft] = useState(10);
  const [aboutClaimedThisSession, setAboutClaimedThisSession] = useState(false);
  const [helpSecondsLeft, setHelpSecondsLeft] = useState(10);
  const [helpClaimedThisSession, setHelpClaimedThisSession] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial gamification points
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchPoints = async () => {
      try {
        const res = await fetch(`/api/gamification?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setTaraftarPuani(data.profile.taraftarPuani);
          setHakkindaTiklandi(data.profile.hakkindaTiklandi || false);
          setYardimTiklandi(data.profile.yardimTiklandi || false);
          if (typeof window !== "undefined") {
            localStorage.setItem("minmat_last_name", data.profile.displayName);
            localStorage.setItem(
              "wc2026-gamification-state",
              JSON.stringify({
                pageStayHistory: data.profile.pageStayHistory || {},
                lastSyncDate: new Date().toISOString().split("T")[0],
              })
            );
          }
        }
      } catch (err) {
        console.error("Fetch points error:", err);
      }
    };

    fetchPoints();
  }, [isSignedIn, user]);

  // Listen to point updates from the timer manager
  useEffect(() => {
    const handlePointsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.points === "number") {
        setTaraftarPuani(customEvent.detail.points);
      }
    };

    window.addEventListener("taraftar-puan-guncellendi", handlePointsUpdate);
    return () => window.removeEventListener("taraftar-puan-guncellendi", handlePointsUpdate);
  }, []);

  // About modal timer logic
  useEffect(() => {
    if (!aboutOpen || !isSignedIn || !user || hakkindaTiklandi || aboutClaimedThisSession) {
      setAboutSecondsLeft(10);
      return;
    }

    setAboutSecondsLeft(10);
    const interval = setInterval(() => {
      setAboutSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          claimAboutPoints();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [aboutOpen, isSignedIn, user, hakkindaTiklandi, aboutClaimedThisSession]);

  const claimAboutPoints = async () => {
    if (!isSignedIn || !user || hakkindaTiklandi || aboutClaimedThisSession) return;
    try {
      const res = await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "about_clicked",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHakkindaTiklandi(true);
        setAboutClaimedThisSession(true);
        setTaraftarPuani(data.profile.taraftarPuani);
        
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "wc2026-gamification-state",
            JSON.stringify({
              pageStayHistory: data.profile.pageStayHistory || {},
              lastSyncDate: new Date().toISOString().split("T")[0],
            })
          );
        }

        window.dispatchEvent(
          new CustomEvent("taraftar-puan-guncellendi", {
            detail: { points: data.profile.taraftarPuani, toast: data.message },
          })
        );
      }
    } catch (err) {
      console.error("About gamification error:", err);
    }
  };

  // Help modal timer logic
  useEffect(() => {
    if (!helpOpen || !isSignedIn || !user || yardimTiklandi || helpClaimedThisSession) {
      setHelpSecondsLeft(10);
      return;
    }

    setHelpSecondsLeft(10);
    const interval = setInterval(() => {
      setHelpSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          claimHelpPoints();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [helpOpen, isSignedIn, user, yardimTiklandi, helpClaimedThisSession]);

  const claimHelpPoints = async () => {
    if (!isSignedIn || !user || yardimTiklandi || helpClaimedThisSession) return;
    try {
      const res = await fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "help_clicked",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setYardimTiklandi(true);
        setHelpClaimedThisSession(true);
        setTaraftarPuani(data.profile.taraftarPuani);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "wc2026-gamification-state",
            JSON.stringify({
              pageStayHistory: data.profile.pageStayHistory || {},
              lastSyncDate: new Date().toISOString().split("T")[0],
            })
          );
        }

        window.dispatchEvent(
          new CustomEvent("taraftar-puan-guncellendi", {
            detail: { points: data.profile.taraftarPuani, toast: data.message },
          })
        );
      }
    } catch (err) {
      console.error("Help gamification error:", err);
    }
  };

  const handleAboutOpen = () => {
    setAboutOpen(true);
  };

  const handleHelpOpen = () => {
    setHelpOpen(true);
  };


  const minMatSwitchLabel =
    locale === "tr" ? "MinMat'a Geç" :
    locale === "de" ? "Zu MinMat" :
    locale === "fr" ? "Aller à MinMat" :
    locale === "es" ? "Ir a MinMat" :
    locale === "pt" ? "Ir para o MinMat" :
    locale === "ar" ? "الذهاب إلى MinMat" :
    locale === "ko" ? "MinMat으로 이동" :
    locale === "it" ? "Vai a MinMat" :
    "Go to MinMat";

  // Kök seçim kapısı (/) — header yok; CupMat dünyasında navbar gösterilir
  if (pathname === "/") return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060b14]/80 backdrop-blur-xl">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          aria-hidden
        />

        <div className="max-w-7xl mx-auto px-4 w-full flex h-16 items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/cupmat"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-400"
              title="Ana Sayfaya Dön"
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link
              href="/cupmat"
              className="flex items-center gap-2 sm:gap-2.5 text-white"
            >
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#060b14]" strokeWidth={2.5} />
            </span>
            <span className="hidden font-bold tracking-tight sm:block">
              {t("nav.logoTitle")}
            </span>
          </Link>
          </div>

          {/* CUPMAT MENÜ Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1 sm:gap-2 rounded-xl border border-white/10 bg-[#060b14]/80 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/10 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              CUPMAT MENÜ
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-[-30px] translate-x-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-64 rounded-2xl border border-white/10 bg-[#060b14]/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 z-50 overflow-hidden">
                <div className="p-2">
                  {/* MinMat Link */}
                  <Link
                    href="/minmat"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blue-300 hover:bg-blue-500/10 transition-colors"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>{minMatSwitchLabel}</span>
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-1 h-px bg-white/10" />
                  
                  {/* Nav Links */}
                  {navKeys.map(({ href, key }) => (
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        pathname === href
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {t(key)}
                    </Link>
                  ))}

                  {/* Divider */}
                  <div className="my-1 h-px bg-white/10 sm:hidden" />

                  {/* Hakkında Link (Mobile Only) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleAboutOpen();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors sm:hidden"
                  >
                    <Info className="h-4 w-4 text-emerald-400" />
                    <span>{locale === "tr" ? "Hakkında" : "About"}</span>
                  </button>

                  {/* Yardım Link (Mobile Only) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleHelpOpen();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors sm:hidden"
                  >
                    <HelpCircle className="h-4 w-4 text-emerald-400" />
                    <span>{locale === "tr" ? "Yardım" : "Help"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hakkında (ℹ️) Butonu */}
            <button
              type="button"
              onClick={handleAboutOpen}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              title="Hakkında"
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Yardım (❓) Butonu */}
            <button
              type="button"
              onClick={handleHelpOpen}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              title="Yardım"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <LanguageDropdown showFullLabelOnDesktop />

            {/* Puan Göstergesi */}
            {isSignedIn && (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-200 shadow-md transition hover:border-emerald-400/30">
                <span className="text-yellow-400 animate-pulse">⭐</span>
                <span className="hidden sm:inline text-zinc-400">Puanım:</span>
                <span className="text-emerald-400 font-bold">{taraftarPuani !== null ? taraftarPuani : "..."}</span>
              </div>
            )}
            
            {/* Evrensel Auth Panel */}
            <AuthPanel />
          </div>
        </div>
      </header>

      {/* HAKKINDA MODAL */}
      {aboutOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setAboutOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#04080e] p-8 shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
              <img 
                src="/icon.png" 
                alt="MahTEM Logo" 
                className="h-11 w-11 rounded-xl object-contain border border-white/10 bg-white/5 shadow-lg shadow-emerald-500/25"
              />
              <h2 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent tracking-wide">
                MahTEM
              </h2>
            </div>
            
            {/* Visual Stay Timer Reward Indicator */}
            {isSignedIn && (
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {mt.reviewReward}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {mt.aboutRewardDesc}
                    </p>
                  </div>
                </div>
                <div>
                  {hakkindaTiklandi || aboutClaimedThisSession ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      {mt.pointsClaimed}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                      {mt.timerRemaining.replace("{seconds}", aboutSecondsLeft.toString())}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-[14px] leading-relaxed text-zinc-300 space-y-5">
              <p>
                {mt.aboutDesc}
              </p>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  {mt.studioTitle}
                </h3>
                <p className="ml-4 font-semibold text-white">{mt.studioName}</p>
              </div>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  {mt.teamTitle}
                </h3>
                <p className="ml-4 font-semibold text-white">{mt.teamNames}</p>
              </div>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  {mt.versionTitle}
                </h3>
                <p className="ml-4 text-zinc-400">{mt.versionValue}</p>
              </div>
 
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  {mt.socialTitle}
                </h3>
                <div className="ml-4 flex flex-col gap-2 text-zinc-300">
                  <a href="https://x.com/Statmatikcom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors w-fit text-sm">
                    <span className="text-zinc-400">X:</span> @Statmatikcom
                  </a>
                  <a href="https://www.instagram.com/statmatik/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-500 transition-colors w-fit text-sm">
                    <span className="text-zinc-400">Instagram:</span> @statmatik
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61590443797517" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors w-fit text-sm">
                    <span className="text-zinc-400">Facebook:</span> Statmatik
                  </a>
                  <a href="mailto:info.mahtemyazilim@gmail.com" className="flex items-center gap-2 hover:text-emerald-400 transition-colors w-fit text-sm">
                    <span className="text-zinc-400">E-mail:</span> info.mahtemyazilim@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent p-5 text-center shadow-lg shadow-yellow-500/5">
                <h4 className="text-[13px] font-extrabold text-yellow-500 tracking-[1.5px] uppercase mb-2.5">
                  {mt.dedicationTitle}
                </h4>
                <p className="text-[14px] font-bold text-yellow-100/90 leading-relaxed">
                  Mehmet Ali KILIÇ • Hayri TEMİZEL<br />
                  Lütfiye TEMİZEL • Hüseyin TEMİZEL<br />
                  Şükran TEMİZEL • Abdurrahman Hayri TEMİZEL
                </p>
                <p className="text-[11px] italic text-zinc-400 mt-2.5">
                  {mt.dedicationFooter}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end border-t border-white/10 pt-4 mt-5">
              <button 
                onClick={() => setAboutOpen(false)}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition hover:scale-105 active:scale-95"
              >
                {mt.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* YARDIM MODAL */}
      {helpOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setHelpOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#04080e] p-8 shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25 text-2xl">
                ❓
              </span>
              <h2 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent tracking-wide">
                {mt.helpTitle}
              </h2>
            </div>
            
            {/* Visual Stay Timer Reward Indicator */}
            {isSignedIn && (
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {mt.reviewReward}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {mt.helpRewardDesc}
                    </p>
                  </div>
                </div>
                <div>
                  {yardimTiklandi || helpClaimedThisSession ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      {mt.pointsClaimed}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                      {mt.timerRemaining.replace("{seconds}", helpSecondsLeft.toString())}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-[14px] leading-relaxed text-zinc-300 space-y-4">
              <ul className="list-none p-0 m-0 space-y-3.5">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.loginTitle}</strong> {mt.loginText}
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-emerald-500/40 pl-4 py-1.5 space-y-1.5 text-zinc-400 text-xs">
                  <div>{mt.loginSub1}</div>
                  <div>{mt.loginSub2}</div>
                  <div>
                    📄 <strong>{
                      locale === "tr" ? "Kullanım Kılavuzu:" :
                      locale === "de" ? "Benutzerhandbuch:" :
                      locale === "fr" ? "Guide de l'utilisateur:" :
                      locale === "es" ? "Guía del usuario:" :
                      locale === "pt" ? "Guia do Usuário:" :
                      locale === "ar" ? "دليل المستخدم:" :
                      locale === "ko" ? "사용자 가이드:" :
                      locale === "it" ? "Guida Utente:" :
                      "User Guide:"
                    }</strong>{" "}
                    {locale === "tr" ? (
                      <>
                        Giriş ve kayıt örneği için{" "}
                        <a href="/rehber_tr.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          tıklayınız
                        </a>.
                      </>
                    ) : locale === "de" ? (
                      <>
                        Bitte{" "}
                        <a href="/rehber_de.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          klicken Sie hier
                        </a>{" "}
                        für das Login- und Registrierungsbeispiel.
                      </>
                    ) : locale === "fr" ? (
                      <>
                        Veuillez{" "}
                        <a href="/rehber_fr.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          cliquer ici
                        </a>{" "}
                        pour l'exemple de connexion et d'inscription.
                      </>
                    ) : locale === "es" ? (
                      <>
                        Por favor,{" "}
                        <a href="/rehber_es.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          haga clic aquí
                        </a>{" "}
                        para ver el ejemplo de inicio de sesión y registro.
                      </>
                    ) : locale === "pt" ? (
                      <>
                        Por favor,{" "}
                        <a href="/rehber_pt.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          clique aqui
                        </a>{" "}
                        para o exemplo de login e registro.
                      </>
                    ) : locale === "ar" ? (
                      <>
                        يرجى{" "}
                        <a href="/rehber_ar.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          النقر هنا
                        </a>{" "}
                        لمشاهدة مثال تسجيل الدخول والتسجيل.
                      </>
                    ) : locale === "ko" ? (
                      <>
                        로그인 및 회원가입 예시를 보시려면{" "}
                        <a href="/rehber_ko.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          여기를 클릭
                        </a>{" "}
                        하세요.
                      </>
                    ) : locale === "it" ? (
                      <>
                        Si prega di{" "}
                        <a href="/rehber_it.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          cliccare qui
                        </a>{" "}
                        per l'esempio di accesso e registrazione.
                      </>
                    ) : (
                      <>
                        Please{" "}
                        <a href="/rehber_en.pdf" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                          click here
                        </a>{" "}
                        for login and registration example.
                      </>
                    )}
                  </div>
                </div>
 
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.predictTitle}</strong> {mt.predictText}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.pointsTitle}</strong> {mt.pointsText}
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-emerald-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>{mt.pointsSub1}</div>
                  <div>{mt.pointsSub2}</div>
                  <div>{mt.pointsSub3}</div>
                </div>
 
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.activePointsTitle}</strong> {mt.activePointsText}
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-indigo-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>{mt.activePointsSub1}</div>
                  <div>{mt.activePointsSub2}</div>
                  <div>{mt.activePointsSub3}</div>
                  <div>{mt.activePointsSub4}</div>
                </div>
 
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.minmatTitle}</strong> {mt.minmatText}
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-yellow-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>{mt.minmatSub1}</div>
                  <div>{mt.minmatSub2}</div>
                </div>
 
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{mt.globalTitle}</strong> {mt.globalText}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-end border-t border-white/10 pt-4 mt-5">
              <button 
                onClick={() => setHelpOpen(false)}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition hover:scale-105 active:scale-95"
              >
                {mt.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}