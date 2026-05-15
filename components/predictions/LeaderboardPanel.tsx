"use client";

import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";
import type { PredictionSubmission } from "@/lib/types/tournament";

export function LeaderboardPanel() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<PredictionSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(data.leaderboard ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Medal className="h-5 w-5 text-amber-400" />
        {t("predictions.leaderboard")}
      </h3>
      {loading ? (
        <p className="text-sm text-zinc-500">{t("predictions.loading")}</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i === 0
                      ? "bg-amber-500/20 text-amber-300"
                      : i === 1
                        ? "bg-zinc-400/20 text-zinc-300"
                        : i === 2
                          ? "bg-orange-600/20 text-orange-300"
                          : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-white">
                  {entry.displayName}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {entry.points}
              </span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
