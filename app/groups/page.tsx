"use client";

import { PageShell } from "@/components/PageShell";
import { TournamentGate } from "@/components/TournamentGate";
import { AllGroupTables } from "@/components/groups/GroupTable";
import { GroupMatchEditor } from "@/components/groups/GroupMatchEditor";
import { useTranslation } from "@/contexts/LocaleContext";

export default function GroupsPage() {
  const { t } = useTranslation();

  return (
    <PageShell title={t("groups.title")} subtitle={t("groups.subtitle")}>
      <TournamentGate>
        <AllGroupTables />
        <GroupMatchEditor />
      </TournamentGate>
    </PageShell>
  );
}
