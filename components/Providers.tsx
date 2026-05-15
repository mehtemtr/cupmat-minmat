"use client";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { TournamentProvider } from "@/contexts/TournamentContext";
import type { Locale } from "@/lib/i18n/types";

type ProvidersProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
};

export function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <TournamentProvider>{children}</TournamentProvider>
    </LocaleProvider>
  );
}
