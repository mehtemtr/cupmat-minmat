"use client";

import { useEffect, useRef } from "react";

export default function LazyCronAgent() {
  const hasRunTodayRef = useRef(false);

  useEffect(() => {
    if (hasRunTodayRef.current) return;

    const checkAndRunAgent = async () => {
      try {
        const now = new Date();
        const turkeyTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
        const hour = turkeyTime.getHours();
        const todayStr = turkeyTime.toISOString().split("T")[0];

        const lastFullRunStr = localStorage.getItem("ai_agent_last_full_run");
        const lastTeamsRunStr = localStorage.getItem("ai_agent_last_teams_run");
        const lastTeamsRun = lastTeamsRunStr ? new Date(lastTeamsRunStr) : new Date(0);
        const hoursSinceTeamsRun = (now.getTime() - lastTeamsRun.getTime()) / (1000 * 60 * 60);

        // 20:00 KURALI (Türkiye saati) - Tam ajanı çalıştır
        if (hour >= 20 && lastFullRunStr !== todayStr) {
          console.log("🤖 20:00 KURALI: Tam AI Agent çalıştırılıyor...");
          fetch("/api/ai-agent?task=full", { method: "GET" }).catch(() => {});
          localStorage.setItem("ai_agent_last_full_run", todayStr);
          hasRunTodayRef.current = true;
        }
        // 4 SAATLİK KADRO KURALI (00:00 - 20:00 arası)
        else if (hour < 20 && hoursSinceTeamsRun >= 4) {
          console.log("🤖 4 SAATLİK KURAL: Kadro güncellemesi çalıştırılıyor...");
          fetch("/api/ai-agent?task=teams_only", { method: "GET" }).catch(() => {});
          localStorage.setItem("ai_agent_last_teams_run", now.toISOString());
        }
        // 20:00 - 00:00 ARASI KİLİT: 4 saatlik kontrolü askıya al
        else if (hour >= 20) {
          console.log("🤖 20:00 SONRASI: Kadro güncellemeleri askıya alındı");
        }
      } catch (error) {
        console.error("Lazy Cron hatası:", error);
      }
    };

    checkAndRunAgent();
    const interval = setInterval(checkAndRunAgent, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
