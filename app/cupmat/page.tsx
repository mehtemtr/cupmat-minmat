"use client";

import { Hero } from "@/components/Hero";
import { OverviewCards } from "@/components/OverviewCards";
import { SplashGate } from "@/components/SplashGate";

export default function CupMatHomePage() {
  return (
    <SplashGate>
      <div className="pt-8">
        <Hero />
        <OverviewCards />
      </div>
    </SplashGate>
  );
}
