import { NextResponse } from "next/server";
import standingsData from "@/data/standings-data.json";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = parseInt(searchParams.get("tournament") || "2", 10);

  const standingsMap = standingsData as Record<string, any>;
  const standings = standingsMap[tournamentId.toString()] || [];

  return NextResponse.json({
    success: true,
    tournamentId,
    standings,
    isLive: false,
    message: "Resmi 2026-2027 Puan Tablosu"
  });
}
