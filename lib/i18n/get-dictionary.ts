import type { Dictionary, Locale } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  tr: () => import("@/dictionaries/tr.json").then((m) => m.default),
  de: () => import("@/dictionaries/de.json").then((m) => m.default),
  fr: () => import("@/dictionaries/fr.json").then((m) => m.default),
es: () => import("@/dictionaries/es.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}