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

const dictionaries: Record<Locale, Dictionary> = { en, tr };

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match?.[1];
  return value === "en" || value === "tr" ? value : null;
}

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
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
    const saved = readCookieLocale();
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
      return getNestedValue(dictionary, key) ?? key;
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
