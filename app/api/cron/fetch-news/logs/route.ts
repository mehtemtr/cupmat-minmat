import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CRON_SECRET = process.env.CRON_SECRET || "";
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || "";

function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const providedBearer = authHeader?.replace("Bearer ", "") || "";
  const providedAdminSecret = request.headers.get("x-admin-secret") || "";

  const { searchParams } = new URL(request.url);
  const queryAdminSecret = searchParams.get("adminSecret") || "";

  return (
    (Boolean(CRON_SECRET) && providedBearer === CRON_SECRET) ||
    (Boolean(ADMIN_API_SECRET) &&
      (providedAdminSecret === ADMIN_API_SECRET || queryAdminSecret === ADMIN_API_SECRET))
  );
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const { data: logs, error } = await supabaseAdmin
      .from("news_fetch_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: logs?.length || 0, logs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
