"use client";

import { PageShell } from "@/components/PageShell";
import { TournamentGate } from "@/components/TournamentGate";
import { PredictionWizard } from "@/components/predictions/PredictionWizard";
import { useTranslation } from "@/contexts/LocaleContext";

export default function PredictionsPage() {
  const { t } = useTranslation();

  return (
    <PageShell
      title={t("predictions.title")}
      subtitle={t("predictions.subtitle")}
    >
      <TournamentGate>
        <PredictionWizard />
      </TournamentGate>
    </PageShell>
  );
}
