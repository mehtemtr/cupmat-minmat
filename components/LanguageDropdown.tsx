"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { locales, type Locale } from "@/lib/i18n/types";

interface LanguageDropdownProps {
  buttonClassName?: string;
  showFullLabelOnDesktop?: boolean;
}

export function LanguageDropdown({ buttonClassName, showFullLabelOnDesktop = false }: LanguageDropdownProps) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: Locale) => {
    setLocale(lang);
    setIsOpen(false);
  };

  const defaultButtonClass = "flex items-center gap-1 sm:gap-2 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-white";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || defaultButtonClass}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
        {showFullLabelOnDesktop ? (
          <>
            <span className="hidden sm:inline">
              {t(`language.${locale}`)}
            </span>
            <span className="sm:hidden uppercase">{locale}</span>
          </>
        ) : (
          <span className="uppercase">{locale}</span>
        )}
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-white/10 bg-[#060b14]/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 z-[100] overflow-hidden p-1 animate-in fade-in slide-in-from-top-1 duration-100">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full text-left rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                locale === lang
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{t(`language.${lang}`)}</span>
              {locale === lang && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
