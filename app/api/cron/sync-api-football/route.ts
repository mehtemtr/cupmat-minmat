import { NextResponse } from "next/server";
import { syncApiFootballScores } from "@/lib/api-football";

const CRON_SECRET = process.env.CRON_SECRET || "";
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || "";

export async function POST(request: Request) {
  try {
    // 1. Authorization checks
    const authHeader = request.headers.get("authorization");
    const providedBearer = authHeader?.replace("Bearer ", "") || "";
    const providedAdminSecret = request.headers.get("x-admin-secret") || "";

    const { searchParams } = new URL(request.url);
    const queryAdminSecret = searchParams.get("adminSecret") || "";

    const isAuthorized =
      (CRON_SECRET && providedBearer === CRON_SECRET) ||
      (ADMIN_API_SECRET && (providedAdminSecret === ADMIN_API_SECRET || queryAdminSecret === ADMIN_API_SECRET));

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stage = "matchday_1" } = await request.json().catch(() => ({}));

    // 2. Sync match scores and player stats from API-Football
    const syncLogs = await syncApiFootballScores(stage);

    // 3. Trigger recalculation of H2H duels and standings internally
    const origin = new URL(request.url).origin;
    const triggerUrl = `${origin}/api/fantasy/trigger-matchday`;

    console.log(`[Sync-API-Football] Triggering H2H duel calculation at ${triggerUrl}...`);
    
    const triggerRes = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": ADMIN_API_SECRET,
      },
      body: JSON.stringify({
        stage,
        action: "all",
      }),
    });

    let triggerReport = "Not triggered or failed";
    if (triggerRes.ok) {
      const triggerData = await triggerRes.json();
      triggerReport = triggerData.reports || "H2H duel calculation finished successfully.";
    } else {
      const triggerErr = await triggerRes.text();
      console.error(`[Sync-API-Football] H2H calculation failed:`, triggerErr);
      triggerReport = `Failed H2H trigger: ${triggerErr}`;
    }

    return NextResponse.json({
      success: true,
      logs: syncLogs,
      triggerReport,
    });
  } catch (error: any) {
    console.error("[Sync-API-Football] Cron task failed:", error);
    return NextResponse.json(
      { error: "API-Football sync failed", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

// Support GET requests for easy browser/manual testing if adminSecret query is provided
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryAdminSecret = searchParams.get("adminSecret") || "";
    const stage = searchParams.get("stage") || "matchday_1";

    if (!ADMIN_API_SECRET || queryAdminSecret !== ADMIN_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call POST handler internally
    const mockRequest = new Request(request.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": ADMIN_API_SECRET,
      },
      body: JSON.stringify({ stage }),
    });

    return POST(mockRequest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
