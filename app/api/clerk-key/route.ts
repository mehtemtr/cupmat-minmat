import { NextResponse } from "next/server";

export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    return NextResponse.json(
      { error: "Clerk publishable key bulunamadı" },
      { status: 500 }
    );
  }

  return NextResponse.json({ publishableKey });
}
