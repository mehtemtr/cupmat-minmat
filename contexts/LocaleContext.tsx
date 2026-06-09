"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Dictionary, Locale } from "@/lib/i18n/types";
import { defaultLocale, LOCALE_COOKIE } from "@/lib/i18n/types";
import { getNestedValue } from "@/lib/i18n/nested";
import en from "@/dictionaries/en.json";
import tr from "@/dictionaries/tr.json";
import es from "@/dictionaries/es.json";
import fr from "@/dictionaries/fr.json";
import de from "@/dictionaries/de.json";
import pt from "@/dictionaries/pt.json";
import ar from "@/dictionaries/ar.json";
import ko from "@/dictionaries/ko.json";
import it from "@/dictionaries/it.json";

const dictionaries: Record<Locale, Dictionary> = { en, tr, es, fr, de, pt, ar, ko, it };

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readPersistedLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  
  // Try cookie first
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const cookieValue = match?.[1];
  const validLocales = ["en", "tr", "es", "fr", "de", "pt", "ar", "ko", "it"];
  if (cookieValue && validLocales.includes(cookieValue)) {
    return cookieValue as Locale;
  }

  // Try localStorage
  const localValue = localStorage.getItem(LOCALE_COOKIE);
  if (localValue && validLocales.includes(localValue)) {
    return localValue as Locale;
  }

  return null;
}

function persistLocale(locale: Locale) {
  // Save to cookie
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  // Save to localStorage for sync with MinMat
  localStorage.setItem(LOCALE_COOKIE, locale);
  document.documentElement.lang = locale;
}

type LocaleProviderProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
};

export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readPersistedLocale();
    if (saved) {
      setLocaleState(saved);
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const dictionary = dictionaries[locale];

  const t = useCallback(
    (key: string) => {
      return getNestedValue(dictionary, key) ?? getNestedValue(en, key) ?? key;
    },
    [dictionary],
  );

  useEffect(() => {
    if (hydrated) {
      document.documentElement.lang = locale;
    }
  }, [hydrated, locale]);

  const value = useMemo(
    () => ({ locale, dictionary, setLocale, t }),
    [locale, dictionary, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { t, dictionary, locale } = useLocale();
  return { t, dictionary, locale };
}
