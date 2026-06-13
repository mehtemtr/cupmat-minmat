import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getGamificationLeaderboard } from "@/lib/store/gamification-store";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("leagueId");
    const type = searchParams.get("type") || "predictions"; // 'predictions', 'fantasy', or 'taraftar'

    if (!leagueId) {
      return NextResponse.json({ success: false, error: "Lig ID gereklidir" }, { status: 400 });
    }

    // 1. Verify that user is a member of this league
    const { data: memberCheck, error: memberCheckErr } = await supabaseAdmin
      .from("private_league_members")
      .select("id")
      .eq("league_id", leagueId)
      .eq("user_id", authResult.userId)
      .maybeSingle();

    if (memberCheckErr || !memberCheck) {
      return NextResponse.json({ success: false, error: "Bu ligi görüntülemek için lige üye olmalısınız" }, { status: 403 });
    }

    // 2. Fetch league info
    const { data: league, error: leagueErr } = await supabaseAdmin
      .from("private_leagues")
      .select("*")
      .eq("id", leagueId)
      .single();

    if (leagueErr || !league) {
      return NextResponse.json({ success: false, error: "Lig bulunamadı" }, { status: 404 });
    }

    // 3. Fetch league members
    const { data: members, error: membersError } = await supabaseAdmin
      .from("private_league_members")
      .select("user_id, joined_at")
      .eq("league_id", leagueId);

    if (membersError || !members) {
      console.error("Error fetching league members:", membersError);
      return NextResponse.json({ success: false, error: "Üyeler yüklenemedi" }, { status: 500 });
    }

    const userIds = members.map((m: any) => m.user_id);

    // 4. Fetch profiles to get nicknames and emails
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname, email")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Error fetching member profiles:", profilesError);
    }

    const profileMap = new Map<string, { nickname: string; email: string }>();
    (profiles || []).forEach((p: any) => {
      profileMap.set(p.user_id, {
        nickname: p.nickname || p.email?.split("@")[0] || "Oyuncu",
        email: p.email || ""
      });
    });

    let standings: any[] = [];

    // 5. Fetch scores depending on leaderboard type
    if (type === "predictions") {
      // Predictions (CupMat score)
      const { data: cupmatRows, error: cupmatError } = await supabaseAdmin
        .from("cupmat_leaderboard")
        .select("user_id, points")
        .in("user_id", userIds);

      if (cupmatError) {
        console.error("Error fetching cupmat scores:", cupmatError);
      }

      const scoreMap = new Map<string, number>();
      (cupmatRows || []).forEach((row: any) => {
        scoreMap.set(row.user_id, row.points || 0);
      });

      standings = members.map((m: any) => {
        const prof = profileMap.get(m.user_id) || { nickname: `Oyuncu-${m.user_id.substring(0, 5)}`, email: "" };
        const pts = scoreMap.get(m.user_id) ?? 0;
        return {
          userId: m.user_id,
          nickname: prof.nickname,
          score: pts,
          joinedAt: m.joined_at,
        };
      });

      // Sort by score DESC, then by joinedAt ASC
      standings.sort((a, b) => b.score - a.score || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    } else if (type === "fantasy") {
      // Fantasy standings
      const { data: fantasyRows, error: fantasyError } = await supabaseAdmin
        .from("fantasy_duel_standings")
        .select("user_id, points, total_roster_points")
        .in("user_id", userIds);

      if (fantasyError) {
        console.error("Error fetching fantasy scores:", fantasyError);
      }

      const scoreMap = new Map<string, { pts: number; rosterPts: number }>();
      (fantasyRows || []).forEach((row: any) => {
        scoreMap.set(row.user_id, {
          pts: row.points || 0,
          rosterPts: row.total_roster_points || 0
        });
      });

      // Fetch team names from fantasy_rosters
      const { data: rosterRows, error: rosterError } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("user_id, team_name")
        .in("user_id", userIds);

      if (rosterError) {
        console.error("Error fetching roster team names:", rosterError);
      }

      const teamNameMap = new Map<string, string>();
      (rosterRows || []).forEach((r: any) => {
        if (r.team_name && r.team_name.trim()) {
          teamNameMap.set(r.user_id, r.team_name.trim());
        }
      });

      standings = members.map((m: any) => {
        const prof = profileMap.get(m.user_id) || { nickname: `Oyuncu-${m.user_id.substring(0, 5)}`, email: "" };
        const scoreData = scoreMap.get(m.user_id) || { pts: 0, rosterPts: 0 };
        const displayName = teamNameMap.get(m.user_id) || prof.nickname;
        return {
          userId: m.user_id,
          nickname: displayName,
          score: scoreData.pts,
          rosterPoints: scoreData.rosterPts,
          joinedAt: m.joined_at,
        };
      });

      // Sort by points DESC, then by rosterPoints DESC, then joinedAt ASC
      standings.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.rosterPoints !== a.rosterPoints) return b.rosterPoints - a.rosterPoints;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });

    } else if (type === "taraftar") {
      // Fan Points (Redis store)
      const allActivities = await getGamificationLeaderboard();
      const activityMap = new Map<string, number>();
      
      allActivities.forEach((u: any) => {
        activityMap.set(u.userId, u.taraftarPuani || 0);
      });

      standings = members.map((m: any) => {
        const prof = profileMap.get(m.user_id) || { nickname: `Oyuncu-${m.user_id.substring(0, 5)}`, email: "" };
        const pts = activityMap.get(m.user_id) ?? 0;
        return {
          userId: m.user_id,
          nickname: prof.nickname,
          score: pts,
          joinedAt: m.joined_at,
        };
      });

      // Sort by Fan Points DESC, then joinedAt ASC
      standings.sort((a, b) => b.score - a.score || new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    }

    // Add rankings
    standings = standings.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    // Fetch creator nickname
    const creatorProf = profileMap.get(league.created_by) || { nickname: "Kurucu" };

    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
        joinCode: league.join_code,
        createdBy: league.created_by,
        creatorNickname: creatorProf.nickname,
        createdAt: league.created_at,
      },
      leaderboard: standings
    });

  } catch (error) {
    console.error("Leagues leaderboard GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
