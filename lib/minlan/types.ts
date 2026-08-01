import { Locale } from "@/lib/i18n/types";

export type LanguageCode = Locale;

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية (Arapça)", flag: "🇸🇦" },
  { code: "ko", name: "한국어 (Korece)", flag: "🇰🇷" },
];

export type CategoryTier = 1 | 2 | 3 | 4;

export interface MinlanCategory {
  id: string;
  slug: string;
  name_tr: string;
  name_en?: string;
  name_de?: string;
  name_fr?: string;
  name_es?: string;
  name_it?: string;
  name_pt?: string;
  name_ar?: string;
  name_ko?: string;
  icon: string;
  tier: CategoryTier; // 1: Open, 2: Countdown, 3: Coming Soon, 4: Secret Mystery
  unlock_requirement_level: number;
  countdown_target_date?: string | null;
  display_order: number;
  enabled: boolean;
}

export interface MinlanWord {
  id: string;
  category_id: string;
  word_order: number;
  lang_tr: string;
  lang_en: string;
  lang_de: string;
  lang_fr: string;
  lang_es: string;
  lang_it: string;
  lang_pt: string;
  lang_ar: string;
  lang_ko: string;
}

export interface MinlanCard {
  id: string; // Unique instance ID for the board card
  wordPairId: string; // ID linking native & target cards
  text: string;
  language: LanguageCode;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MinlanCommunityStats {
  total_card_matches: number;
  target_card_matches: number;
}
