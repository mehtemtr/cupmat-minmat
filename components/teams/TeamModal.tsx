"use client";

import Image from "next/image";
import { X, User, Users } from "lucide-react";
import type { Team } from "@/lib/types/tournament";
import { getTeamName } from "@/data/teams";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";

type TeamModalProps = {
  team: Team | null;
  onClose: () => void;
};

export function TeamModal({ team, onClose }: TeamModalProps) {
  const { locale } = useLocale();
  const { t } = useTranslation();

  if (!team) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1424] shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-white/10 bg-[#0c1424] p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-20 overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image
                src={team.flagUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {getTeamName(team, locale)}
              </h2>
              <p className="text-sm text-zinc-400">
                {t("teams.group")} {team.group} · FIFA #{team.fifaRank}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              <User className="h-4 w-4" />
              {t("teams.manager")}
            </h3>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-semibold text-white">{team.manager.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {team.manager.nationality} · {team.manager.age}{" "}
                {t("teams.years")} · {team.manager.tenure}
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              <Users className="h-4 w-4" />
              {t("teams.squad")}
            </h3>
            <ul className="space-y-2">
              {team.players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{player.name}</p>
                    <p className="text-xs text-zinc-500">
                      {player.position} · {player.club}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-400">{player.age}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
