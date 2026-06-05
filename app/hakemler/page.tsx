"use client";

import { PageShell } from "@/components/PageShell";
import { REFEREES } from "@/data/referees";
import { useTranslation } from "@/contexts/LocaleContext";
import Link from "next/link";

const localDict = {
  tr: {
    title: "Hakemler",
    subtitle: "2026 Dünya Kupası elit kategoride düdük çalacak resmi hakem kadrosu.",
    age: "yaş",
    yellowCards: "Sarı Kart",
    redCards: "Kırmızı Kart",
    viewDetails: "Detayları Gör →",
    eliteBadge: "FIFA Elit",
  },
  en: {
    title: "Referees",
    subtitle: "Official elite referees officiating the 2026 World Cup.",
    age: "years old",
    yellowCards: "Yellow Cards",
    redCards: "Red Cards",
    viewDetails: "View Details →",
    eliteBadge: "FIFA Elite",
  },
  de: {
    title: "Schiedsrichter",
    subtitle: "Offizielle Elite-Schiedsrichter für die Weltmeisterschaft 2026.",
    age: "Jahre",
    yellowCards: "Gelbe Karten",
    redCards: "Rote Karten",
    viewDetails: "Details anzeigen →",
    eliteBadge: "FIFA Elite",
  },
  fr: {
    title: "Arbitres",
    subtitle: "Arbitres d'élite officiels pour la Coupe du Monde 2026.",
    age: "ans",
    yellowCards: "Cartons Jaunes",
    redCards: "Cartons Rouges",
    viewDetails: "Voir les détails →",
    eliteBadge: "FIFA Élite",
  },
  es: {
    title: "Árbitros",
    subtitle: "Árbitros de élite oficiales de la Copa del Mundo 2026.",
    age: "años",
    yellowCards: "Tarjetas Amarillas",
    redCards: "Tarjetas Rojas",
    viewDetails: "Ver detalles →",
    eliteBadge: "FIFA Élite",
  },
  pt: {
    title: "Árbitros",
    subtitle: "Árbitros de elite oficiais para o Mundial de 2026.",
    age: "anos",
    yellowCards: "Cartões Amarelos",
    redCards: "Cartões Vermelhos",
    viewDetails: "Ver detalhes →",
    eliteBadge: "FIFA Elite",
  },
  it: {
    title: "Arbitri",
    subtitle: "Arbitri d'élite ufficiali della Coppa del Mondo 2026.",
    age: "anni",
    yellowCards: "Cartellini Gialli",
    redCards: "Cartellini Rossi",
    viewDetails: "Vedi dettagli →",
    eliteBadge: "FIFA Elite",
  },
  ko: {
    title: "심판진",
    subtitle: "2026 월드컵 공식 엘리트 심판진.",
    age: "세",
    yellowCards: "옐로우 카드",
    redCards: "레드 카드",
    viewDetails: "상세 보기 →",
    eliteBadge: "FIFA 엘리트",
  },
  ar: {
    title: "الحكام",
    subtitle: "طاقم الحكام النخبة الرسميين لكأس العالم 2026.",
    age: "عامًا",
    yellowCards: "البطاقات الصفراء",
    redCards: "البطاقات الحمراء",
    viewDetails: "عرض التفاصيل ←",
    eliteBadge: "النخبة الفيفا",
  }
};

export default function RefereesPage() {
  const { locale } = useTranslation();

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  return (
    <PageShell title={dict.title} subtitle={dict.subtitle}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
        {REFEREES.map((ref) => (
          <li key={ref.id} className="list-none">
            <Link
              href={`/hakemler/${ref.id}`}
              className="group relative block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/40 p-5 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex-grow">
                {/* Referee Image */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 border border-zinc-800">
                  <img
                    src={ref.image}
                    alt={ref.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 text-[10px] font-black uppercase tracking-widest shadow">
                    {dict.eliteBadge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  {ref.name}
                </h3>
                <span className="text-zinc-500 text-xs mt-1 block">
                  🌍 {ref.country[activeLang]} • {ref.age} {dict.age}
                </span>
              </div>

              <div>
                <div className="w-full border-t border-zinc-800/80 my-4" />

                {/* Card Stats Mini view */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm border border-yellow-300 flex-shrink-0" />
                      {dict.yellowCards}
                    </span>
                    <span className="font-extrabold text-yellow-400">
                      {ref.yellowCardsAvg}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-3.5 bg-red-600 rounded-sm border border-red-500 flex-shrink-0" />
                      {dict.redCards}
                    </span>
                    <span className="font-extrabold text-red-500">
                      {ref.redCardsAvg}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <span className="text-[11px] font-bold text-emerald-400 group-hover:underline">
                    {dict.viewDetails}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
