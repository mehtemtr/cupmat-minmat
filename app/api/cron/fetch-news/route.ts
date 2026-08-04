export const runtime = 'edge';
import { NextResponse } from "next/server";
import { fetchAndStoreNews } from "@/lib/news-fetcher";

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
    const result = await fetchAndStoreNews();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
