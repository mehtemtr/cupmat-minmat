import { NextResponse } from "next/server";
import { runAiAgent, updateTeamRosters, generatePredictions } from "@/lib/ai-sports-agent";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300; // 5 dakika - uzun süren işlemler için

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const task = searchParams.get("task") || "full";
    const force = searchParams.get("force") === "true";

    const authHeader = request.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const secret = searchParams.get("secret") || bearerSecret;

    // Güvenlik kontrolü (sadece full task ve secret ile korunur, diğerleri public)
    const CRON_SECRET = process.env.CRON_SECRET || process.env.NEXT_PUBLIC_CRON_SECRET;
    const isAuthorized = !CRON_SECRET || 
      secret === process.env.CRON_SECRET || 
      secret === process.env.NEXT_PUBLIC_CRON_SECRET;

    if ((task === "full" || task === "bulk_update") && !isAuthorized) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    console.log(`🤖 AI Agent çalıştırılıyor: task=${task}, force=${force}`);

    let result;

    switch (task) {
      case "bulk_get":
        console.log("🔍 bulk_get çalışıyor, supabaseAdmin:", !!supabaseAdmin);
        console.log("🔍 SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30));
        console.log("🔍 SERVICE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "VAR" : "YOK");
        
        const { data: profilesData, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id, email, nickname, created_at")
          .order("created_at", { ascending: false });
        
        if (profilesError) {
          console.error("❌ Supabase Hatası:", profilesError);
          throw profilesError;
        }
        console.log("✅ profilesData alındı:", profilesData?.length, "kayıt");
        return NextResponse.json(profilesData || []);
        
      case "roster":
      case "teams_only":
        result = await updateTeamRosters();
        break;
      case "predictions":
        const { generateGroupFixtures } = await import("@/lib/fixtures");
        const allMatches = generateGroupFixtures();
        result = await generatePredictions(allMatches as any);
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
    const { searchParams } = new URL(request.url);
    const taskParam = searchParams.get("task");
    
    const authHeader = request.headers.get("authorization");
    const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    let body: any = {};
    let task: string = "full";
    let secret: string | null = null;

    if (taskParam) {
      task = taskParam;
      secret = searchParams.get("secret") || bearerSecret;
      body = await request.json();
    } else {
      body = await request.json();
      task = body.task || "full";
      secret = body.secret || bearerSecret;
    }

    const CRON_SECRET = process.env.CRON_SECRET || process.env.NEXT_PUBLIC_CRON_SECRET;
    const isAuthorized = !CRON_SECRET || 
      secret === process.env.CRON_SECRET || 
      secret === process.env.NEXT_PUBLIC_CRON_SECRET;
    
    if ((task === "full" || task === "predictions" || task === "roster" || task === "teams_only") && !isAuthorized) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    console.log(`🤖 AI Agent POST ile çalıştırılıyor: task=${task}`);

    if (task === "bulk_update") {
      if (!Array.isArray(body)) {
        return NextResponse.json({ error: "Geçersiz format: dizi bekleniyor" }, { status: 400 });
      }

      const updates = body.map((profile: any) => ({
        id: profile.id,
        nickname: profile.nickname?.trim() || null,
      }));

      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;

      return NextResponse.json({ success: true, updated: updates.length });
    }

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
