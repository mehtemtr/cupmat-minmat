"use client";

import { useEffect, useRef } from "react";

export default function LazyCronAgent() {
  const hasRunTodayRef = useRef(false);

  useEffect(() => {
    if (hasRunTodayRef.current) return;

    const checkAndRunAgent = async () => {
      try {
        // Disabled: Client-side LazyCronAgent was causing Vercel CPU spikes
        // because multiple visitors would trigger the heavy AI agent simultaneously.
        // We now rely on GitHub Actions / Vercel Crons for automated background tasks.
        const now = new Date();
        const turkeyTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
        const hour = turkeyTime.getHours();
        const todayStr = turkeyTime.toISOString().split("T")[0];

        const lastFullRunStr = localStorage.getItem("ai_agent_last_full_run");
        if (hour >= 20 && lastFullRunStr !== todayStr) {
          localStorage.setItem("ai_agent_last_full_run", todayStr);
          hasRunTodayRef.current = true;
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
