"use client";

import { PageShell } from "@/components/PageShell";
import { StadiumCard } from "@/components/venues/StadiumCard";
import { STADIUMS } from "@/data/stadiums";
import { useTranslation } from "@/contexts/LocaleContext";

export default function VenuesPage() {
  const { t } = useTranslation();

  return (
    <PageShell title={t("venues.title")} subtitle={t("venues.subtitle")}>
      <ul className="grid gap-6 sm:grid-cols-2 list-none p-0 m-0">
        {STADIUMS.map((stadium) => (
          <li key={stadium.id} className="list-none">
            <StadiumCard stadium={stadium} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
