"use client";

import { useEffect, useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { TEAMS } from "@/data/teams";
import {
  Users,
  Award,
  History,
  Activity,
  ArrowUpDown,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";

interface PlayerStat {
  id: string;
  player_name: string;
  team_id: string;
  player_position: string;
  player_number: number;
  club: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  league: string | null;
  age: number | null;
}

interface ClubCount {
  club: string;
  count: number;
}

interface CityCount {
  city: string;
  count: number;
}

interface CountryAverage {
  teamId: string;
  teamNameTr: string;
  teamNameEn: string;
  avgAge: number;
  avgHeight: number;
  avgWeight: number;
  playerCount: number;
}

export default function StatisticsPage() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<"squad" | "live" | "history">("squad");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Data States
  const [youngest, setYoungest] = useState<PlayerStat[]>([]);
  const [oldest, setOldest] = useState<PlayerStat[]>([]);
  const [topClubs, setTopClubs] = useState<ClubCount[]>([]);
  const [topCities, setTopCities] = useState<CityCount[]>([]);
  const [confederations, setConfederations] = useState<Record<string, number>>({});
  const [countryAverages, setCountryAverages] = useState<CountryAverage[]>([]);

  // Filtering / Sorting Averages Table
  const [avgSearch, setAvgSearch] = useState("");
  const [avgSortField, setAvgSortField] = useState<"name" | "age" | "height" | "weight" | "players">("name");
  const [avgSortAsc, setAvgSortAsc] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/stats/player-stats");
        
        if (!res.ok) {
          throw new Error(`HTTP hatası! Durum kodu: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Sunucudan JSON yerine HTML sayfası döndü. Yeni eklenen API rotasının algılanması için lütfen terminaldeki geliştirme sunucunuzu (Next.js dev server) durdurup yeniden başlatın.");
        }

        const data = await res.json();
        
        if (data.success) {
          setYoungest(data.youngest || []);
          setOldest(data.oldest || []);
          setTopClubs(data.topClubs || []);
          setTopCities(data.topCities || []);
          setConfederations(data.confederations || {});
          setCountryAverages(data.countryAverages || []);
        } else {
          setError(data.error || "Oyuncu istatistikleri yüklenemedi.");
        }
      } catch (err: any) {
        setError(err.message || "İstatistikler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Helper to get flag URL
  const getFlagUrl = (teamId: string) => {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team || !team.code) return "";
    return `https://flagcdn.com/w40/${team.code.toLowerCase()}.png`;
  };

  const getTeamName = (teamId: string) => {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return teamId;
    return locale === "tr" ? team.nameTr : team.nameEn;
  };

  // Filter and sort country averages
  const processedAverages = useMemo(() => {
    let result = [...countryAverages];

    // Search filter
    if (avgSearch.trim() !== "") {
      const q = avgSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.teamNameTr.toLowerCase().includes(q) ||
          c.teamNameEn.toLowerCase().includes(q) ||
          c.teamId.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a.teamNameTr;
      let bVal: any = b.teamNameTr;

      if (avgSortField === "name") {
        aVal = locale === "tr" ? a.teamNameTr : a.teamNameEn;
        bVal = locale === "tr" ? b.teamNameTr : b.teamNameEn;
      } else if (avgSortField === "age") {
        aVal = a.avgAge;
        bVal = b.avgAge;
      } else if (avgSortField === "height") {
        aVal = a.avgHeight;
        bVal = b.avgHeight;
      } else if (avgSortField === "weight") {
        aVal = a.avgWeight;
        bVal = b.avgWeight;
      } else if (avgSortField === "players") {
        aVal = a.playerCount;
        bVal = b.playerCount;
      }

      if (aVal < bVal) return avgSortAsc ? -1 : 1;
      if (aVal > bVal) return avgSortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [countryAverages, avgSearch, avgSortField, avgSortAsc, locale]);

  const toggleSort = (field: "name" | "age" | "height" | "weight" | "players") => {
    if (avgSortField === field) {
      setAvgSortAsc((prev) => !prev);
    } else {
      setAvgSortField(field);
      setAvgSortAsc(true);
    }
  };

  // Static Historical Records data
  const historicalWins = [
    { countryTr: "Brezilya", countryEn: "Brazil", titles: 5, years: "1958, 1962, 1970, 1994, 2002", code: "br" },
    { countryTr: "Almanya", countryEn: "Germany", titles: 4, years: "1954, 1974, 1990, 2014", code: "de" },
    { countryTr: "İtalya", countryEn: "Italy", titles: 4, years: "1934, 1938, 1982, 2006", code: "it" },
    { countryTr: "Arjantin", countryEn: "Argentina", titles: 3, years: "1978, 1986, 2022", code: "ar" },
    { countryTr: "Fransa", countryEn: "France", titles: 2, years: "1998, 2018", code: "fr" },
    { countryTr: "Uruguay", countryEn: "Uruguay", titles: 2, years: "1930, 1950", code: "uy" },
    { countryTr: "İngiltere", countryEn: "England", titles: 1, years: "1966", code: "gb-eng" },
    { countryTr: "İspanya", countryEn: "Spain", titles: 1, years: "2010", code: "es" },
  ];

  const historicalFinals = [
    { countryTr: "Almanya", countryEn: "Germany", count: 8, wins: 4, runnersUp: 4 },
    { countryTr: "Brezilya", countryEn: "Brazil", count: 7, wins: 5, runnersUp: 2 },
    { countryTr: "İtalya", countryEn: "Italy", count: 6, wins: 4, runnersUp: 2 },
    { countryTr: "Arjantin", countryEn: "Argentina", count: 6, wins: 3, runnersUp: 3 },
    { countryTr: "Fransa", countryEn: "France", count: 4, wins: 2, runnersUp: 2 },
  ];

  const historicalScorers = [
    { name: "Miroslav Klose", countryTr: "Almanya", countryEn: "Germany", goals: 16, matches: 24, code: "de" },
    { name: "Ronaldo", countryTr: "Brezilya", countryEn: "Brazil", goals: 15, matches: 19, code: "br" },
    { name: "Gerd Müller", countryTr: "Almanya", countryEn: "Germany", goals: 14, matches: 13, code: "de" },
    { name: "Just Fontaine", countryTr: "Fransa", countryEn: "France", goals: 13, matches: 6, code: "fr" },
    { name: "Lionel Messi", countryTr: "Arjantin", countryEn: "Argentina", goals: 13, matches: 26, code: "ar" },
    { name: "Pelé", countryTr: "Brezilya", countryEn: "Brazil", goals: 12, matches: 14, code: "br" },
  ];

  return (
    <PageShell
      title={t("statsPage.title") || "İstatistikler"}
      subtitle={t("statsPage.subtitle") || "Turnuvadaki detaylı istatistikler ve rekorlar"}
    >
      {/* Navigation Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/5 pb-4 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab("squad")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "squad"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("statsPage.tabSquad") || "Kadro Analizleri"}
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "live"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          {t("statsPage.tabLive") || "Canlı İstatistik"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            activeTab === "history"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          {t("statsPage.tabHistory") || "Tarihsel Rekorlar"}
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">{t("predictions.loading") || "Yükleniyor..."}</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: SQUAD ANALYSIS */}
          {activeTab === "squad" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Country Squad Averages Section */}
              <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-400" />
                      {t("statsPage.countryAveragesTitle") || "Ülke Kadro Ortalamaları"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Takımları boy, yaş ve kilolarına göre sıralayabilirsiniz</p>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder={locale === "tr" ? "Ülke ara..." : "Search country..."}
                      value={avgSearch}
                      onChange={(e) => setAvgSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-white/5 text-xs font-semibold uppercase text-zinc-400 border-b border-white/10">
                      <tr>
                        <th onClick={() => toggleSort("players")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center w-24">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.colPlayersCount") || "Futbolcu"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("name")} className="cursor-pointer px-6 py-4 hover:text-white transition">
                          <span className="flex items-center gap-1">
                            {t("statsPage.colTeam") || "Takım"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("age")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgAge") || "Ort. Yaş"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("height")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgHeight") || "Ort. Boy"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                        <th onClick={() => toggleSort("weight")} className="cursor-pointer px-6 py-4 hover:text-white transition text-center">
                          <span className="flex items-center gap-1 justify-center">
                            {t("statsPage.avgWeight") || "Ort. Kilo"}
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {processedAverages.map((c) => (
                        <tr key={c.teamId} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-zinc-400">
                            {c.playerCount}
                          </td>
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                            <img
                              src={getFlagUrl(c.teamId)}
                              alt={c.teamNameTr}
                              className="h-5 w-7 object-cover rounded shadow-sm border border-white/10"
                            />
                            <span>{locale === "tr" ? c.teamNameTr : c.teamNameEn}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-emerald-400">{c.avgAge} {t("teams.years") || "yaş"}</td>
                          <td className="px-6 py-4 text-center text-zinc-200">{c.avgHeight} cm</td>
                          <td className="px-6 py-4 text-center text-zinc-200">{c.avgWeight} kg</td>
                        </tr>
                      ))}
                      {processedAverages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                            {t("statsPage.emptyData") || "Veri bulunamadı."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Youngest / Oldest Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Youngest Players Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.youngestTitle") || "En Genç 20 Futbolcu"}
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20 max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-white/5 font-semibold text-zinc-400 sticky top-0 backdrop-blur border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">{t("statsPage.colPlayer") || "Futbolcu"}</th>
                          <th className="px-4 py-3 text-center">{t("statsPage.colAge") || "Yaş"}</th>
                          <th className="px-4 py-3">{t("statsPage.colClub") || "Kulüp"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {youngest.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white truncate max-w-[150px]">{p.player_name}</div>
                              <div className="text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm" />
                                <span>{getTeamName(p.team_id)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-400">{p.age}</td>
                            <td className="px-4 py-3">
                              <div className="truncate max-w-[120px] text-zinc-200">{p.club}</div>
                              <div className="text-zinc-500 text-[10px]">{p.league}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Oldest Players Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.oldestTitle") || "En Yaşlı 20 Futbolcu"}
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20 max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-white/5 font-semibold text-zinc-400 sticky top-0 backdrop-blur border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3">{t("statsPage.colPlayer") || "Futbolcu"}</th>
                          <th className="px-4 py-3 text-center">{t("statsPage.colAge") || "Yaş"}</th>
                          <th className="px-4 py-3">{t("statsPage.colClub") || "Kulüp"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {oldest.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white truncate max-w-[150px]">{p.player_name}</div>
                              <div className="text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                <img src={getFlagUrl(p.team_id)} alt="" className="h-3 w-4.5 object-cover rounded-sm" />
                                <span>{getTeamName(p.team_id)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-amber-400">{p.age}</td>
                            <td className="px-4 py-3">
                              <div className="truncate max-w-[120px] text-zinc-200">{p.club}</div>
                              <div className="text-zinc-500 text-[10px]">{p.league}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>

              {/* Clubs and Confederations Grid */}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Top Clubs Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.topClubsTitle") || "En Çok Oyuncu Gönderen Kulüpler"}
                  </h2>
                  <div className="space-y-4">
                    {topClubs.map((clubInfo, idx) => {
                      const maxCount = topClubs[0]?.count || 1;
                      const percentage = (clubInfo.count / maxCount) * 100;
                      return (
                        <div key={clubInfo.club} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-zinc-200 flex items-center gap-2">
                              <span className="text-xs text-zinc-500 min-w-[20px]">#{idx + 1}</span>
                              {clubInfo.club}
                            </span>
                            <span className="font-bold text-emerald-400">{clubInfo.count} Oyuncu</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Top Birth Cities Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.topCitiesTitle") || "En Çok Oyuncu Doğan Şehirler"}
                  </h2>
                  <div className="space-y-4">
                    {topCities.map((cityInfo, idx) => {
                      const maxCount = topCities[0]?.count || 1;
                      const percentage = (cityInfo.count / maxCount) * 100;
                      return (
                        <div key={cityInfo.city} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-zinc-200 flex items-center gap-2">
                              <span className="text-xs text-zinc-500 min-w-[20px]">#{idx + 1}</span>
                              {cityInfo.city}
                            </span>
                            <span className="font-bold text-teal-400">{cityInfo.count} Oyuncu</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Confederations Card */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.confederationsTitle") || "Konfederasyon Dağılımı"}
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(confederations)
                      .sort((a, b) => b[1] - a[1])
                      .map(([confName, count]) => {
                        const totalCount = Object.values(confederations).reduce((acc, curr) => acc + curr, 0) || 1;
                        const percentage = Math.round((count / totalCount) * 100);
                        return (
                          <div key={confName} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="font-bold text-zinc-100">{confName}</span>
                                <span className="text-xs text-zinc-500 ml-2">
                                  ({confName === "UEFA" ? "Avrupa" : 
                                    confName === "CONMEBOL" ? "Güney Amerika" : 
                                    confName === "CONCACAF" ? "Kuzey/Orta Amerika" : 
                                    confName === "AFC" ? "Asya" : 
                                    confName === "CAF" ? "Afrika" : "Okyanusya"})
                                </span>
                              </div>
                              <span className="font-semibold text-emerald-400">{count} Oyuncu ({percentage}%)</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE STATS */}
          {activeTab === "live" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Info Alert banner */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-amber-400">
                <Activity className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base text-white">Canlı Turnuva Raporu Hazırlığı</h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    {t("statsPage.liveNote") || "Bu istatistikler, turnuva maçları başladığında canlı olarak otomatik güncellenecektir."}
                  </p>
                </div>
              </div>

              {/* Grid representation */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Live Scorers Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>⚽ {t("statsPage.liveScorers") || "Turnuva Gol Krallığı"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Maçlar başladığında goller burada güncellenecektir."}
                  </div>
                </div>

                {/* Live Assists Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>👟 {t("statsPage.liveAssists") || "Turnuva Asist Krallığı"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Asistler burada güncellenecektir."}
                  </div>
                </div>

                {/* Live Cards Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>🟨🟥 {t("statsPage.liveCards") || "Kart Raporları"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Sarı ve kırmızı kart istatistikleri burada listelenecektir."}
                  </div>
                </div>

                {/* Live Own Goals Placeholder */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur opacity-80">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                    <span>🤦‍♂️ {t("statsPage.liveOwnGoals") || "Kendi Kalesine Goller"}</span>
                    <span className="text-xs text-zinc-500 font-normal">TBD</span>
                  </h3>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-8 text-center text-zinc-500 text-sm">
                    {t("statsPage.liveNote") || "Kendi kalesine atılan goller burada listelenecektir."}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: HISTORICAL RECORDS */}
          {activeTab === "history" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Overview block */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">En Çok Kupa Kazanan</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">Brezilya 🇧🇷</div>
                  <p className="mt-2 text-xs text-zinc-400">Toplamda 5 şampiyonluk</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Tarihin En Golcüsü</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">M. Klose 🇩🇪</div>
                  <p className="mt-2 text-xs text-zinc-400">24 maçta 16 gol</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/10 to-transparent p-6 text-center">
                  <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">En Çok Final Oynayan</h4>
                  <div className="mt-2 text-3xl font-extrabold text-white">Almanya 🇩🇪</div>
                  <p className="mt-2 text-xs text-zinc-400">8 kez final mücadelesi</p>
                </div>
              </div>

              {/* Detail Lists Grid */}
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* Titles List */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyWins") || "Dünya Kupası Şampiyonluk Sayıları"}
                  </h3>
                  <div className="space-y-4">
                    {historicalWins.map((w, idx) => (
                      <div key={w.countryEn} className="flex items-center justify-between rounded-xl bg-black/20 p-3 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-bold">#{idx + 1}</span>
                          <img 
                            src={`https://flagcdn.com/w40/${w.code}.png`} 
                            alt="" 
                            className="h-4.5 w-7 object-cover rounded shadow-sm border border-white/10" 
                          />
                          <div>
                            <div className="font-bold text-white">{locale === "tr" ? w.countryTr : w.countryEn}</div>
                            <div className="text-[10px] text-zinc-500">{w.years}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-extrabold text-emerald-400">{w.titles}</span>
                          <span className="text-xs text-zinc-500">Kupa</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* All-time Scorers List */}
                <section className="rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyScorers") || "Dünya Kupası Tarihinin En Golcüleri"}
                  </h3>
                  <div className="space-y-4 border border-white/5 rounded-xl bg-black/20 divide-y divide-white/5">
                    {historicalScorers.map((s, idx) => (
                      <div key={s.name} className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-bold">#{idx + 1}</span>
                          <img 
                            src={`https://flagcdn.com/w40/${s.code}.png`} 
                            alt="" 
                            className="h-4.5 w-7 object-cover rounded shadow-sm border border-white/10" 
                          />
                          <div>
                            <div className="font-bold text-white">{s.name}</div>
                            <div className="text-[10px] text-zinc-500">{locale === "tr" ? s.countryTr : s.countryEn} — {s.matches} Maç</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-extrabold text-amber-400">{s.goals}</span>
                          <span className="text-xs text-zinc-500">Gol</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Finals Played list */}
                <section className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0b1329]/30 p-6 backdrop-blur">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    {t("statsPage.historyFinals") || "En Çok Final Oynayan Ülkeler"}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {historicalFinals.map((f, idx) => (
                      <div key={f.countryEn} className="rounded-xl bg-black/30 p-4 border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-white">{locale === "tr" ? f.countryTr : f.countryEn}</span>
                          <span className="text-xs text-zinc-500">#{idx + 1}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/5 rounded p-2">
                            <div className="text-xs text-zinc-500">Final</div>
                            <div className="text-lg font-bold text-white">{f.count}</div>
                          </div>
                          <div className="bg-emerald-500/10 rounded p-2 text-emerald-400">
                            <div className="text-xs text-zinc-500">Kazandı</div>
                            <div className="text-lg font-bold">{f.wins}</div>
                          </div>
                          <div className="bg-red-500/10 rounded p-2 text-red-400">
                            <div className="text-xs text-zinc-500">Kaybetti</div>
                            <div className="text-lg font-bold">{f.runnersUp}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
