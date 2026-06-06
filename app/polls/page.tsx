"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { PageShell } from "@/components/PageShell";
import { useTranslation, useLocale } from "@/contexts/LocaleContext";
import { Check, X, Award, AlertCircle, Vote, CheckCircle2 } from "lucide-react";

interface PollOption {
  tr: string;
  en: string;
  es?: string;
  fr?: string;
  de?: string;
  pt?: string;
  it?: string;
  ko?: string;
  ar?: string;
  [key: string]: string | undefined;
}

interface Poll {
  id: string;
  question_tr: string;
  question_en: string;
  question_es?: string;
  question_fr?: string;
  question_de?: string;
  question_pt?: string;
  question_it?: string;
  question_ko?: string;
  question_ar?: string;
  options: PollOption[];
  correct_option_index: number;
  points_reward: number;
  active_until: string | null;
  created_at: string;
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
  const { isSignedIn, user } = useUser();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, UserSubmission>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchPolls();
  }, [isSignedIn]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/polls");
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls);
        // Map user submissions by pollId
        const subMap: Record<string, UserSubmission> = {};
        if (data.userSubmissions) {
          data.userSubmissions.forEach((sub: UserSubmission) => {
            subMap[sub.poll_id] = sub;
          });
        }
        setSubmissions(subMap);
      }
    } catch (err) {
      console.error("Error fetching polls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (pollId: string, optionIndex: number) => {
    // Prevent changing answer if already submitted
    if (submissions[pollId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [pollId]: optionIndex }));
  };

  const handleSubmit = async (pollId: string) => {
    const selectedIndex = selectedAnswers[pollId];
    if (selectedIndex === undefined || submissions[pollId] || submitting[pollId]) return;

    try {
      setSubmitting((prev) => ({ ...prev, [pollId]: true }));
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, selectedOptionIndex: selectedIndex }),
      });
      const data = await res.json();

      if (data.success) {
        // Record submission locally
        const newSub: UserSubmission = {
          poll_id: pollId,
          selected_option_index: selectedIndex,
          is_correct: data.isCorrect,
          points_awarded: data.pointsAwarded,
          submitted_at: new Date().toISOString(),
        };

        setSubmissions((prev) => ({ ...prev, [pollId]: newSub }));
        
        // Show success alert
        setNotification({
          message: data.message || (data.isCorrect ? t("polls.correctAnswer") : t("polls.incorrectAnswer").replace("{answer}", "")),
          type: data.isCorrect ? "success" : "error"
        });
        
        // Trigger page points update in header
        if (data.pointsAwarded > 0) {
          window.dispatchEvent(
            new CustomEvent("taraftar-puan-guncellendi", {
              detail: { points: null } // Forces header to re-fetch points
            })
          );
        }

        setTimeout(() => setNotification(null), 5000);
      } else {
        alert(data.error || "Cevap gönderilemedi.");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Bir hata oluştu.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  const getTranslatedQuestion = (poll: Poll) => {
    const localizedKey = `question_${locale}`;
    return poll[localizedKey] || poll.question_tr || poll.question_en;
  };

  const getTranslatedOption = (option: PollOption) => {
    return option[locale] || option.tr || option.en;
  };

  // Generate consistent opinion poll percentages based on poll ID and option index
  const getOpinionPercentages = (pollId: string, optionsCount: number) => {
    const hash = pollId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const percentages: number[] = [];
    let sum = 0;
    
    for (let i = 0; i < optionsCount; i++) {
      const val = ((hash + i * 17) % 40) + 10; // 10% to 50%
      percentages.push(val);
      sum += val;
    }

    // Normalize to 100%
    return percentages.map((p) => Math.round((p / sum) * 100));
  };

  return (
    <PageShell title={t("polls.title")} subtitle={t("polls.subtitle")}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200" 
            : "bg-red-950/80 border-red-500/30 text-red-200"
        }`}>
          {notification.type === "success" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" /> : <AlertCircle className="h-6 w-6 text-red-400" />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Guest Login Banner */}
      {!isSignedIn && (
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">{t("gamification.guestPrompt")}</h3>
              <p className="text-sm text-zinc-400">Her soru için en az 10 Taraftar Puanı kazanabilirsiniz!</p>
            </div>
          </div>
          <SignInButton mode="modal">
            <button className="w-full rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-zinc-950 transition-all hover:bg-emerald-400 sm:w-auto">
              {t("gamification.loginNow")}
            </button>
          </SignInButton>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-zinc-400">{t("predictions.loading")}</div>
      ) : polls.length === 0 ? (
        <div className="rounded-3xl border border-zinc-850 bg-zinc-900/20 py-20 text-center text-zinc-400">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
          <p>{t("polls.noActive")}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {polls.map((poll) => {
            const hasVoted = !!submissions[poll.id];
            const userSub = submissions[poll.id];
            const isTrivia = poll.correct_option_index >= 0;
            const selectedIdx = hasVoted ? userSub.selected_option_index : selectedAnswers[poll.id];
            const percentages = !isTrivia && hasVoted ? getOpinionPercentages(poll.id, poll.options.length) : null;

            return (
              <div 
                key={poll.id} 
                className={`flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-md transition-all ${
                  hasVoted 
                    ? isTrivia && userSub.is_correct 
                      ? "border-emerald-500/30 bg-zinc-950/20" 
                      : isTrivia 
                        ? "border-red-500/20 bg-zinc-950/10" 
                        : "border-zinc-800 bg-zinc-950/30"
                    : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700"
                }`}
              >
                <div>
                  {/* Category Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isTrivia 
                        ? "bg-amber-500/10 text-amber-400" 
                        : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {isTrivia ? <Award className="h-3.5 w-3.5" /> : <Vote className="h-3.5 w-3.5" />}
                      {isTrivia ? t("polls.triviaHeader") : t("polls.pollHeader")}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <Award className="h-4 w-4" />
                      {poll.points_reward} Puan
                    </span>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-white mb-6">
                    {getTranslatedQuestion(poll)}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {poll.options.map((option, idx) => {
                      const optionText = getTranslatedOption(option);
                      const isSelected = selectedIdx === idx;
                      const isCorrectAnswer = isTrivia && poll.correct_option_index === idx;
                      
                      let optionStyle = "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60";
                      let indicatorIcon = null;

                      if (hasVoted) {
                        if (isTrivia) {
                          if (isCorrectAnswer) {
                            optionStyle = "border-emerald-500/50 bg-emerald-950/40 text-emerald-200 font-medium";
                            indicatorIcon = <Check className="h-4 w-4 text-emerald-400" />;
                          } else if (isSelected) {
                            optionStyle = "border-red-500/50 bg-red-950/30 text-red-300";
                            indicatorIcon = <X className="h-4 w-4 text-red-400" />;
                          } else {
                            optionStyle = "border-zinc-900 bg-zinc-950/40 text-zinc-500 opacity-60";
                          }
                        } else {
                          // Opinion poll result display
                          optionStyle = isSelected
                            ? "border-blue-500/40 bg-blue-950/20 text-blue-200 font-semibold"
                            : "border-zinc-900 bg-zinc-950/40 text-zinc-400";
                          if (isSelected) {
                            indicatorIcon = <Check className="h-4 w-4 text-blue-400" />;
                          }
                        }
                      } else if (isSelected) {
                        optionStyle = "border-emerald-500 bg-emerald-950/10 text-emerald-400 ring-1 ring-emerald-500/30";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasVoted || !isSignedIn}
                          onClick={() => handleSelectOption(poll.id, idx)}
                          className={`relative flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm transition-all ${optionStyle}`}
                        >
                          {/* Percent bar background for opinion polls */}
                          {percentages && (
                            <div 
                              className={`absolute bottom-0 left-0 top-0 rounded-2xl opacity-10 transition-all duration-1000 ${
                                isSelected ? "bg-blue-500" : "bg-zinc-500"
                              }`}
                              style={{ width: `${percentages[idx]}%` }}
                            />
                          )}

                          <span className="relative z-10">{optionText}</span>
                          
                          <div className="relative z-10 flex items-center gap-3">
                            {percentages && (
                              <span className="text-xs font-semibold text-zinc-400">
                                {percentages[idx]}%
                              </span>
                            )}
                            {indicatorIcon}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                {!hasVoted && (
                  <button
                    disabled={selectedIdx === undefined || submitting[poll.id] || !isSignedIn}
                    onClick={() => handleSubmit(poll.id)}
                    className="w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {submitting[poll.id] ? "..." : t("polls.voteBtn")}
                  </button>
                )}

                {hasVoted && (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-950/40 py-2.5 text-center text-xs font-medium text-zinc-500">
                    <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                    {t("polls.alreadyVoted")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
