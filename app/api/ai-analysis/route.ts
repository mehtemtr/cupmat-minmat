import { NextResponse } from "next/server";
import { generateGroupFixtures } from "@/lib/fixtures";
import { generateAiPredictions } from "@/lib/ai-predictions";
import type { Locale } from "@/lib/i18n/types";

export async function POST(request: Request) {
  const { locale } = (await request.json()) as { locale?: Locale };
  const validLocale: Locale = locale === "tr" ? "tr" : "en";
  const matches = generateGroupFixtures();
  const result = generateAiPredictions(matches, validLocale);

  return NextResponse.json(result);
}
