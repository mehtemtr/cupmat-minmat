import { NextResponse } from "next/server";
import { runAiAgent, updateTeamRosters, generatePredictions } from "@/lib/ai-sports-agent";

export const maxDuration = 300; // 5 dakika - uzun süren işlemler için

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const task = searchParams.get("task") || "full";
    const force = searchParams.get("force") === "true";
    const secret = searchParams.get("secret");

    // Güvenlik kontrolü (sadece full task ve secret ile korunur, diğerleri public)
    const CRON_SECRET = process.env.CRON_SECRET || process.env.NEXT_PUBLIC_CRON_SECRET;
    if (task === "full" && CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    console.log(`🤖 AI Agent çalıştırılıyor: task=${task}, force=${force}`);

    let result;

    switch (task) {
      case "roster":
      case "teams_only":
        result = await updateTeamRosters();
        break;
      case "predictions":
        const { officialGroups } = await import("@/data/official-groups");
        const allMatches = officialGroups.flatMap(g => g.matches || []);
        result = await generatePredictions(allMatches);
        break;
      case "full":
      default:
        result = await runAiAgent();
        break;
    }

    return NextResponse.json({
      success: true,
      task,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI Agent hatası:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Bilinmeyen hata" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task = "full", secret } = body;

    const CRON_SECRET = process.env.CRON_SECRET;
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    console.log(`🤖 AI Agent POST ile çalıştırılıyor: task=${task}`);

    let result;
    switch (task) {
      case "roster":
        result = await updateTeamRosters();
        break;
      case "full":
      default:
        result = await runAiAgent();
        break;
    }

    return NextResponse.json({
      success: true,
      task,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI Agent POST hatası:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Bilinmeyen hata" 
      },
      { status: 500 }
    );
  }
}
