import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("player_stage_stats")
      .select(`
        player_id,
        goals,
        yellow_cards,
        red_cards,
        team_rosters (
          player_name,
          team_id,
          player_position
        )
      `);

    if (error) {
      console.error("[Tournament-Leaders-API] Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const scorersMap: Record<string, { player: { id: string; name: string; position: string }; team: { id: string }; goals: number }> = {};
    const cardsMap: Record<string, { player: { id: string; name: string; position: string }; team: { id: string }; yellow_cards: number; red_cards: number }> = {};

    (data || []).forEach((row: any) => {
      const pId = row.player_id;
      const roster = row.team_rosters;
      if (!roster) return;

      const name = roster.player_name;
      const teamId = roster.team_id;
      const pos = roster.player_position;

      // Aggregate scorers
      if (row.goals > 0) {
        if (!scorersMap[pId]) {
          scorersMap[pId] = {
            player: { id: pId, name, position: pos },
            team: { id: teamId },
            goals: 0
          };
        }
        scorersMap[pId].goals += row.goals;
      }

      // Aggregate cards
      if (row.yellow_cards > 0 || row.red_cards > 0) {
        if (!cardsMap[pId]) {
          cardsMap[pId] = {
            player: { id: pId, name, position: pos },
            team: { id: teamId },
            yellow_cards: 0,
            red_cards: 0
          };
        }
        cardsMap[pId].yellow_cards += row.yellow_cards;
        cardsMap[pId].red_cards += row.red_cards;
      }
    });

    const scorers = Object.values(scorersMap).sort((a, b) => b.goals - a.goals);
    const cards = Object.values(cardsMap).sort((a, b) => {
      if (b.red_cards !== a.red_cards) return b.red_cards - a.red_cards;
      return b.yellow_cards - a.yellow_cards;
    });

    return new NextResponse(JSON.stringify({
      success: true,
      scorers,
      cards
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600"
      }
    });
  } catch (error: any) {
    console.error("[Tournament-Leaders-API] Crash:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
