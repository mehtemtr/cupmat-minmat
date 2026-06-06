import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { handleGamificationAction } from "@/lib/store/gamification-store";

// GET: Fetch all active polls. Optionally include current user's submissions.
export async function GET() {
  try {
    const { userId } = await auth();

    // Query active polls (where active_until is null or in the future)
    const { data: polls, error: pollsError } = await supabaseAdmin
      .from("polls")
      .select("*")
      .or(`active_until.is.null,active_until.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });

    if (pollsError) {
      console.error("Error fetching polls:", pollsError);
      return NextResponse.json({ success: false, error: "Veritabanı hatası" }, { status: 500 });
    }

    let userSubmissions: any[] = [];
    if (userId) {
      const { data: subs, error: subsError } = await supabaseAdmin
        .from("poll_submissions")
        .select("*")
        .eq("user_id", userId);

      if (subsError) {
        console.error("Error fetching submissions:", subsError);
      } else {
        userSubmissions = subs || [];
      }
    }

    return NextResponse.json({
      success: true,
      polls: polls || [],
      userSubmissions,
    });
  } catch (error) {
    console.error("Polls GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Submit answer/vote for a poll
export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();
    const { pollId, selectedOptionIndex } = body;

    if (!pollId || typeof selectedOptionIndex !== "number") {
      return NextResponse.json({ success: false, error: "Geçersiz parametreler" }, { status: 400 });
    }

    // 1. Fetch the poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ success: false, error: "Anket bulunamadı" }, { status: 404 });
    }

    // Check if active_until has passed
    if (poll.active_until && new Date(poll.active_until).getTime() < Date.now()) {
      return NextResponse.json({ success: false, error: "Bu anketin süresi dolmuş" }, { status: 400 });
    }

    // Validate option index range
    const options = Array.isArray(poll.options) ? poll.options : [];
    if (selectedOptionIndex < 0 || selectedOptionIndex >= options.length) {
      return NextResponse.json({ success: false, error: "Geçersiz seçenek" }, { status: 400 });
    }

    // 2. Check if already submitted
    const { data: existingSub, error: subCheckError } = await supabaseAdmin
      .from("poll_submissions")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", authResult.userId)
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json({ success: false, error: "Bu anketi zaten cevapladınız" }, { status: 400 });
    }

    // 3. Determine correctness and points
    let isCorrect = true;
    let pointsAwarded = 0;

    if (poll.correct_option_index >= 0) {
      isCorrect = selectedOptionIndex === poll.correct_option_index;
      pointsAwarded = isCorrect ? poll.points_reward : 0;
    } else {
      // Opinion poll - points awarded for participation
      isCorrect = true;
      pointsAwarded = poll.points_reward;
    }

    // 4. Save submission
    const { error: insertError } = await supabaseAdmin
      .from("poll_submissions")
      .insert({
        poll_id: pollId,
        user_id: authResult.userId,
        selected_option_index: selectedOptionIndex,
        is_correct: isCorrect,
        points_awarded: pointsAwarded,
      });

    if (insertError) {
      console.error("Error inserting poll submission:", insertError);
      return NextResponse.json({ success: false, error: "Cevap kaydedilemedi" }, { status: 500 });
    }

    // 5. Update gamification score if points awarded
    let gamificationMsg = "";
    if (pointsAwarded > 0) {
      const gamificationResult = await handleGamificationAction(
        authResult.userId,
        "poll_answered",
        pointsAwarded,
        authResult.displayName,
        authResult.email
      );
      if (gamificationResult.success) {
        gamificationMsg = gamificationResult.message;
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOptionIndex: poll.correct_option_index,
      pointsAwarded,
      message: gamificationMsg || (isCorrect ? "Cevabınız kaydedildi!" : "Cevabınız kaydedildi, ancak yanlış."),
    });

  } catch (error) {
    console.error("Polls POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
