"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Team } from "@/lib/types/tournament";
import { getTeamName } from "@/data/teams";
import { useLocale } from "@/contexts/LocaleContext";

type TeamCardProps = {
  team: Team;
  onSelect: (team: Team) => void;
};

export function TeamCard({ team, onSelect }: TeamCardProps) {
  const { locale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => onSelect(team)}
      className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
    >
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
        <Image
          src={team.flagUrl}
          alt=""
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">
          {getTeamName(team, locale)}
        </p>
        <p className="text-xs text-zinc-500">
          FIFA #{team.fifaRank} · {team.confederation}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
    </button>
  );
}
