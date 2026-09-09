import { NextResponse } from "next/server";
import { syncCupMatAll } from "@/lib/api-football-cupmat";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (e) {
  // Redis not configured or local environment
}

export const dynamic = "force-dynamic";

async function handleSync(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || undefined; // format: YYYY-MM-DD

    console.log(`[Cron:CupMat] Starting unified match sync... Date: ${dateParam || "Auto (Yesterday/Today/Tomorrow + Season Schedulers)"}`);
    
    // Call unified master sync
    const result = await syncCupMatAll(dateParam);

    // Log to Redis if available
    if (redis) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        success: result.success,
        inserted: result.inserted,
        updated: result.updated,
        logs: result.logs
      };
      try {
        await redis.lpush("cupmat:cron_logs", JSON.stringify(logEntry));
        await redis.ltrim("cupmat:cron_logs", 0, 49); // Keep last 50 logs
      } catch(e) {
        console.error("Redis logging failed:", e);
      }
    }

    return NextResponse.json({
      success: result.success,
      message: "CupMat sync completed successfully.",
      inserted: result.inserted,
      updated: result.updated,
      logs: result.logs
    }, { status: result.success ? 200 : 500 });

  } catch (error: any) {
    console.error("[Cron:CupMat] Fatal error:", error);
    if (redis) {
      try {
        await redis.lpush("cupmat:cron_logs", JSON.stringify({
          timestamp: new Date().toISOString(),
          success: false,
          inserted: 0,
          updated: 0,
          logs: [`[FATAL ERROR] ${error.message}`]
        }));
        await redis.ltrim("cupmat:cron_logs", 0, 49);
      } catch(e) {}
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

