"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home, Menu, Trophy, X, Info, HelpCircle, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { buildSignOutUrl } from "@/lib/auth/sign-in-url";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { locales, type Locale } from "@/lib/i18n/types";

const navKeys = [
  { href: "/cupmat", key: "nav.home" },
  { href: "/teams", key: "nav.teams" },
  { href: "/futbolcular", key: "nav.footballers" },
  { href: "/groups", key: "nav.groups" },
  { href: "/venues", key: "nav.venues" },
  { href: "/tahminler", key: "nav.predictions" },
  { href: "/leaderboard", key: "nav.leaderboard" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [taraftarPuani, setTaraftarPuani] = useState<number | null>(null);

  // Fetch initial gamification points
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const fetchPoints = async () => {
      try {
        const res = await fetch(`/api/gamification?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setTaraftarPuani(data.profile.taraftarPuani);
          if (typeof window !== "undefined") {
            localStorage.setItem("minmat_last_name", data.profile.displayName);
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

  const handleAboutOpen = async () => {
    setAboutOpen(true);
    if (isSignedIn && user) {
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
          window.dispatchEvent(
            new CustomEvent("taraftar-puan-guncellendi", {
              detail: { points: data.profile.taraftarPuani, toast: data.message },
            })
          );
        }
      } catch (err) {
        console.error("About gamification error:", err);
      }
    }
  };

  const handleHelpOpen = async () => {
    setHelpOpen(true);
    if (isSignedIn && user) {
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
          window.dispatchEvent(
            new CustomEvent("taraftar-puan-guncellendi", {
              detail: { points: data.profile.taraftarPuani, toast: data.message },
            })
          );
        }
      } catch (err) {
        console.error("Help gamification error:", err);
      }
    }
  };

  const toggleLocale = () => {
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    setLocale(locales[nextIndex]);
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

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/cupmat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-400"
              title="Ana Sayfaya Dön"
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link
              href="/cupmat"
              className="flex items-center gap-2.5 text-white"
              onClick={() => setMobileOpen(false)}
            >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Trophy className="h-5 w-5 text-[#060b14]" strokeWidth={2.5} />
            </span>
            <span className="hidden font-bold tracking-tight sm:block">
              {t("nav.logoTitle")}
            </span>
          </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navKeys.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === href
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/minmat/index.html"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/35 bg-gradient-to-r from-blue-500/15 to-blue-600/10 px-3 py-2 text-xs font-bold text-blue-300 shadow-md shadow-blue-500/10 transition hover:border-blue-400/55 hover:from-blue-500/25 hover:text-blue-100 sm:text-sm"
              title={minMatSwitchLabel}
            >
              <Calculator className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{minMatSwitchLabel}</span>
              <span className="sm:hidden">MinMat</span>
            </Link>

            {/* Hakkında (ℹ️) Butonu */}
            <button
              type="button"
              onClick={handleAboutOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              title="Hakkında"
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Yardım (❓) Butonu */}
            <button
              type="button"
              onClick={handleHelpOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              title="Yardım"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
              aria-label={t("language.toggle")}
            >
              <Globe className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">
                {t(`language.${locale}`)}
              </span>
              <span className="sm:hidden uppercase">{locale}</span>
            </button>
            
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-200 shadow-md transition hover:border-emerald-400/30">
                  <span className="text-yellow-400 animate-pulse">⭐</span>
                  <span className="hidden sm:inline text-zinc-400">Puanım:</span>
                  <span className="text-emerald-400 font-bold">{taraftarPuani !== null ? taraftarPuani : "..."}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={buildSignOutUrl(pathname)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-rose-400 transition hover:border-rose-400/40 hover:bg-rose-500/10"
                    title={t("nav.signout") || "Çıkış Yap"}
                  >
                    <LogOut className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl="/tahminler">
                <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-[#060b14] hover:bg-emerald-400 transition-colors">
                  {t("nav.signin") || "Giriş Yap"}
                </button>
              </SignInButton>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-zinc-300 transition hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-white/10 bg-[#060b14]/95 px-4 py-4 md:hidden">
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              <li className="list-none mb-2">
                <Link
                  href="/minmat/index.html"
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-3 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-500/25"
                  onClick={() => setMobileOpen(false)}
                >
                  <Calculator className="h-4 w-4" />
                  {minMatSwitchLabel}
                </Link>
              </li>
              {navKeys.map(({ href, key }) => (
                <li key={key} className="list-none">
                  <Link
                    href={href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      pathname === href
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
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
            
            <div className="text-[14px] leading-relaxed text-zinc-300 space-y-4">
              <ul className="list-none p-0 m-0 space-y-3.5">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Giriş Yap:</strong> Tahmin yapabilmek, puanlarınızı kaydetmek ve global liderlik tablosunda yerinizi alabilmek için sağ üst köşedeki <strong>Giriş Yap</strong> butonunu kullanarak Clerk güvencesiyle hesabınızı oluşturun veya giriş yapın.
                  </span>
                </li>
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
                  <div>⏳ <strong>Gezinme Sayacı (Ana Sayfalar):</strong> Takımlar, Futbolcular, Gruplar, Stadyumlar ve Tahminler sayfalarında 30 saniye kaldığınızda sayfa altındaki sayaç tamamlanır ve <strong>+10 Taraftar Puanı</strong> ile <strong>+2 saniye MinMat ek süresi</strong> kazanırsınız.</div>
                  <div>📄 <strong>Detay Keşfi (Alt Sayfalar):</strong> Futbolcu, ülke, hakem ve stadyum detay sayfalarında 10 saniye kaldığınızda sayaç tamamlanır ve <strong>+1 Taraftar Puanı</strong> kazanırsınız.</div>
                </div>

                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>
                    <strong>MinMat Zeka Oyunu ve Tahmin Güncelleme:</strong> CupMat tahminlerinizi kaydettikten sonra değiştirmek için <strong>Güncelleme Anahtarı (🔑)</strong> gerekir:
                  </span>
                </li>
                <div className="ml-6 border-l-2 border-yellow-500/40 pl-4 py-1 space-y-1 text-zinc-400">
                  <div>🔑 <strong>Anahtar Kazanma:</strong> MinMat oyununu oynayıp 30 puan veya üzeri skor elde ettiğiniz her oyun için <strong>+1 Tahmin Güncelleme Anahtarı</strong> kazanırsınız.</div>
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
