import { NextResponse } from "next/server";
import { getMinMatLeaderboard, addMinMatScore, getMinMatRewardPodium } from "@/lib/store/minmat-leaderboard-store"; // klasör yolunuza göre ayarlayın

// Veri çekerken filtre parametresini okur
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const type = searchParams.get("type") || "leaderboard";

  if (type === "podium") {
    const podium = await getMinMatRewardPodium();
    return NextResponse.json(podium);
  }

  const leaderboard = await getMinMatLeaderboard(filter);
  return NextResponse.json(leaderboard);
}

// Yeni puanı kaydeder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await addMinMatScore(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Kaydedilemedi" }, { status: 500 });
  }
}
