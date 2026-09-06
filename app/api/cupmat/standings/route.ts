import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = parseInt(searchParams.get("tournament") || "2", 10);

  // Boşaltıldı - Kullanıcıdan gelecek güncel takım listesi bekleniyor
  return NextResponse.json({
    success: true,
    tournamentId,
    standings: [],
    isLive: false,
    message: "Grup kuraları ve takım listesi güncelleniyor."
  });
}
