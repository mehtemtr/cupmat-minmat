"use client";

import { useTranslation } from "@/contexts/LocaleContext";
import { useTournament } from "@/contexts/TournamentContext";

type TournamentGateProps = {
  children: React.ReactNode;
};

export function TournamentGate({ children }: TournamentGateProps) {
  const { ready } = useTournament();
  const { t } = useTranslation();

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">{t("predictions.loading")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
