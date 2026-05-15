"use client";

import { useState } from "react";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamsByGroup } from "@/data/teams";
import type { Team } from "@/lib/types/tournament";
import { PageShell } from "@/components/PageShell";
import { TeamCard } from "@/components/teams/TeamCard";
import { TeamModal } from "@/components/teams/TeamModal";
import { useTranslation } from "@/contexts/LocaleContext";

export default function TeamsPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Team | null>(null);

  return (
    <PageShell title={t("teams.title")} subtitle={t("teams.subtitle")}>
      {/* wrapper */}
      <section className="space-y-12">
        {GROUP_IDS.map((group) => (
          <section key={group} id={`group-${group}`}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                {group}
              </span>
              {t("teams.group")} {group}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
              {getTeamsByGroup(group).map((team) => (
                <li key={team.id} className="list-none">
                  <TeamCard team={team} onSelect={setSelected} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
      <TeamModal team={selected} onClose={() => setSelected(null)} />
    </PageShell>
  );
}
