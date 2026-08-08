import { NextResponse } from "next/server";
import { fetchAndStoreDailyMatches } from "@/lib/api-football-cupmat";

export const dynamic = "force-dynamic";

// This route should be called by a CRON job (e.g., Vercel Cron or Cloudflare Workers)
// It can also be protected by checking an Authorization header.
export async function GET(req: Request) {
  try {
    // Basic authorization to prevent public abuse
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // You can optionally pass a date parameter for backfilling
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // format: YYYY-MM-DD

    console.log(`[Cron:CupMat] Starting match sync... Date: ${dateParam || "Today"}`);
    
    // Call the unified sync function
    const result = await fetchAndStoreDailyMatches(dateParam || undefined);

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
