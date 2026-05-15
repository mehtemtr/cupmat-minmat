import type en from "@/dictionaries/en.json";

export type Locale = "en" | "tr";

export type Dictionary = typeof en;

export const locales: Locale[] = ["en", "tr"];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "wc2026-locale";
