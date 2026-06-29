"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { TournamentGate } from "@/components/TournamentGate";
import { AllGroupTables } from "@/components/groups/GroupTable";
import { GroupMatchEditor } from "@/components/groups/GroupMatchEditor";
import { GeneralStandingsTable, standingsTranslations } from "@/components/groups/GeneralStandingsTable";
import { ThirdPlaceStandingsTable } from "@/components/groups/ThirdPlaceStandingsTable";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";

export default function GroupsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<"groups" | "general" | "thirds">("groups");

  const currentLang = (locale in standingsTranslations ? locale : "en") as keyof typeof standingsTranslations;
  const labels = standingsTranslations[currentLang];

  return (
    <PageShell title={t("groups.title")} subtitle={t("groups.subtitle")}>
      <TournamentGate>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-8 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "groups"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {labels.groupTables}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "general"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {labels.title}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("thirds")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "thirds"
                ? "border-emerald-500 text-emerald-400 font-extrabold"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {locale === "tr" ? "En İyi 3.ler" : "Best 3rd Places"}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "groups" && (
          <div className="space-y-8">
            <AllGroupTables />
            <GroupMatchEditor />
          </div>
        )}
        {activeTab === "general" && <GeneralStandingsTable />}
        {activeTab === "thirds" && <ThirdPlaceStandingsTable />}

      </TournamentGate>
    </PageShell>
  );
}
