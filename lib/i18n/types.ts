import type en from "@/dictionaries/en.json";

export type Locale = "en" | "tr" | "es" | "fr" | "de" | "pt" | "ar" | "ko" | "it";

export type Dictionary = typeof en;

export const locales: Locale[] = ["tr", "de", "en", "es", "fr", "it", "pt", "ar", "ko"];

export const defaultLocale: Locale = "tr";

export const LOCALE_COOKIE = "wc2026-locale";
