"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Info, HelpCircle, Calculator, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import AuthPanel from "./AuthPanel";
import { LanguageDropdown } from "./LanguageDropdown";

const navKeys = [
  { href: "/teams", key: "nav.teams" },
  { href: "/futbolcular", key: "nav.footballers" },
  { href: "/groups", key: "nav.groups" },
  { href: "/venues", key: "nav.venues" },
  { href: "/tahminler", key: "nav.predictions" },
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
    locale === "tr" ? "MinMat'a Geç" : locale === "de" ? "Zu MinMat" : locale === "fr" ? "Aller à MinMat" : locale === "es" ? "Ir a MinMat" : "Go to MinMat";

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
          <div className="flex items-center gap-4">
            <Link
              href="/cupmat"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-400"
              title="Ana Sayfaya Dön"
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link
              href="/cupmat"
              className="flex items-center gap-2.5 text-white"
            >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Trophy className="h-5 w-5 text-[#060b14]" strokeWidth={2.5} />
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#060b14]/80 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/10 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              CUPMAT MENÜ
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl border border-white/10 bg-[#060b14]/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 z-50 overflow-hidden">
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

          <div className="flex items-center gap-2">
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
                      {locale === "tr" ? "İnceleme Ödülü" : "Review Reward"}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {locale === "tr" 
                        ? "Hakkında sayfasını 10 saniye inceleyerek +5 Taraftar Puanı kazanın." 
                        : "Spend 10 seconds reviewing the About page to earn +5 Fans Points."}
                    </p>
                  </div>
                </div>
                <div>
                  {hakkindaTiklandi || aboutClaimedThisSession ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      ✓ {locale === "tr" ? "Puan Alındı" : "Points Claimed"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                      ⏱️ {aboutSecondsLeft}s
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-[14px] leading-relaxed text-zinc-300 space-y-5">
              <p>
                Bu oyun; zihinden işlem hızını, matematiksel zekayı ve stratejik düşünmeyi eğlenceli bir şekilde geliştirmek amacıyla Cupmat & Minmat entegrasyonuyla hazırlanmıştır.
              </p>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  🚀 Yapımcı Stüdyo
                </h3>
                <p className="ml-4 font-semibold text-white">MahTEM Oyun Stüdyosu</p>
              </div>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  💻 Geliştirici Ekibi
                </h3>
                <p className="ml-4 font-semibold text-white">Mehmet Ali Hayri Temizel & Mehtap Temizel & Harun Temizel</p>
              </div>
              
              <div>
                <h3 className="text-[15px] font-bold text-sky-400 flex items-center gap-2 mb-1.5">
                  📌 Sürüm
                </h3>
                <p className="ml-4 text-zinc-400">v1.0.0 (Mayıs 2026)</p>
              </div>
              
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent p-5 text-center shadow-lg shadow-yellow-500/5">
                <h4 className="text-[13px] font-extrabold text-yellow-500 tracking-[1.5px] uppercase mb-2.5">
                  ✨ Anılarına, Saygı, Sevgi ve Rahmetle ✨
                </h4>
                <p className="text-[14px] font-bold text-yellow-100/90 leading-relaxed">
                  Mehmet Ali KILIÇ • Hayri TEMİZEL<br />
                  Lütfiye TEMİZEL • Hüseyin TEMİZEL<br />
                  Şükran TEMİZEL • Abdurrahman Hayri TEMİZEL
                </p>
                <p className="text-[11px] italic text-zinc-400 mt-2.5">
                  Aziz anılarına ithaf edilmiştir. Ruhları şad olsun, isimleri hep yaşasın.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end border-t border-white/10 pt-4 mt-5">
              <button 
                onClick={() => setAboutOpen(false)}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition hover:scale-105 active:scale-95"
              >
                ❌ Kapat
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
                Nasıl Oynanır & Tahmin Yapılır?
              </h2>
            </div>
            
            {/* Visual Stay Timer Reward Indicator */}
            {isSignedIn && (
              <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {locale === "tr" ? "İnceleme Ödülü" : "Review Reward"}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {locale === "tr" 
                        ? "Yardım sayfasını 10 saniye inceleyerek +5 Taraftar Puanı kazanın." 
                        : "Spend 10 seconds reviewing the Help page to earn +5 Fans Points."}
                    </p>
                  </div>
                </div>
                <div>
                  {yardimTiklandi || helpClaimedThisSession ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      ✓ {locale === "tr" ? "Puan Alındı" : "Points Claimed"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30 animate-pulse">
                      ⏱️ {helpSecondsLeft}s
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
                    <strong>Üye Girişi & Takma Ad (Nick) Değiştirme:</strong> Tahmin yapabilmek, puanlarınızı kaydetmek ve sıralamada yer alabilmek için sağ üst köşedeki <strong>Giriş Yap</strong> butonunu kullanarak hesabınızı oluşturun.
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-emerald-500/40 pl-4 py-1.5 space-y-1.5 text-zinc-400 text-xs">
                  <div>🔐 <strong>Giriş Yöntemi:</strong> E-posta adresiniz veya sosyal hesaplarınızla hızlıca üye olabilirsiniz.</div>
                  <div>✏️ <strong>Takma Adı (Nick) Düzenleme:</strong> Giriş yaptıktan sonra, sağ üstteki kutucukta otomatik atanan adınızı göreceksiniz. Bu kutucuğa tıklayarak istediğiniz takma adı yazıp <strong>Enter</strong> tuşuna basarak veya kutucuk dışına tıklayarak veritabanına otomatik olarak kaydedebilirsiniz.</div>
                </div>

                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Tahminlerini Kaydet:</strong> Menüden <strong>Tahminler</strong> sayfasına gidin. 2026 Dünya Kupası grup ve eleme aşaması maçları için skor tahminlerinizi yazın ve kaydet butonuna basın.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Maç Sonu Puanları:</strong> Gerçek hayattaki maçlar oynandıkça ve sonuçlar girildikçe puanlarınız otomatik olarak hesaplanır:
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-emerald-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>🎯 <strong>Tam Skor Tahmini:</strong> 5 Puan (Örn: 2-1 tahmin ettiniz, maç 2-1 bitti)</div>
                  <div>⚡ <strong>Doğru Kazanan & Fark:</strong> 3 Puan (Örn: 2-0 tahmin ettiniz, maç 3-1 bitti)</div>
                  <div>🔥 <strong>Sadece Doğru Kazanan:</strong> 2 Puan (Örn: 1-0 tahmin ettiniz, maç 3-0 bitti)</div>
                </div>

                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Aktif Katılım ve Ek Puanlar:</strong> Sitede gezinerek ve aktif kalarak ekstra <strong>Taraftar Puanı</strong> ve MinMat zeka oyununda kullanabileceğiniz <strong>Ek Süreler (⏱️)</strong> kazanabilirsiniz:
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-indigo-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>📅 <strong>Günlük Giriş Ödülü:</strong> Günde 1 kez giriş yapınca <strong>+10 Taraftar Puanı</strong> ve <strong>+2 saniye MinMat süresi</strong>.</div>
                  <div>ℹ️ <strong>Keşif Ödülleri (Hakkında/Yardım):</strong> Günde 1 kez Hakkında ve Yardım pencerelerini incelediğinizde <strong>+5 Puan</strong>.</div>
                  <div>⏳ <strong>Gezinme Sayacı (Ana Sayfalar):</strong> Takımlar, Futbolcular, Gruplar, Stadyumlar, Tahminler ve İstatistikler sayfalarında 30 saniye kaldığınızda sayfa altındaki sayaç tamamlanır ve <strong>+10 Taraftar Puanı</strong> ile <strong>+2 saniye MinMat ek süresi</strong> kazanırsınız.</div>
                  <div>📄 <strong>Detay Keşfi (Alt Sayfalar):</strong> Futbolcu, ülke, hakem ve stadyum detay sayfalarında 10 saniye kaldığınızda sayaç tamamlanır ve <strong>+1 Taraftar Puanı</strong> kazanırsınız.</div>
                </div>

                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>MinMat Zeka Oyunu ve Tahmin Güncelleme:</strong> CupMat tahminlerinizi kaydettikten sonra değiştirmek için <strong>Güncelleme Anahtarı (🔑)</strong> gerekir:
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-yellow-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>🔑 <strong>Anahtar Kazanma:</strong> MinMat oyununu oynayıp 300 puan veya üzeri skor elde ettiğiniz her oyun için <strong>+1 Tahmin Güncelleme Anahtarı</strong> kazanırsınız.</div>
                  <div>⏱️ <strong>Ek Süre Kullanımı:</strong> MinMat oyununda zorlandığınızda, CupMat ile kazandığınız ek süreleri (⏱️) harcayarak oyuna ek süreyle başlayabilir ve daha kolay rekor kırabilirsiniz!</div>
                </div>

                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Global Rekabet:</strong> Kazandığınız toplam puanlarla <strong>Puan Durumu</strong> liderlik tablosunda diğer oyuncularla yarışın, {"CupMat 2026'nın"} şampiyonu siz olun!
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-end border-t border-white/10 pt-4 mt-5">
              <button 
                onClick={() => setHelpOpen(false)}
                className="rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition hover:scale-105 active:scale-95"
              >
                ❌ Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}