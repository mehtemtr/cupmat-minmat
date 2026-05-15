"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home, Menu, Trophy, X } from "lucide-react";
import { useState } from "react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import type { Locale } from "@/lib/i18n/types";

const navKeys = [
  { href: "/cupmat", key: "nav.home" },
  { href: "/teams", key: "nav.teams" },
  { href: "/groups", key: "nav.groups" },
  { href: "/venues", key: "nav.venues" },
  { href: "/predictions", key: "nav.predictions" },
] as const;

export function Header() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide header on portal page
  if (pathname === "/") return null;

  const toggleLocale = () => {
    const next: Locale = locale === "en" ? "tr" : "en";
    setLocale(next);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060b14]/80 backdrop-blur-xl">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
        aria-hidden
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
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
            CupMat <span className="text-emerald-400">2026</span>
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
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white"
            aria-label={t("language.toggle")}
          >
            <Globe className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">
              {locale === "en" ? t("language.tr") : t("language.en")}
            </span>
            <span className="sm:hidden uppercase">{locale}</span>
          </button>
          
          {isSignedIn ? (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-lg border border-white/10 hover:border-emerald-400/40 transition-colors"
                }
              }}
            />
          ) : (
            <SignInButton mode="modal">
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
  );
}
