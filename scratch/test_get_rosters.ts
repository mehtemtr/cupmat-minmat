import { supabaseAdmin } from "../lib/supabase";
import { getGeneralPosition, getPlayerMapping, translateToStatic } from "../lib/fantasy/points";

async function main() {
  // mehtemtr/cupmat-minmat user hamemaht@gmail.com Clerk user ID
  // Let's find the user_id for this email from our rosters
  const { data: users } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("user_id, team_name")
    .neq("user_id", "statmatik_bot");

  const userId = users?.find(u => !u.user_id.startsWith("bot_"))?.user_id;
  if (!userId) {
    console.log("No real user found");
    return;
  }

  console.log("Testing user:", userId);

  const stage = "matchday_3"; // Simulating Matchday 3 where they don't have a roster

  const { data: allUserRosters, error } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error:", error);
    return;
  }

  const stages = ["matchday_1", "matchday_2", "matchday_3", "round_of_32", "round_of_16", "quarter_finals", "semi_finals", "finals"];
  const currentIdx = stages.indexOf(stage.toLowerCase());

  const rostersForStage = (allUserRosters || []).filter(
    (r) => r.stage?.toLowerCase() === stage.toLowerCase()
  );

  const findPreviousRoster = (teamIdx: number) => {
    if (currentIdx <= 0) return null;
    for (let i = currentIdx - 1; i >= 0; i--) {
      const prevStage = stages[i];
      const found = (allUserRosters || []).find(
        (r) => r.stage?.toLowerCase() === prevStage && r.team_index === teamIdx
      );
      if (found) return found;
    }
    return null;
  };

  const finalRosters: any[] = [];
  const maxTeamsCount = 4;
  for (let tIdx = 1; tIdx <= maxTeamsCount; tIdx++) {
    const activeRoster = rostersForStage.find((r) => r.team_index === tIdx);
    if (activeRoster) {
      finalRosters.push(activeRoster);
    } else {
      const prevRoster = findPreviousRoster(tIdx);
      if (prevRoster) {
        finalRosters.push({
          ...prevRoster,
          id: undefined,
          stage: stage,
          is_template: true,
        });
      }
    }
  }

  console.log(`Final rosters found: ${finalRosters.length}`);

  const mapping = await getPlayerMapping();

  const rostersWithDetails = await Promise.all(
    finalRosters.map(async (roster) => {
      const playerIds = [...(roster.starters || []), ...(roster.bench || [])];
      console.log(`Team index: ${roster.team_index}, Is Template: ${roster.is_template}`);
      console.log(`Player UUIDs from database:`, playerIds);
      let playersMap: Record<string, any> = {};

      if (playerIds.length > 0) {
        const { data: playersData, error: playersError } = await supabaseAdmin
          .from("team_rosters")
          .select("id, team_id, player_name, player_position, player_number, club")
          .in("id", playerIds);

        if (playersError) {
          console.error("Players query error:", playersError);
        }
        console.log(`Fetched player details count: ${playersData?.length}`);

        if (!playersError && playersData) {
          playersData.forEach((p) => {
            playersMap[p.id] = {
              ...p,
              generalPosition: getGeneralPosition(p.player_position),
            };
          });
        }
      }

      const startersWithDetails = (roster.starters || []).map((id: string) => {
        const dbPlayer = playersMap[id];
        const staticId = translateToStatic(id, mapping);
        return { id: staticId || id, name: dbPlayer?.player_name };
      });

      console.log(`Starters with details (first 3):`, startersWithDetails.slice(0, 3));
      return {
        team_index: roster.team_index,
        starters_count: startersWithDetails.length,
      };
    })
  );
}

main().catch(console.error);
