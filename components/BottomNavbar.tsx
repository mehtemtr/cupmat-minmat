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
  Newspaper,
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

  // 9-Language Dictionary for Bottom Navigation Bar
  const BOTTOM_NAV_I18N: Record<string, {
    home: string;
    menu: string;
    more: string;
    close: string;
    account: string;
    appLanguage: string;
    about: string;
    help: string;
  }> = {
    tr: {
      home: "Ana Sayfa",
      menu: "Menü",
      more: "Daha Fazla",
      close: "Kapat",
      account: "Hesap ve Takma Ad",
      appLanguage: "Uygulama Dili",
      about: "Hakkında",
      help: "Yardım",
    },
    en: {
      home: "Home",
      menu: "Menu",
      more: "More",
      close: "Close",
      account: "Account & Nickname",
      appLanguage: "App Language",
      about: "About",
      help: "Help",
    },
    de: {
      home: "Startseite",
      menu: "Menü",
      more: "Mehr",
      close: "Schließen",
      account: "Konto & Spitzname",
      appLanguage: "App-Sprache",
      about: "Über uns",
      help: "Hilfe",
    },
    fr: {
      home: "Accueil",
      menu: "Menu",
      more: "Plus",
      close: "Fermer",
      account: "Compte & Pseudo",
      appLanguage: "Langue de l'application",
      about: "À propos",
      help: "Aide",
    },
    es: {
      home: "Inicio",
      menu: "Menú",
      more: "Más",
      close: "Cerrar",
      account: "Cuenta y Apodo",
      appLanguage: "Idioma de la aplicación",
      about: "Acerca de",
      help: "Ayuda",
    },
    it: {
      home: "Home",
      menu: "Menu",
      more: "Altro",
      close: "Chiudi",
      account: "Account & Nickname",
      appLanguage: "Lingua dell'app",
      about: "Informazioni",
      help: "Aiuto",
    },
    pt: {
      home: "Início",
      menu: "Menu",
      more: "Mais",
      close: "Fechar",
      account: "Conta e Apelido",
      appLanguage: "Idioma do aplicativo",
      about: "Sobre",
      help: "Ajuda",
    },
    ar: {
      home: "الرئيسية",
      menu: "القائمة",
      more: "المزيد",
      close: "إغلاق",
      account: "الحساب والاسم المستعار",
      appLanguage: "لغة التطبيق",
      about: "حول",
      help: "مساعدة",
    },
    ko: {
      home: "홈",
      menu: "메뉴",
      more: "더보기",
      close: "닫기",
      account: "계정 및 닉네임",
      appLanguage: "앱 언어",
      about: "정보",
      help: "도움말",
    },
  };

  const navI18n = BOTTOM_NAV_I18N[locale] || BOTTOM_NAV_I18N.tr;
  const menuLabel = navI18n.menu;
  const moreLabel = navI18n.more;
  const closeLabel = navI18n.close;
  const accountLabel = navI18n.account;
  const appLanguageLabel = navI18n.appLanguage;
  const aboutLabel = navI18n.about;
  const helpLabel = navI18n.help;

  const triggerAbout = () => {
    setDrawerOpen(false);
    window.dispatchEvent(new Event("open-about-modal"));
  };

  const triggerHelp = () => {
    setDrawerOpen(false);
    window.dispatchEvent(new Event("open-help-modal"));
  };

  const isMinlanEnabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_MINLAN === "true";

  const isNewsEnabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_NEWS === "true";

  const navItems = [
    {
      label: navI18n.home,
      href: process.env.NODE_ENV === "development" ? "/" : "https://statmatik.com",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "CupMat",
      href: "/cupmat",
      icon: Trophy,
      imgSrc: "/logo_s_clean.png",
      isActive: pathname?.startsWith("/cupmat"),
    },
    {
      label: "MinLan",
      href: process.env.NODE_ENV === "development" ? "/minlan" : "https://statmatik.com/minlan",
      icon: Sparkles,
      imgSrc: "/minlan-logo.png",
      isActive: pathname?.startsWith("/minlan"),
    },
    {
      label: "MinMat",
      href: "/minmat",
      icon: Calculator,
      imgSrc: "/minmat/icon.png",
      isActive: pathname?.startsWith("/minmat"),
    },
    {
      label: "NewsGlo",
      href: "/haberler",
      icon: Newspaper,
      imgSrc: "/newsglo-logo.jpg",
      isActive: pathname?.startsWith("/haberler") || pathname?.includes("news"),
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
                {item.imgSrc ? (
                  <img src={item.imgSrc} alt={item.label} className={`w-5 h-5 mb-0.5 object-contain ${item.isActive ? "" : "opacity-70 grayscale"} transition-all`} />
                ) : (
                  <Icon className="h-5 w-5 mb-0.5" strokeWidth={item.isActive ? 2.5 : 2} />
                )}
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
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${isMinMatTheme ? "from-blue-500/10 to-blue-500/5 border border-blue-500/20" : "from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"} shadow-lg overflow-hidden p-1`}>
              <img 
                src={isMinMatTheme ? "/minmat/icon.png" : "/logo_s_clean.png"} 
                alt="Logo" 
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-extrabold text-white text-lg tracking-tight">StatMatik</span>
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
                href="/cupmat"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <img src="/logo_s_clean.png" alt="CupMat" className="h-4 w-4 object-contain" />
                <span>CupMat</span>
              </Link>
              <Link
                href="/minmat"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <img src="/minmat/icon.png" alt="MinMat" className="h-4 w-4 object-contain" />
                <span>MinMat</span>
              </Link>
              <Link
                href={process.env.NODE_ENV === "development" ? "/minlan" : "https://statmatik.com/minlan"}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <img src="/minlan-logo.png" alt="MinLan" className="h-4 w-4 object-contain rounded-sm" />
                <span>MinLan</span>
              </Link>
              <Link
                href="/haberler"
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-zinc-200 text-sm font-semibold"
              >
                <img src="/newsglo-logo.jpg" alt="NewsGlo" className="h-4 w-4 object-contain rounded-sm" />
                <span>NewsGlo</span>
              </Link>
            </div>
          </div>

          {/* Info, Help and Language Section */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400">
                {appLanguageLabel}
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
                <span>{aboutLabel}</span>
              </button>
              <button
                type="button"
                onClick={triggerHelp}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-bold transition"
              >
                <HelpCircle className="h-4 w-4 text-sky-400" />
                <span>{helpLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
