import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    message: "News compilation is currently paused on this main server (0 CPU mode). Moving news engine to dedicated server.",
    countriesScanned: 0,
    newsFound: 0,
    newsInserted: 0,
    newsSkipped: 0,
    logs: ["News compilation paused."],
  });
}

export async function POST(request: Request) {
  return GET(request);
}
