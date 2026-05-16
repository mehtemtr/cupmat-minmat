import type en from "@/dictionaries/en.json";

export type Locale = "en" | "tr" | "es" | "fr" | "de";

export type Dictionary = typeof en;

export const locales: Locale[] = ["en", "tr", "es", "fr", "de"];

export const defaultLocale: Locale = "tr";

export const LOCALE_COOKIE = "wc2026-locale";
