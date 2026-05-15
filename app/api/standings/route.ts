import { NextResponse } from "next/server";
import type { MatchResult } from "@/lib/types/tournament";
import { getGroupStandingsMap } from "@/lib/knockout";

export async function POST(request: Request) {
  const { matches, predictions = {} } = (await request.json()) as { 
    matches: MatchResult[],
    predictions?: Record<string, { home: number; away: number }>
  };

  if (!Array.isArray(matches)) {
    return NextResponse.json({ error: "matches array required" }, { status: 400 });
  }

  const standings = getGroupStandingsMap(matches, predictions);
  return NextResponse.json({ standings });
}
