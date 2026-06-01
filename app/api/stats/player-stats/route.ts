import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TEAMS } from "@/data/teams";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const players: any[] = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from("team_rosters")
        .select("id, player_name, team_id, player_position, player_number, club, date_of_birth, height, weight, league, birth_place")
        .range(from, to);

      if (error) {
        console.error("Error fetching player stats:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      if (data && data.length > 0) {
        players.push(...data);
        if (data.length < 1000) {
          hasMore = false;
        } else {
          from += 1000;
          to += 1000;
        }
      } else {
        hasMore = false;
      }
    }

    if (!players || players.length === 0) {
      return NextResponse.json({
        success: true,
        youngest: [],
        oldest: [],
        topClubs: [],
        topCities: [],
        confederations: {},
        countryAverages: []
      });
    }

    const currentYear = 2026;

    // Helper to calculate age from date of birth
    const getAge = (dobString: string | null) => {
      if (!dobString) return null;
      try {
        const birthYear = new Date(dobString).getFullYear();
        return currentYear - birthYear;
      } catch {
        return null;
      }
    };

    // 1. Map players with computed ages
    const playersWithAge = players.map(p => ({
      ...p,
      age: getAge(p.date_of_birth)
    }));

    // 2. Youngest 20 (Filter out null dob/age)
    const youngest = [...playersWithAge]
      .filter(p => p.age !== null && p.date_of_birth)
      .sort((a, b) => {
        // Sort by dob desc (youngest first)
        return new Date(b.date_of_birth!).getTime() - new Date(a.date_of_birth!).getTime();
      })
      .slice(0, 20);

    // 3. Oldest 20
    const oldest = [...playersWithAge]
      .filter(p => p.age !== null && p.date_of_birth)
      .sort((a, b) => {
        // Sort by dob asc (oldest first)
        return new Date(a.date_of_birth!).getTime() - new Date(b.date_of_birth!).getTime();
      })
      .slice(0, 20);

    // 4. Top Clubs (Filter out "Kulüp Yok" or Serbest)
    const clubCounts: Record<string, { count: number; club: string }> = {};
    players.forEach(p => {
      const club = p.club?.trim();
      if (club && club !== "Kulüp Yok" && club !== "Serbest" && club !== "Club Less" && club !== "") {
        clubCounts[club] = {
          club,
          count: (clubCounts[club]?.count || 0) + 1
        };
      }
    });
    const topClubs = Object.values(clubCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 4.5. Top Birth Cities (Filter out placeholder fallbacks)
    const birthPlaceCounts: Record<string, { city: string; count: number }> = {};
    players.forEach(p => {
      const city = p.birth_place?.trim();
      if (
        city && 
        city !== "Capital City" && 
        city !== "Port City" && 
        city !== "Highlands" && 
        city !== "Metropolis" && 
        city !== "Valley City" && 
        city !== "Coastal Town" && 
        city !== "River Town" && 
        city !== ""
      ) {
        birthPlaceCounts[city] = {
          city,
          count: (birthPlaceCounts[city]?.count || 0) + 1
        };
      }
    });
    const topCities = Object.values(birthPlaceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 5. Confederations Player Count
    // Build a lookup map for teams confederations
    const teamConfederationMap = new Map<string, string>();
    TEAMS.forEach(t => {
      teamConfederationMap.set(t.id, t.confederation || "Other");
    });

    const confederationCounts: Record<string, number> = {
      UEFA: 0,
      CONMEBOL: 0,
      CONCACAF: 0,
      AFC: 0,
      CAF: 0,
      OFC: 0
    };
    players.forEach(p => {
      const conf = teamConfederationMap.get(p.team_id) || "Other";
      if (conf in confederationCounts) {
        confederationCounts[conf]++;
      } else {
        confederationCounts[conf] = (confederationCounts[conf] || 0) + 1;
      }
    });

    // 6. Country Averages (Age, Height, Weight)
    const teamGroups: Record<string, {
      teamId: string;
      totalAge: number;
      ageCount: number;
      totalHeight: number;
      heightCount: number;
      totalWeight: number;
      weightCount: number;
    }> = {};

    playersWithAge.forEach(p => {
      if (!teamGroups[p.team_id]) {
        teamGroups[p.team_id] = {
          teamId: p.team_id,
          totalAge: 0,
          ageCount: 0,
          totalHeight: 0,
          heightCount: 0,
          totalWeight: 0,
          weightCount: 0
        };
      }

      const grp = teamGroups[p.team_id];
      
      if (p.age !== null) {
        grp.totalAge += p.age;
        grp.ageCount++;
      }
      if (p.height) {
        grp.totalHeight += p.height;
        grp.heightCount++;
      }
      if (p.weight) {
        grp.totalWeight += p.weight;
        grp.weightCount++;
      }
    });

    const countryAverages = Object.values(teamGroups).map(g => {
      const team = TEAMS.find(t => t.id === g.teamId);
      return {
        teamId: g.teamId,
        teamNameTr: team?.nameTr || g.teamId,
        teamNameEn: team?.nameEn || g.teamId,
        avgAge: g.ageCount > 0 ? Math.round((g.totalAge / g.ageCount) * 10) / 10 : 0,
        avgHeight: g.heightCount > 0 ? Math.round((g.totalHeight / g.heightCount) * 10) / 10 : 0,
        avgWeight: g.weightCount > 0 ? Math.round((g.totalWeight / g.weightCount) * 10) / 10 : 0,
        playerCount: g.heightCount // total players
      };
    }).sort((a, b) => a.teamNameTr.localeCompare(b.teamNameTr));

    return NextResponse.json({
      success: true,
      youngest,
      oldest,
      topClubs,
      topCities,
      confederations: confederationCounts,
      countryAverages
    });

  } catch (err: any) {
    console.error("Stats API runtime error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
