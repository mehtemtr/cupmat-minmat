"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { PageShell } from "@/components/PageShell";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";
import { 
  Check, 
  X, 
  Award, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  Trophy,
  BarChart2,
  MessageSquare,
  ArrowLeft,
  Share2
} from "lucide-react";

interface PollOption {
  tr: string;
  en: string;
  [key: string]: string | undefined;
}

interface Poll {
  id: string;
  question_tr: string;
  question_en: string;
  options: PollOption[];
  correct_option_index: number;
  points_reward: number;
  category: string;
  [key: string]: any;
}

interface UserSubmission {
  poll_id: string;
  selected_option_index: number;
  is_correct: boolean;
  points_awarded: number;
  submitted_at: string;
}

export default function PollsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { isSignedIn } = useUser();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, UserSubmission>>({});
  const [loading, setLoading] = useState(true);

  // Opinion Poll state
  const [dailyOpinionPoll, setDailyOpinionPoll] = useState<Poll | null>(null);
  const [opinionPollStats, setOpinionPollStats] = useState<number[]>([]);
  const [userOpinionSubmission, setUserOpinionSubmission] = useState<UserSubmission | null>(null);

  // Active view: "dashboard" | "trivia" | "opinion"
  const [activeView, setActiveView] = useState<"dashboard" | "trivia" | "opinion">("dashboard");

  // Game state (for sequential trivia)
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isAnswered: boolean;
    isCorrect: boolean;
    pointsAwarded: number;
    correctOptionIndex: number;
  } | null>(null);

  // Opinion poll voting state
  const [selectedOpinionIndex, setSelectedOpinionIndex] = useState<number | null>(null);
  const [votingOpinion, setVotingOpinion] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, [isSignedIn]);

  // Timer logic for active trivia question
  useEffect(() => {
    if (activeView !== "trivia" || !isGameStarted || polls.length === 0 || feedback || submitting) return;

    const activeIndex = polls.findIndex((p) => !submissions[p.id]);
    if (activeIndex === -1) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoTimeout(polls[activeIndex].id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeView, isGameStarted, polls, submissions, feedback, submitting]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/polls");
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls || []);
        // Map user submissions by pollId
        const subMap: Record<string, UserSubmission> = {};
        if (data.userSubmissions) {
          data.userSubmissions.forEach((sub: UserSubmission) => {
            subMap[sub.poll_id] = sub;
          });
        }
        setSubmissions(subMap);
        setDailyOpinionPoll(data.dailyOpinionPoll || null);
        setOpinionPollStats(data.opinionPollStats || []);
        setUserOpinionSubmission(data.userOpinionSubmission || null);
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (feedback?.isAnswered) return;
    setSelectedAnswer(optionIndex);
  };

  const handleAnswerSubmit = async (pollId: string) => {
    if (selectedAnswer === null || submitting || feedback?.isAnswered) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, selectedOptionIndex: selectedAnswer }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          isAnswered: true,
          isCorrect: data.isCorrect,
          pointsAwarded: data.pointsAwarded,
          correctOptionIndex: data.correctOptionIndex,
        });

        // Trigger page points update in header
        if (data.pointsAwarded > 0) {
          window.dispatchEvent(
            new CustomEvent("taraftar-puan-guncellendi", {
              detail: { points: null } // Forces header to re-fetch points
            })
          );
        }
      } else {
        alert(data.error || "Cevap gönderilemedi.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoTimeout = async (pollId: string) => {
    if (submitting || feedback?.isAnswered) return;
    try {
      setSubmitting(true);
      setSelectedAnswer(-1); // -1 representing timeout

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, selectedOptionIndex: -1 }),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          isAnswered: true,
          isCorrect: false,
          pointsAwarded: 0,
          correctOptionIndex: data.correctOptionIndex,
        });

        // Sync points in header
        window.dispatchEvent(
          new CustomEvent("taraftar-puan-guncellendi", {
            detail: { points: null }
          })
        );
      }
    } catch (err) {
      console.error("Timeout submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = (pollId: string) => {
    if (!feedback) return;

    // Record submission locally so UI advances
    const newSub: UserSubmission = {
      poll_id: pollId,
      selected_option_index: selectedAnswer!,
      is_correct: feedback.isCorrect,
      points_awarded: feedback.pointsAwarded,
      submitted_at: new Date().toISOString(),
    };

    setSubmissions((prev) => ({ ...prev, [pollId]: newSub }));
    
    // Reset temporary states and reset timer back to 20
    setSelectedAnswer(null);
    setFeedback(null);
    setTimeLeft(20);
  };

  // Opinion Poll Submit Handler
  const handleOpinionVoteSubmit = async () => {
    if (selectedOpinionIndex === null || votingOpinion || !dailyOpinionPoll) return;

    try {
      setVotingOpinion(true);
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pollId: dailyOpinionPoll.id, 
          selectedOptionIndex: selectedOpinionIndex 
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Record vote submission locally
        const newOpSub: UserSubmission = {
          poll_id: dailyOpinionPoll.id,
          selected_option_index: selectedOpinionIndex,
          is_correct: false,
          points_awarded: data.pointsAwarded || 10,
          submitted_at: new Date().toISOString(),
        };
        setUserOpinionSubmission(newOpSub);

        // Increment stats count locally
        setOpinionPollStats((prev) => {
          const next = [...prev];
          if (selectedOpinionIndex >= 0 && selectedOpinionIndex < next.length) {
            next[selectedOpinionIndex]++;
          }
          return next;
        });

        // Trigger page points update in header
        window.dispatchEvent(
          new CustomEvent("taraftar-puan-guncellendi", {
            detail: { points: null }
          })
        );
      } else {
        alert(data.error || "Oy gönderilemedi.");
      }
    } catch (err) {
      console.error("Error submitting opinion vote:", err);
      alert("Bir hata oluştu.");
    } finally {
      setVotingOpinion(false);
    }
  };

  const shareOpinionPoll = async () => {
    if (!dailyOpinionPoll) return;

    const question = getTranslatedQuestion(dailyOpinionPoll);
    const optionsText = dailyOpinionPoll.options
      .map((opt, idx) => `${idx + 1}️⃣ ${getTranslatedOption(opt)}`)
      .join("\n");
      
    const url = `${window.location.origin}/polls`;
    
    let text = "";
    if (locale === "tr") {
      text = `${question}\n\nSeçenekler:\n${optionsText}\n\nOyunu ver, fikrini paylaş! 🏆⚽`;
    } else {
      text = `${question}\n\nOptions:\n${optionsText}\n\nCast your vote and share your opinion! 🏆⚽`;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "StatMatik",
          text: text,
          url: url,
        });
      } catch (err) {
        console.log("Share failed or cancelled:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        alert(locale === "tr" ? "Paylaşım metni panoya kopyalandı! 🔗" : "Share text copied to clipboard! 🔗");
      } catch (err) {
        console.error("Failed to copy share text:", err);
      }
    }
  };

  const getTranslatedQuestion = (poll: Poll) => {
    const localizedKey = `question_${locale}`;
    return poll[localizedKey] || poll.question_tr || poll.question_en;
  };

  const getTranslatedOption = (option: PollOption) => {
    return option[locale] || option.tr || option.en;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === "site") return locale === "tr" ? "CupMat & MinMat Rehberi" : "CupMat & MinMat Guide";
    if (cat === "current_wc") return locale === "tr" ? "2026 Dünya Kupası" : "2026 World Cup";
    return locale === "tr" ? "Tarih & Genel Kültür" : "History & Trivia";
  };

  // Game state helpers
  const answeredCount = polls.filter((p) => !!submissions[p.id]).length;
  const isCompleted = polls.length > 0 && answeredCount === polls.length;
  
  const activePollIndex = polls.findIndex((p) => !submissions[p.id]);
  const activePoll = activePollIndex >= 0 ? polls[activePollIndex] : null;

  const totalPointsEarned = Object.values(submissions).reduce((acc, sub) => acc + sub.points_awarded, 0);
  const correctCount = Object.values(submissions).filter((sub) => sub.is_correct).length;

  // Localized texts
  const uiTexts = {
    dailyTitle: locale === "tr" ? "Günün Aktiviteleri" : "Daily Activities",
    dailySubtitle: locale === "tr" ? "Bilgi yarışmasına katılın ve günün anketinde fikrinizi belirtin!" : "Join the trivia challenge and share your thoughts in the daily poll!",
    loginPrompt: locale === "tr" ? "Puan kazanmak ve aktivitelere katılmak için giriş yapın." : "Sign in to earn points and participate in daily activities.",
    loginBtn: locale === "tr" ? "Şimdi Giriş Yap" : "Sign In Now",
    loading: locale === "tr" ? "Yükleniyor..." : "Loading...",
    
    // Trivia challenge dashboard text
    triviaCardTitle: locale === "tr" ? "🏆 Günün Bilgi Yarışması" : "🏆 Daily Trivia Challenge",
    triviaCardDesc: locale === "tr" ? "Günün 4 sorusunu süreyle cevaplayın. Her doğru cevap katlanan puan kazandırır!" : "Answer today's 4 questions under time pressure. Correct answers multiply rewards!",
    triviaNotStarted: locale === "tr" ? "Hazır! 4 Soru Bekliyor" : "Ready! 4 Questions Waiting",
    triviaInProgress: locale === "tr" ? "Devam Ediyor: {progress} Tamamlandı" : "In Progress: {progress} Completed",
    triviaCompleted: locale === "tr" ? "Tamamlandı: {correct}/4 Doğru | +{pts} Puan" : "Completed: {correct}/4 Correct | +{pts} Pts",
    btnStartTrivia: locale === "tr" ? "Yarışmaya Başla" : "Start Trivia",
    btnContinueTrivia: locale === "tr" ? "Yarışmaya Devam Et" : "Continue Trivia",
    btnReviewTrivia: locale === "tr" ? "Sonuçları İncele" : "Review Results",

    // Opinion poll dashboard text
    opinionCardTitle: locale === "tr" ? "💬 Günün Anketi" : "💬 Daily Opinion Poll",
    opinionCardDesc: locale === "tr" ? "Günün futbol sorusunda oyunuzu kullanın ve diğer taraftarların oylarını görün!" : "Vote on today's football question and see what other fans think!",
    opinionVoted: locale === "tr" ? "Katıldınız! Sonuçlar yayında." : "Voted! Results are live.",
    opinionNotVoted: locale === "tr" ? "Katılım: +10 Puan Kazandırır" : "Participation: Earns +10 Points",
    btnJoinOpinion: locale === "tr" ? "Ankete Katıl" : "Join Poll",
    btnViewOpinionResults: locale === "tr" ? "Sonuçları Gör" : "View Results",
    noActiveOpinion: locale === "tr" ? "Bugün için aktif bir anket bulunmuyor." : "No active opinion poll today.",
    voteSubmit: locale === "tr" ? "Oyumu Gönder" : "Submit Vote",
    
    // Trivia execution text
    questionProgress: locale === "tr" ? "Soru {index} / {total}" : "Question {index} / {total}",
    btnSubmit: locale === "tr" ? "Cevapla" : "Answer",
    btnNext: locale === "tr" ? "Sıradaki Soru" : "Next Question",
    btnResults: locale === "tr" ? "Sonuçları Gör" : "View Results",
    feedbackCorrect: locale === "tr" ? "Tebrikler, doğru cevap!" : "Congratulations, correct answer!",
    feedbackIncorrect: locale === "tr" ? "Maalesef yanlış cevap!" : "Incorrect answer!",
    summaryTitle: locale === "tr" ? "🏆 Günün Yarışmasını Tamamladınız!" : "🏆 Daily Trivia Completed!",
    summarySubtitle: locale === "tr" ? "Tebrikler! Bugünün tüm sorularını yanıtladınız." : "Congratulations! You answered all of today's questions.",
    pointsEarned: locale === "tr" ? "Kazanılan Toplam Puan:" : "Total Points Earned:",
    correctsVal: locale === "tr" ? "Doğru Sayısı:" : "Correct Answers:",
    nextDayNotice: locale === "tr" ? "📅 Yarın yeni sorular ve anketler için tekrar gelin!" : "📅 Come back tomorrow for new questions and polls!",
    siteGuide: locale === "tr" ? "Sorular rastgele sıralanmıştır. Tekrar düzeltme veya değiştirme şansı yoktur." : "Questions are randomized. Answers cannot be modified once submitted.",
    yourAnswer: locale === "tr" ? "Senin Cevabın:" : "Your Answer:",
    correctAnswerLabel: locale === "tr" ? "Doğru Cevap:" : "Correct Answer:",

    btnBackHub: locale === "tr" ? "Aktivite Panosuna Dön" : "Back to Activities Hub",
    opinionResultsTitle: locale === "tr" ? "Anket Sonuçları" : "Poll Results",
    totalVotes: locale === "tr" ? "Toplam Oy:" : "Total Votes:",
  };

  return (
    <PageShell title={uiTexts.dailyTitle} subtitle={uiTexts.dailySubtitle}>
      {/* Guest Login Banner */}
      {!isSignedIn && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">{uiTexts.loginPrompt}</h3>
              <p className="text-sm text-zinc-400">{uiTexts.dailySubtitle}</p>
            </div>
          </div>
          <SignInButton mode="modal">
            <button className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all hover:bg-emerald-400 sm:w-auto">
              {uiTexts.loginBtn}
            </button>
          </SignInButton>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-zinc-400">{uiTexts.loading}</div>
      ) : activeView === "dashboard" ? (
        /* ==================== HUB / DASHBOARD VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in duration-300">
          
          {/* TRIVIA CHALLENGE CARD */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isCompleted 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : answeredCount > 0 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}>
                  {isCompleted 
                    ? uiTexts.triviaCompleted.replace("{correct}", correctCount.toString()).replace("{pts}", totalPointsEarned.toString())
                    : answeredCount > 0 
                      ? uiTexts.triviaInProgress.replace("{progress}", `${answeredCount}/4`)
                      : uiTexts.triviaNotStarted
                  }
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{uiTexts.triviaCardTitle}</h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{uiTexts.triviaCardDesc}</p>
              </div>
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                <p>⏱️ <b>20s Süre:</b> Cevaplanmayan soru boş sayılır.</p>
                <p>🏆 <b>Katlanan Puan:</b> 20, 50, 100 ve 200 Puan!</p>
              </div>
            </div>

            <div className="pt-2">
              {isCompleted ? (
                <button
                  onClick={() => setActiveView("trivia")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3.5 font-bold text-white transition-all hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98]"
                >
                  {uiTexts.btnReviewTrivia}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                isSignedIn ? (
                  <button
                    onClick={() => {
                      setIsGameStarted(true);
                      setActiveView("trivia");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-black text-zinc-950 transition-all hover:bg-amber-400 shadow-lg shadow-amber-500/15 active:scale-[0.98]"
                  >
                    {answeredCount > 0 ? uiTexts.btnContinueTrivia : uiTexts.btnStartTrivia}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 py-3.5 font-bold text-zinc-400 transition-all hover:bg-zinc-750 active:scale-[0.98]">
                      {locale === "tr" ? "Giriş Yap ve Yarış!" : "Sign In to Play"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </SignInButton>
                )
              )}
            </div>
          </div>

          {/* OPINION POLL CARD */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  userOpinionSubmission 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {userOpinionSubmission ? uiTexts.opinionVoted : uiTexts.opinionNotVoted}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{uiTexts.opinionCardTitle}</h3>
                {dailyOpinionPoll ? (
                  <p className="text-sm font-semibold text-zinc-300 mt-2 bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-2xl line-clamp-2">
                    {getTranslatedQuestion(dailyOpinionPoll)}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{uiTexts.opinionCardDesc}</p>
                )}
              </div>
              <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                <p>💬 <b>Fikir Paylaşımı:</b> Haftalık futbol gündemi anketleri.</p>
                <p>⚡ <b>Katılım Ödülü:</b> Katılan herkese +10 Puan hediye!</p>
              </div>
            </div>

            <div className="pt-2">
              {!dailyOpinionPoll ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-850 py-3.5 font-bold text-zinc-500 cursor-not-allowed"
                >
                  {uiTexts.noActiveOpinion}
                </button>
              ) : userOpinionSubmission ? (
                <button
                  onClick={() => setActiveView("opinion")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3.5 font-bold text-white transition-all hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98]"
                >
                  {uiTexts.btnViewOpinionResults}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                isSignedIn ? (
                  <button
                    onClick={() => setActiveView("opinion")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 py-3.5 font-black text-zinc-950 transition-all hover:bg-blue-400 shadow-lg shadow-blue-500/15 active:scale-[0.98]"
                  >
                    {uiTexts.btnJoinOpinion}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-800 py-3.5 font-bold text-zinc-400 transition-all hover:bg-zinc-750 active:scale-[0.98]">
                      {locale === "tr" ? "Giriş Yap ve Katıl!" : "Sign In to Vote"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </SignInButton>
                )
              )}
            </div>
          </div>

        </div>
      ) : activeView === "opinion" ? (
        /* ==================== OPINION POLL VIEW ==================== */
        dailyOpinionPoll && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md shadow-2xl p-8 space-y-6 animate-in fade-in duration-300">
            
            {/* Header back & share button container */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveView("dashboard")}
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {uiTexts.btnBackHub}
              </button>
              
              <button
                onClick={shareOpinionPoll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                {locale === "tr" ? "Paylaş" : "Share"}
              </button>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                <MessageSquare className="h-3.5 w-3.5" />
                {uiTexts.opinionResultsTitle}
              </span>
              <h2 className="text-xl font-bold leading-snug text-white pt-2">
                {getTranslatedQuestion(dailyOpinionPoll)}
              </h2>
            </div>

            {/* If user HAS NOT voted */}
            {!userOpinionSubmission ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {dailyOpinionPoll.options.map((option, idx) => {
                    const isSelected = selectedOpinionIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOpinionIndex(idx)}
                        className={`w-full flex items-center justify-between rounded-2xl border p-4.5 text-left text-sm transition-all ${
                          isSelected 
                            ? "border-blue-500 bg-blue-950/10 text-blue-400 ring-1 ring-blue-500/20" 
                            : "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                        }`}
                      >
                        <span>{getTranslatedOption(option)}</span>
                        {isSelected && <Check className="h-4.5 w-4.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  disabled={selectedOpinionIndex === null || votingOpinion}
                  onClick={handleOpinionVoteSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 font-black text-zinc-950 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:scale-100 disabled:cursor-not-allowed text-sm"
                >
                  {votingOpinion ? "..." : uiTexts.voteSubmit}
                </button>
              </div>
            ) : (
              /* If user HAS voted (Show progress chart results) */
              <div className="space-y-5">
                <div className="space-y-3">
                  {(() => {
                    const sum = opinionPollStats.reduce((a, b) => a + b, 0);
                    const getPercent = (count: number) => {
                      if (sum === 0) return 0;
                      return Math.round((count / sum) * 100);
                    };

                    return dailyOpinionPoll.options.map((option, idx) => {
                      const count = opinionPollStats[idx] || 0;
                      const percent = getPercent(count);
                      const isUserChoice = userOpinionSubmission.selected_option_index === idx;

                      return (
                        <div 
                          key={idx} 
                          className={`relative flex flex-col gap-1 p-4.5 rounded-2xl border transition-all ${
                            isUserChoice 
                              ? "border-emerald-500/40 bg-emerald-950/10" 
                              : "border-zinc-800 bg-zinc-900/20"
                          }`}
                        >
                          {/* Colored percentage overlay */}
                          <div 
                            className={`absolute inset-y-0 left-0 rounded-l-2xl transition-all duration-700 ${
                              isUserChoice ? "bg-emerald-500/10" : "bg-zinc-750/10"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                          <div className="relative flex justify-between items-center z-10">
                            <span className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                              {getTranslatedOption(option)}
                              {isUserChoice && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                  {locale === "tr" ? "Senin Seçimin" : "Your Choice"}
                                </span>
                              )}
                            </span>
                            <span className="text-xs font-black text-zinc-300">
                              {percent}% ({count} {locale === "tr" ? "Oy" : "Votes"})
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 text-xs text-zinc-400 font-semibold">
                  <span>{uiTexts.totalVotes}</span>
                  <span className="text-sm font-black text-white">
                    {opinionPollStats.reduce((a, b) => a + b, 0)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={shareOpinionPoll}
                    className="flex-grow flex items-center justify-center gap-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 py-3.5 font-bold text-blue-400 hover:bg-blue-500/20 active:scale-[0.98] transition-all text-sm"
                  >
                    <Share2 className="h-4 w-4" />
                    {locale === "tr" ? "Paylaş" : "Share"}
                  </button>
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className="flex-grow flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3.5 font-bold text-white hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all text-sm"
                  >
                    {uiTexts.btnBackHub}
                  </button>
                </div>
              </div>
            )}

          </div>
        )
      ) : (
        /* ==================== TRIVIA CHALLENGE VIEW ==================== */
        isCompleted ? (
          /* TRIVIA RESULTS / SUMMARY SCREEN */
          <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-500/20 bg-zinc-950/40 p-8 backdrop-blur-md shadow-2xl shadow-emerald-500/5 space-y-8 animate-in fade-in zoom-in duration-300">
            
            <button
              onClick={() => setActiveView("dashboard")}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {uiTexts.btnBackHub}
            </button>

            <div className="text-center space-y-3">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <Trophy className="h-10 w-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-black text-white">{uiTexts.summaryTitle}</h2>
              <p className="text-sm text-zinc-400">{uiTexts.summarySubtitle}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center space-y-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">{uiTexts.correctsVal}</p>
                <p className="text-2xl font-black text-emerald-400">{correctCount} / 4</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 text-center space-y-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">{uiTexts.pointsEarned}</p>
                <p className="text-2xl font-black text-yellow-400">+{totalPointsEarned} Puan</p>
              </div>
            </div>

            {/* Review of daily questions */}
            <div className="space-y-4 pt-2">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                {locale === "tr" ? "Bugünkü Sorular ve Cevapların:" : "Today's Questions & Answers:"}
              </p>
              <div className="space-y-3">
                {polls.map((poll, idx) => {
                  const sub = submissions[poll.id];
                  const isCorrect = sub?.is_correct;
                  const chosenOption = sub?.selected_option_index !== -1 ? poll.options[sub?.selected_option_index] : null;
                  const correctOption = poll.options[poll.correct_option_index];

                  return (
                    <div 
                      key={poll.id} 
                      className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                        isCorrect 
                          ? "bg-emerald-950/10 border-emerald-500/20" 
                          : poll.correct_option_index >= 0 
                            ? "bg-red-950/10 border-red-500/20" 
                            : "bg-zinc-900/30 border-zinc-800"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-black text-zinc-400">{idx + 1}. {getCategoryLabel(poll.category)}</span>
                        <span className="text-xs font-bold shrink-0">
                          {isCorrect ? (
                            <span className="text-emerald-400 flex items-center gap-1">✓ +{sub.points_awarded} Pts</span>
                          ) : poll.correct_option_index >= 0 ? (
                            <span className="text-red-400 flex items-center gap-1">✗ +0 Pts</span>
                          ) : (
                            <span className="text-blue-400 flex items-center gap-1">✓ +{sub.points_awarded} Pts</span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{getTranslatedQuestion(poll)}</p>
                      
                      <div className="text-xs text-zinc-400 mt-1 space-y-1">
                        <p>
                          <strong>{uiTexts.yourAnswer} </strong> 
                          <span className={isCorrect ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                            {chosenOption ? getTranslatedOption(chosenOption) : (locale === "tr" ? "Süre Doldu (Yanıt Yok)" : "Time Expired (No Answer)")}
                          </span>
                        </p>
                        {!isCorrect && poll.correct_option_index >= 0 && (
                          <p>
                            <strong>{uiTexts.correctAnswerLabel} </strong> 
                            <span className="text-emerald-400 font-semibold">
                              {getTranslatedOption(correctOption)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next resetting notice */}
            <div className="text-center py-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-2">
              <p className="text-sm text-emerald-400 font-black tracking-wide">
                {uiTexts.nextDayNotice}
              </p>
            </div>
            
            <button
              onClick={() => setActiveView("dashboard")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-3.5 font-bold text-white hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all text-sm"
            >
              {uiTexts.btnBackHub}
            </button>
          </div>
        ) : (
          /* ACTIVE TRIVIA QUESTION CARD */
          activePoll && (
            <div className="max-w-2xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md shadow-2xl p-8 space-y-8 animate-in fade-in duration-300">
              
              {/* Header progress info */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-400">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {getCategoryLabel(activePoll.category)}
                  </span>
                  
                  {/* Timer Display */}
                  {!feedback?.isAnswered && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      timeLeft > 5 
                        ? "bg-zinc-900 text-zinc-300 border border-zinc-800" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                    }`}>
                      ⏱️ {timeLeft}s
                    </span>
                  )}
                  
                  <span className="font-black text-slate-400">
                    {uiTexts.questionProgress
                      .replace("{index}", (answeredCount + 1).toString())
                      .replace("{total}", polls.length.toString())}
                  </span>
                </div>

                {/* Countdown Progress Bar (only shown when user is answering) */}
                {!feedback?.isAnswered ? (
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        timeLeft > 10 
                          ? "bg-emerald-500" 
                          : timeLeft > 5 
                            ? "bg-amber-500" 
                            : "bg-red-500 animate-pulse"
                      }`}
                      style={{ width: `${(timeLeft / 20) * 100}%` }}
                    />
                  </div>
                ) : (
                  /* Static progress bar when showing feedback */
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-700"
                      style={{ width: `${((answeredCount) / polls.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold leading-snug text-white">
                  {getTranslatedQuestion(activePoll)}
                </h2>
                <p className="text-[10px] text-zinc-500 italic font-semibold">{uiTexts.siteGuide}</p>
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {activePoll.options.map((option, idx) => {
                  const optionText = getTranslatedOption(option);
                  const isSelected = selectedAnswer === idx;
                  const isCorrectAnswer = feedback?.isAnswered && feedback.correctOptionIndex === idx;
                  const isTrivia = activePoll.correct_option_index >= 0;

                  let optionStyle = "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60";
                  let indicatorIcon = null;

                  if (feedback?.isAnswered) {
                    if (isTrivia) {
                      if (isCorrectAnswer) {
                        optionStyle = "border-emerald-500/50 bg-emerald-950/40 text-emerald-200 font-semibold ring-1 ring-emerald-500/20";
                        indicatorIcon = <Check className="h-4.5 w-4.5 text-emerald-400" />;
                      } else if (isSelected) {
                        optionStyle = "border-red-500/50 bg-red-950/30 text-red-300";
                        indicatorIcon = <X className="h-4.5 w-4.5 text-red-400" />;
                      } else {
                        optionStyle = "border-zinc-900 bg-zinc-950/40 text-zinc-500 opacity-50";
                      }
                    } else {
                      // Opinion poll style
                      optionStyle = isSelected
                        ? "border-blue-500/40 bg-blue-950/20 text-blue-200 font-semibold"
                        : "border-zinc-900 bg-zinc-950/40 text-zinc-500 opacity-50";
                      if (isSelected) {
                        indicatorIcon = <Check className="h-4.5 w-4.5 text-blue-400" />;
                      }
                    }
                  } else if (isSelected) {
                    optionStyle = "border-emerald-500 bg-emerald-950/10 text-emerald-400 ring-1 ring-emerald-500/30";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={feedback?.isAnswered || !isSignedIn}
                      onClick={() => handleSelectOption(idx)}
                      className={`relative flex w-full items-center justify-between rounded-2xl border p-4.5 text-left text-sm transition-all ${optionStyle}`}
                    >
                      <span>{optionText}</span>
                      {indicatorIcon}
                    </button>
                  );
                })}
              </div>

              {/* Answer / Feedback box */}
              {feedback && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-250 ${
                  feedback.isCorrect 
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" 
                    : "bg-red-950/20 border-red-500/30 text-red-200"
                }`}>
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-black text-sm">
                      {selectedAnswer === -1 
                        ? (locale === "tr" ? "Süre doldu!" : "Time is up!") 
                        : feedback.isCorrect 
                          ? uiTexts.feedbackCorrect 
                          : uiTexts.feedbackIncorrect}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {selectedAnswer === -1 
                        ? (locale === "tr" ? "Zamanında cevap veremediğiniz için bu soruyu boş geçtiniz." : "You skipped this question because you did not answer in time.")
                        : feedback.isCorrect 
                          ? `+${feedback.pointsAwarded} Taraftar Puanı kazandınız.` 
                          : activePoll.correct_option_index >= 0 
                            ? `Doğru cevap: ${getTranslatedOption(activePoll.options[feedback.correctOptionIndex])}`
                            : `Cevabınız kaydedildi. +${feedback.pointsAwarded} Taraftar Puanı kazandınız.`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2">
                {!feedback?.isAnswered ? (
                  <button
                    disabled={selectedAnswer === null || submitting || !isSignedIn}
                    onClick={() => handleAnswerSubmit(activePoll.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-black text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:scale-100 disabled:cursor-not-allowed text-sm"
                  >
                    {submitting ? "..." : uiTexts.btnSubmit}
                  </button>
                ) : (
                  <button
                    onClick={() => handleNextQuestion(activePoll.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 py-4 font-black text-white hover:bg-zinc-800 hover:border-zinc-700 active:scale-[0.98] transition-all text-sm"
                  >
                    {answeredCount + 1 === polls.length ? uiTexts.btnResults : uiTexts.btnNext}
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            </div>
          )
        )
      )}
    </PageShell>
  );
}
