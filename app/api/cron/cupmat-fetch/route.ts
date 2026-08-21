import { NextResponse } from "next/server";
import { fetchAndStoreDailyMatches } from "@/lib/api-football-cupmat";

export const dynamic = "force-dynamic";

// This route should be called by a CRON job (e.g., Vercel Cron or Cloudflare Workers)
// It can also be protected by checking an Authorization header.
export async function GET(req: Request) {
  try {
    // Basic authorization to prevent public abuse
    const authHeader = req.headers.get("authorization");
    /* GEÇİCİ OLARAK KAPATILDI (Yerel test için)
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    // You can optionally pass a date parameter for backfilling
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // format: YYYY-MM-DD

    console.log(`[Cron:CupMat] Starting match sync... Date: ${dateParam || "Today"}`);
    
    // Call the unified sync function
    let result;
    if (dateParam) {
      result = await fetchAndStoreDailyMatches(dateParam);
    } else {
      // Fetch today
      const today = new Date().toISOString().split("T")[0];
      const resToday = await fetchAndStoreDailyMatches(today);
      
      // Fetch yesterday
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split("T")[0];
      const resYesterday = await fetchAndStoreDailyMatches(yesterday);
      
      // Günde sadece 1 kez (Örn: UTC 04:00) gelecek 7 günün maçlarını çek (100 API limitini aşmamak için)
      const currentHour = new Date().getUTCHours();
      let futureInserted = 0;
      let futureUpdated = 0;
      const futureLogs: string[] = [];

      if (currentHour === 4) {
        futureLogs.push("[Cron:CupMat] Scheduled daily pull for upcoming 7 days...");
        for (let i = 1; i <= 7; i++) {
          const futureDateObj = new Date();
          futureDateObj.setDate(futureDateObj.getDate() + i);
          const futureDateStr = futureDateObj.toISOString().split("T")[0];
          const resFuture = await fetchAndStoreDailyMatches(futureDateStr);
          futureInserted += resFuture.inserted || 0;
          futureUpdated += resFuture.updated || 0;
          if (resFuture.logs) futureLogs.push(...resFuture.logs);
        }
      }
      
      result = {
        success: resToday.success && resYesterday.success,
        inserted: (resToday.inserted || 0) + (resYesterday.inserted || 0) + futureInserted,
        updated: (resToday.updated || 0) + (resYesterday.updated || 0) + futureUpdated,
        logs: [...(resToday.logs || []), ...(resYesterday.logs || []), ...futureLogs]
      };
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Match sync completed successfully.",
        inserted: result.inserted,
        updated: result.updated,
        logs: result.logs
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to sync matches.",
        logs: result.logs
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Cron:CupMat] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
