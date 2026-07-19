import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { handleGamificationAction } from "@/lib/store/gamification-store";

// Deterministic seeded shuffle function
function seededShuffle<T>(array: T[], seed: string): T[] {
  if (array.length === 0) return [];
  let currentIndex = array.length, temporaryValue, randomIndex;
  
  // Simple hash function to generate numeric seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const random = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };

  const arr = [...array];
  while (0 !== currentIndex) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
  return arr;
}

// GET: Fetch the 4 daily polls for the user (deterministic based on user ID & date) and the daily opinion poll
export async function GET() {
  try {
    const { userId } = await auth();
    const effectiveUserId = userId || "guest";

    // 1. Fetch all polls
    const { data: allPolls, error: pollsError } = await supabaseAdmin
      .from("polls")
      .select("*");

    if (pollsError) {
      console.error("Error fetching polls:", pollsError);
      return NextResponse.json({ success: false, error: "Veritabanı hatası" }, { status: 500 });
    }

    if (!allPolls || allPolls.length === 0) {
      return NextResponse.json({ success: true, polls: [], dailyOpinionPoll: null });
    }

    // Separate trivia questions and opinion polls
    const triviaPolls = allPolls.filter((p) => p.correct_option_index >= 0);
    const opinionPolls = allPolls.filter((p) => p.correct_option_index === -1);

    // Group trivia by category
    const sitePolls = triviaPolls.filter((p) => p.category === "site");
    const pastWcPolls = triviaPolls.filter((p) => p.category === "past_wc");
    const currentWcPolls = triviaPolls.filter((p) => p.category === "current_wc");

    // Get current date string in Europe/Istanbul timezone (UTC+3)
    const dateStr = new Date().toLocaleDateString("en-US", { timeZone: "Europe/Istanbul" });
    const seed = `${effectiveUserId}_${dateStr}`;

    // Select trivia questions
    const selectedPolls: any[] = [];

    // Pick 1 from site category
    if (sitePolls.length > 0) {
      const shuf = seededShuffle(sitePolls, seed + "_site");
      selectedPolls.push(shuf[0]);
    }

    // Pick 2 from past_wc category
    if (pastWcPolls.length > 0) {
      const shuf = seededShuffle(pastWcPolls, seed + "_past");
      selectedPolls.push(...shuf.slice(0, 2));
    }

    // Pick 1 from current_wc category
    if (currentWcPolls.length > 0) {
      const shuf = seededShuffle(currentWcPolls, seed + "_current");
      selectedPolls.push(shuf[0]);
    }

    // Shuffle the final 4 trivia questions together so the sequence is randomized per user
    const dailyPolls = seededShuffle(selectedPolls, seed + "_final");

    // Fetch user submissions for today's selected trivia polls
    let userSubmissions: any[] = [];
    if (userId && dailyPolls.length > 0) {
      const pollIds = dailyPolls.map((p) => p.id);
      const { data: subs, error: subsError } = await supabaseAdmin
        .from("poll_submissions")
        .select("*")
        .eq("user_id", userId)
        .in("poll_id", pollIds);

      if (subsError) {
        console.error("Error fetching submissions:", subsError);
      } else {
        userSubmissions = subs || [];
      }
    }

    // Handle daily opinion poll (same for all users today based on date string)
    let dailyOpinionPoll: any = null;
    let opinionPollStats: number[] = [];
    let userOpinionSubmission: any = null;

    if (opinionPolls.length > 0) {
      let opinionSeed = dateStr;
      let pinnedPollId = null;
      
      // Keep today's poll (from June 13, 2026) active for a few days (June 13 to June 17, 2026)
      const parsedDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
      const day = parsedDate.getDate();
      const month = parsedDate.getMonth() + 1;
      const year = parsedDate.getFullYear();
      if (year === 2026 && month === 6 && day >= 13 && day <= 17) {
        opinionSeed = "6/13/2026";
      } else if (year === 2026 && month === 6 && day >= 20 && day <= 27) {
        // Keep the custom squad selection poll active for 1 week (June 20 to June 27, 2026)
        pinnedPollId = "e5015e12-32b0-466d-9fc0-c5c4975fd96d";
      } else if (year === 2026 && month === 7 && day >= 1 && day < 19) {
        // Pin the champion poll
        pinnedPollId = "c603b57d-12a8-4c31-9a7b-3b37a1f592cd";
      } else if (year === 2026 && month === 7 && day >= 19 && day <= 31) {
        // Pin the post-world-cup work preference poll
        pinnedPollId = "d5015e12-32b0-466d-9fc0-c5c4975fd96e";
      }

      if (pinnedPollId) {
        dailyOpinionPoll = opinionPolls.find((p) => p.id === pinnedPollId) || opinionPolls[0];
      } else {
        const shufOpinions = seededShuffle(opinionPolls, opinionSeed);
        dailyOpinionPoll = shufOpinions[0];
      }

      // Fetch all submissions for this daily opinion poll to calculate percentage stats
      const { data: opSubs, error: opSubsError } = await supabaseAdmin
        .from("poll_submissions")
        .select("selected_option_index")
        .eq("poll_id", dailyOpinionPoll.id);

      if (!opSubsError && opSubs) {
        const counts = new Array(dailyOpinionPoll.options.length).fill(0);
        opSubs.forEach((sub) => {
          if (sub.selected_option_index >= 0 && sub.selected_option_index < counts.length) {
            counts[sub.selected_option_index]++;
          }
        });
        opinionPollStats = counts;
      }

      // Fetch current user's submission for this opinion poll if logged in
      if (userId) {
        const { data: userOpSub } = await supabaseAdmin
          .from("poll_submissions")
          .select("*")
          .eq("poll_id", dailyOpinionPoll.id)
          .eq("user_id", userId)
          .maybeSingle();
        userOpinionSubmission = userOpSub || null;
      }
    }

    return NextResponse.json({
      success: true,
      polls: dailyPolls,
      userSubmissions,
      dailyOpinionPoll,
      userOpinionSubmission,
      opinionPollStats,
    });
  } catch (error) {
    console.error("Polls GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Submit answer for a poll (with progressive scoring for trivia)
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

    // Validate option index range
    const options = Array.isArray(poll.options) ? poll.options : [];
    if (selectedOptionIndex !== -1 && (selectedOptionIndex < 0 || selectedOptionIndex >= options.length)) {
      return NextResponse.json({ success: false, error: "Geçersiz seçenek" }, { status: 400 });
    }

    // 2. Check if already submitted
    const { data: existingSub } = await supabaseAdmin
      .from("poll_submissions")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", authResult.userId)
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json({ success: false, error: "Bu soruyu zaten cevapladınız" }, { status: 400 });
    }

    // 3. Determine correctness & trivia type
    const isTrivia = poll.correct_option_index >= 0;
    let isCorrect = false;

    if (selectedOptionIndex !== -1) {
      if (isTrivia) {
        isCorrect = selectedOptionIndex === poll.correct_option_index;
      } else {
        isCorrect = false; // Opinion polls have no correct/incorrect state
      }
    }

    // 4. Calculate points
    let pointsAwarded = 0;
    if (isTrivia) {
      if (isCorrect) {
        // Find start of today in Europe/Istanbul timezone (UTC+3)
        const istanbulDateStr = new Date().toLocaleDateString("en-US", { timeZone: "Europe/Istanbul" });
        const [month, day, year] = istanbulDateStr.split("/");
        const midnightIstanbul = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          0, 0, 0, 0
        );
        const startOfTodayIso = midnightIstanbul.toISOString();

        // Fetch user's correct trivia submissions today (opinion polls have is_correct = false, so they are not counted)
        const { data: todayCorrectSubs } = await supabaseAdmin
          .from("poll_submissions")
          .select("id")
          .eq("user_id", authResult.userId)
          .eq("is_correct", true)
          .gte("submitted_at", startOfTodayIso);

        const correctCountToday = todayCorrectSubs ? todayCorrectSubs.length : 0;
        const nextCorrectNumber = correctCountToday + 1;

        // Progressive scale: 1st -> 20, 2nd -> 30 (+30, total 50), 3rd -> 50 (+50, total 100), 4th -> 100 (+100, total 200)
        if (nextCorrectNumber === 1) {
          pointsAwarded = 20;
        } else if (nextCorrectNumber === 2) {
          pointsAwarded = 30;
        } else if (nextCorrectNumber === 3) {
          pointsAwarded = 50;
        } else if (nextCorrectNumber === 4) {
          pointsAwarded = 100;
        } else {
          pointsAwarded = 10;
        }
      }
    } else {
      // For opinion polls, award a flat participation points reward (if not timed out)
      if (selectedOptionIndex !== -1) {
        pointsAwarded = poll.points_reward || 10;
      }
    }

    // 5. Save submission
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

    // 6. Update gamification score if points awarded
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
      message: gamificationMsg || (isTrivia ? (isCorrect ? `Doğru! +${pointsAwarded} Puan kazandınız.` : "Yanlış cevap.") : `Katılımınız için teşekkürler! +${pointsAwarded} Puan kazandınız.`),
    });

  } catch (error) {
    console.error("Polls POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
