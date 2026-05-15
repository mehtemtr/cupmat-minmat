"use client";

import Link from "next/link";
import { Grid3x3, MapPin, Users } from "lucide-react";
import { useTranslation } from "@/contexts/LocaleContext";

const cards = [
  {
    key: "teams" as const,
    href: "/teams",
    icon: Users,
    accent: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    key: "groups" as const,
    href: "/groups",
    icon: Grid3x3,
    accent: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    key: "hosts" as const,
    href: "/venues",
    icon: MapPin,
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

export function OverviewCards() {
  const { t, dictionary } = useTranslation();

  return (
    <section id="overview" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("overview.sectionTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            {t("overview.sectionSubtitle")}
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-3 list-none p-0 m-0">
          {cards.map(({ key, href, icon: Icon, accent, iconColor }) => {
            const item = dictionary.overview[key];
            return (
              <li key={key} className="list-none">
                <Link
                  href={href}
                  className={`group block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-8 transition hover:border-white/20 hover:shadow-xl hover:shadow-black/20`}
                >
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </span>
                  <p className="font-mono text-5xl font-bold tracking-tight text-white">
                    {item.value}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {(["usa", "canada", "mexico"] as const).map((host) => (
            <span
              key={host}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t(`hosts.${host}`)}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
