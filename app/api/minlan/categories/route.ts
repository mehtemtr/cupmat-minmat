import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import dataset from "@/lib/minlan/data/minlan_full_dataset.json";
import { MOCK_COMMUNITY_STATS } from "@/lib/minlan/mock-data";

export async function GET() {
  try {
    const { data: dbCategories } = await supabaseAdmin
      .from("minlan_categories")
      .select("*")
      .eq("enabled", true)
      .order("display_order", { ascending: true });

    const categories = dbCategories && dbCategories.length > 0 ? dbCategories : dataset.categories;

    const { data: dbStats } = await supabaseAdmin
      .from("minlan_community_stats")
      .select("total_card_matches, target_card_matches")
      .eq("id", 1)
      .single();

    const stats = dbStats || MOCK_COMMUNITY_STATS;

    return NextResponse.json({
      success: true,
      categories,
      communityStats: stats,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      categories: dataset.categories,
      communityStats: MOCK_COMMUNITY_STATS,
    });
  }
}
