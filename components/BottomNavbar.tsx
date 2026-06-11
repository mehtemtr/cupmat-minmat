"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";
import { 
  Home, 
  Calculator, 
  Sparkles, 
  Trophy, 
  Menu, 
  X, 
  Users, 
  Activity, 
  Calendar, 
  User, 
  HelpCircle, 
  Info,
  BarChart2,
  HelpCircle as QuestionIcon
} from "lucide-react";
import AuthPanel from "./AuthPanel";
import { LanguageDropdown } from "./LanguageDropdown";

export default function BottomNavbar() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Handle clicking outside to close the drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  // Skip rendering on the splash page
  if (pathname === "/") return null;

  // Determine active theme color (MinMat is blue-themed, CupMat is emerald-themed)
  const isMinMatTheme = pathname?.startsWith("/minmat");
  const activeTextColor = isMinMatTheme ? "text-blue-400" : "text-emerald-400";
  const activeBgColor = isMinMatTheme ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400";
  const borderGradientClass = isMinMatTheme ? "via-blue-400/50" : "via-emerald-400/50";

  // Translate auxiliary drawer text
  const menuLabel = locale === "tr" ? "Menü" : "Menu";
  const moreLabel = locale === "tr" ? "Daha Fazla" : "More";
  const closeLabel = locale === "tr" ? "Kapat" : "Close";
  const accountLabel = locale === "tr" ? "Hesap ve Takma Ad" : "Account & Nickname";

  const triggerAbout = () => {
    setDrawerOpen(false);
    window.dispatchEvent(new Event("open-about-modal"));
  };

  const triggerHelp = () => {
    setDrawerOpen(false);
    window.dispatchEvent(new Event("open-help-modal"));
  };

  const navItems = [
    {
      label: locale === "tr" ? "Ana Sayfa" : "Home",
      href: "/cupmat",
      icon: Home,
      isActive: pathname === "/cupmat",
    },
    {
      label: "MinMat",
      href: "/minmat",
      icon: Calculator,
      isActive: pathname?.startsWith("/minmat"),
    },
    {
      label: locale === "tr" ? "Tahmin" : "Predict",
      href: "/tahminler",
      icon: Sparkles,
      isActive: pathname === "/tahminler" || pathname === "/predictions",
    },
    {
      label: locale === "tr" ? "Sıralama" : "Ranks",
      href: "/leaderboard",
      icon: Trophy,
      isActive: pathname === "/leaderboard",
    },
  ];

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#04080e]/90 backdrop-blur-xl md:hidden pb-safe">
        {/* Animated Accent Line at Top of Bar */}
        <div
          className={`absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${borderGradientClass} to-transparent`}
          aria-hidden="true"
        />

        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
                  item.isActive ? activeTextColor : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" strokeWidth={item.isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* More (Menu) Tab */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
              drawerOpen ? activeTextColor : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Menu className="h-5 w-5 mb-0.5" strokeWidth={drawerOpen ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-tight">{menuLabel}</span>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay (Backdrop) */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Drawer Sheet */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 inset-x-0 z-[60] bg-[#070b14] border-t border-white/10 rounded-t-[28px] shadow-2xl p-6 transition-all duration-300 ease-out transform md:hidden pb-10 ${
          drawerOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "82vh", overflowY: "auto" }}
      >
        {/* Handle bar for drag visual */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${isMinMatTheme ? "from-blue-400 to-blue-600" : "from-emerald-400 to-emerald-600"} shadow-lg`}>
              <Trophy className="h-4 w-4 text-[#060b14]" strokeWidth={2.5} />
            </span>
            <span className="font-extrabold text-white text-lg tracking-tight">CupMat & MinMat</span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Account Section */}
        <div className="mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{accountLabel}</h4>
          <div className="flex items-center justify-between gap-4">
            <AuthPanel />
          </div>
        </div>

        {/* Drawer Grid of Secondary Features */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{moreLabel}</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/kupa-yolu"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.bracket")}</span>
              </Link>
              <Link
                href="/leagues"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Users className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.leagues")}</span>
              </Link>
              <Link
                href="/polls"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.polls")}</span>
              </Link>
              <Link
                href="/stats"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <BarChart2 className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.stats")}</span>
              </Link>
              <Link
                href="/teams"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.teams")}</span>
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.groups")}</span>
              </Link>
              <Link
                href="/venues"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <Home className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.venues")}</span>
              </Link>
              <Link
                href="/hakemler"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <User className="h-4 w-4 text-emerald-400" />
                <span>{t("hero.referees")}</span>
              </Link>
              <Link
                href="/futbolcular"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <User className="h-4 w-4 text-emerald-400" />
                <span>{t("nav.footballers")}</span>
              </Link>
            </div>
          </div>

          {/* Info, Help and Language Section */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">
                {locale === "tr" ? "Uygulama Dili" : "App Language"}
              </span>
              <LanguageDropdown showFullLabelOnDesktop />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={triggerAbout}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-bold transition"
              >
                <Info className="h-4 w-4 text-sky-400" />
                <span>{locale === "tr" ? "Hakkında" : "About"}</span>
              </button>
              <button
                type="button"
                onClick={triggerHelp}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-bold transition"
              >
                <HelpCircle className="h-4 w-4 text-sky-400" />
                <span>{locale === "tr" ? "Yardım" : "Help"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
