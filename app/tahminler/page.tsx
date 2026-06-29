"use client";

import { PageShell } from "@/components/PageShell";
import { TournamentGate } from "@/components/TournamentGate";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { generateGroupFixtures, sortMatchesChronologically } from "@/lib/fixtures";
import { getTeamById } from "@/data/teams";
import { getAdjustedDate } from "@/lib/tournament/time-helper";
import { useTournament } from "@/contexts/TournamentContext";
import type { UserActivity } from "@/lib/store/gamification-store";
import type { MatchResult, GroupId } from "@/lib/types/tournament";
import { KNOCKOUT_DEFS } from "@/lib/knockout";

const localDict = {
  tr: {
    title: "Tahmin Merkezi",
    subtitle: "2026 Dünya Kupası grup maçları skorlarını tahmin edin, taraftar puanı kazanın!",
    statusTitle: "Genel Tahmin Durumunuz",
    notSubmitted: "🟢 Henüz genel tahminlerinizi kaydetmediniz. 1 kereye mahsus ÜCRETSİZ ilk tahmin hakkınız aktiftir!",
    submitted: "🔴 Genel tahmin hakkınızı kullandınız! Maçları düzenlemek için MinMat mini-oyunundan kazandığınız güncelleme haklarını harcamalısınız.",
    rightsLabel: "Tahmin Değiştirme Hakkınız",
    rightsActive: "Aktif Anahtar",
    matchDay: "Grup",
    realScore: "Gerçek Skor",
    notPlayed: "Oynanmadı",
    savePredictions: "Tüm Tahminleri Kaydet ve Genel Hakkı Kilitle",
    updateSingleMatch: "Kaydet (1 Güncelleme Anahtarı 🔑 Tüketir)",
    aiButton: "AI Tahminini ve Analizini Gör",
    lockedMatch: "🔒 Maç Başladı / Kilitlendi",
    noMinMatGames: "🔒 Bu tahmini görmek için bugün Minmat'ta en az 5 oyun oynamalısın!",
    noMatches: "Listelenecek maç bulunamadı.",
    errorKickoff: "Maç günü veya saati geldiği için tahmin kilitlendi!",
    saveSuccess: "Tahminleriniz başarıyla kaydedildi!",
    saveError: "Tahminler kaydedilirken bir hata oluştu: ",
    loading: "Tahmin verileriniz yükleniyor...",
    noUser: "Tahmin yapabilmek için lütfen giriş yapın.",
    unlockToEdit: "Tahmini Düzenle (1 🔑 Harcar)",
    cancelEdit: "İptal",
    scoreRequired: "Lütfen ev sahibi ve deplasman skorlarının ikisini de girin!"
  },
  en: {
    title: "Prediction Center",
    subtitle: "Predict 2026 World Cup group stage scores and earn fan points!",
    statusTitle: "Your General Prediction Status",
    notSubmitted: "🟢 You have not saved your general predictions yet. Your 1-time FREE initial prediction right is active!",
    submitted: "🔴 You have spent your free prediction right! To modify scores, you must spend update keys earned from the MinMat mini-game.",
    rightsLabel: "Your Prediction Change Rights",
    rightsActive: "Active Key",
    matchDay: "Group",
    realScore: "Real Score",
    notPlayed: "Not Played",
    savePredictions: "Save All Predictions & Lock Free Right",
    updateSingleMatch: "Save (Consumes 1 Update Key 🔑)",
    aiButton: "View AI Prediction & Analysis",
    lockedMatch: "🔒 Match Started / Locked",
    noMinMatGames: "🔒 You must play at least 5 games in MinMat today to view this AI prediction!",
    noMatches: "No matches found.",
    errorKickoff: "Match has already started, prediction locked!",
    saveSuccess: "Predictions saved successfully!",
    saveError: "An error occurred while saving predictions: ",
    loading: "Loading your prediction data...",
    noUser: "Please sign in to make predictions.",
    unlockToEdit: "Edit Prediction (Spend 1 🔑)",
    cancelEdit: "Cancel",
    scoreRequired: "Please enter both home and away scores!"
  },
  es: {
    title: "Centro de Pronósticos",
    subtitle: "¡Predice los resultados de la fase de grupos de la Copa del Mundo 2026 y gana puntos de aficionado!",
    statusTitle: "Tu Estado de Pronóstico General",
    notSubmitted: "🟢 Aún no has guardado tus pronósticos generales. ¡Tu derecho inicial GRATUITO de una vez está activo!",
    submitted: "🔴 ¡Has usado tu derecho de pronóstico libre! Para modificar, debes gastar las llaves de actualización ganadas en MinMat.",
    rightsLabel: "Tus Derechos de Modificación",
    rightsActive: "Llave Activa",
    matchDay: "Grupo",
    realScore: "Resultado Real",
    notPlayed: "No Jugado",
    savePredictions: "Guardar Todos los Pronósticos y Bloquear Derecho Libre",
    updateSingleMatch: "Guardar (Consume 1 Llave de Actualización 🔑)",
    aiButton: "Ver Pronóstico y Análisis de IA",
    lockedMatch: "🔒 Partido Iniciado / Bloqueado",
    noMinMatGames: "🔒 ¡Debes jugar al menos 5 partidas en MinMat hoy para ver esta predicción de IA!",
    noMatches: "No se encontraron partidos.",
    errorKickoff: "¡El partido ya ha comenzado, pronóstico bloqueado!",
    saveSuccess: "¡Pronósticos guardados con éxito!",
    saveError: "Ocurrió un error al guardar los pronósticos: ",
    loading: "Cargando tus datos de pronóstico...",
    noUser: "Por favor inicia sesión para hacer pronósticos.",
    unlockToEdit: "Editar Pronóstico (Gastar 1 🔑)",
    cancelEdit: "Cancelar",
    scoreRequired: "¡Por favor ingresa ambos marcadores, local y visitante!"
  },
  fr: {
    title: "Centre de Pronostics",
    subtitle: "Pronostiquez les scores de la phase de groupes de la Coupe du Monde 2026 et gagnez des points !",
    statusTitle: "Votre Statut de Pronostic Général",
    notSubmitted: "🟢 Vous n'avez pas encore enregistré vos pronostics généraux. Votre droit initial GRATUIT unique est actif !",
    submitted: "🔴 Vous avez utilisé votre droit de pronostic gratuit ! Pour modifier, vous devez dépenser des clés d'activation MinMat.",
    rightsLabel: "Vos Droits de Modification",
    rightsActive: "Clé Active",
    matchDay: "Groupe",
    realScore: "Score Réel",
    notPlayed: "Non Joué",
    savePredictions: "Enregistrer tous les Pronostics & Verrouiller le Droit Libre",
    updateSingleMatch: "Enregistrer (Consomme 1 Clé d'Activation 🔑)",
    aiButton: "Voir le Pronostic & l'Analyse IA",
    lockedMatch: "🔒 Match Commencé / Verrouillé",
    noMinMatGames: "🔒 Vous devez jouer au moins 5 parties dans MinMat aujourd'hui pour voir cette prédiction IA !",
    noMatches: "Aucun match trouvé.",
    errorKickoff: "Le match a déjà commencé, pronostic verrouillé !",
    saveSuccess: "Pronostics enregistrés avec succès !",
    saveError: "Une erreur est survenue lors de l'enregistrement: ",
    loading: "Chargement de vos pronostics...",
    noUser: "Veuillez vous connecter pour faire des pronostics.",
    unlockToEdit: "Modifier le Pronostic (Dépenser 1 🔑)",
    cancelEdit: "Annuler",
    scoreRequired: "Veuillez entrer les scores domicile et extérieur !"
  },
  de: {
    title: "Tippspiel-Zentrum",
    subtitle: "Tippen Sie die Ergebnisse der WM-Gruppenphase 2026 und sammeln Sie Fan-Punkte!",
    statusTitle: "Ihr allgemeiner Tipp-Status",
    notSubmitted: "🟢 Sie haben Ihre allgemeinen Tipps noch nicht gespeichert. Ihr einmaliges KOSTENLOSES Erst-Tipprecht ist aktiv!",
    submitted: "🔴 Sie haben Ihr kostenloses Tipprecht aufgebraucht! Um Tipps zu ändern, müssen Sie MinMat-Schlüssel einlösen.",
    rightsLabel: "Ihre Tipp-Änderungsrechte",
    rightsActive: "Aktiver Schlüssel",
    matchDay: "Gruppe",
    realScore: "Echtes Ergebnis",
    notPlayed: "Nicht Gespielt",
    savePredictions: "Alle Tipps Speichern & Erst-Tipprecht Sperren",
    updateSingleMatch: "Speichern (Verbraucht 1 Schlüssel 🔑)",
    aiButton: "KI-Tipp & Analyse anzeigen",
    lockedMatch: "🔒 Spiel Gestartet / Gesperrt",
    noMinMatGames: "🔒 Sie müssen heute mindestens 5 Spiele in MinMat spielen, um diese KI-Vorhersage zu sehen!",
    noMatches: "Keine Spiele gefunden.",
    errorKickoff: "Das Spiel hat bereits begonnen, Tipp gesperrt!",
    saveSuccess: "Tipps erfolgreich gespeichert!",
    saveError: "Fehler beim Speichern der Tipps: ",
    loading: "Tippdaten werden geladen...",
    noUser: "Bitte melden Sie sich an, um Tipps abzugeben.",
    unlockToEdit: "Tipp bearbeiten (1 🔑 verbrauchen)",
    cancelEdit: "Abbrechen",
    scoreRequired: "Bitte geben Sie sowohl Heim- als auch Auswärtstore ein!"
  }
};

const TIMEZONES = [
  { id: "TSİ", name: "Türkiye (UTC+3)", offset: 3 },
  { id: "UTC", name: "UTC (GMT)", offset: 0 },
  { id: "EST", name: "ABD Doğu / NY (UTC-5)", offset: -5 },
  { id: "PST", name: "ABD Pasifik / LA (UTC-8)", offset: -8 },
  { id: "CST", name: "Meksika (UTC-6)", offset: -6 },
  { id: "CET", name: "Avrupa (UTC+1)", offset: 1 },
];

export default function PredictionCenterPage() {
  const { locale } = useTranslation();
  const { user, isLoaded: authLoaded } = useUser();
  const { matches, knockoutBracket } = useTournament();

  const activeLang = (locale in localDict ? locale : "en") as keyof typeof localDict;
  const dict = localDict[activeLang];

  const [profile, setProfile] = useState<UserActivity | null>(null);
  const [dbPredictions, setDbPredictions] = useState<Record<string, { home: number; away: number }>>({});
  
  // Local score states (strings for natural typing, formatted later)
  const [localScores, setLocalScores] = useState<Record<string, { home: string; away: string }>>({});
  
  // Single match editing toggle state (key triggers edit mode)
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // matchId or 'batch'
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [timezoneId, setTimezoneId] = useState("TSİ");

  const [aiAnalyses, setAiAnalyses] = useState<Record<string, { skor: string; analiz: string }>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});

  const [tahminTab, setTahminTab] = useState<"groups" | "r32">("groups");

  // Tüm grup aşaması maçlarını kronolojik olarak listele
  const upcomingMatches = useMemo(() => {
    return sortMatchesChronologically(matches);
  }, [matches]);

  const r32Matches = useMemo(() => {
    return knockoutBracket.filter((m) => m.round === "r32");
  }, [knockoutBracket]);

  const displayedMatches = useMemo(() => {
    return tahminTab === "groups" ? upcomingMatches : r32Matches;
  }, [tahminTab, upcomingMatches, r32Matches]);

  const getPlaceholderTeamName = (sym: string | undefined, opts: GroupId[] | undefined, locale: string) => {
    if (sym) {
      const group = sym[0];
      const rank = sym[1];
      if (locale === "tr") {
        return `${group} Grubu ${rank === "1" ? "Lideri" : "İkincisi"}`;
      } else {
        return `${rank === "1" ? "Winner" : "Runner-up"} Group ${group}`;
      }
    }
    if (opts && opts.length > 0) {
      if (locale === "tr") {
        return `En İyi 3. (${opts.join("/")})`;
      } else {
        return `Best 3rd (${opts.join("/")})`;
      }
    }
    return "TBD";
  };

  const getKnockoutMatchName = (match: any) => {
    const def = KNOCKOUT_DEFS.find((d) => d.id === match.id);
    return def ? def.name : match.slot || "Son 32";
  };

  // Bugünün tarihine en yakın oynanmamış maçı bul (Initial Scroll Odak Noktası)
  const closestMatch = useMemo(() => {
    const unplayed = upcomingMatches.filter((m) => !m.played && m.homeScore === null);
    if (unplayed.length === 0) return null;

    const now = Date.now();
    let minDiff = Infinity;
    let closest = unplayed[0];

    unplayed.forEach((m) => {
      const [tsiHourStr, tsiMinStr] = (m.time || "12:00").split(":");
      const tsiHour = parseInt(tsiHourStr, 10);
      const tsiMin = parseInt(tsiMinStr, 10);
      const [yearStr, monthStr, dayStr] = m.date.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      const tsiDate = new Date(Date.UTC(year, month, day, tsiHour, tsiMin, 0));
      const matchUtcTime = tsiDate.getTime() - 3 * 60 * 60 * 1000;

      const diff = Math.abs(matchUtcTime - now);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    });

    return closest;
  }, [upcomingMatches]);

  // Sayfa yüklendiğinde bugünün en yakın oynanmamış maçına odaklan (Auto-scroll)
  useEffect(() => {
    if (!loading && closestMatch) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`match-card-${closestMatch.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, closestMatch]);

  // Fetch prediction and profile details
  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/predictions");
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setDbPredictions(data.predictions);

        // Prepopulate input states for all matches
        const prepopulated: Record<string, { home: string; away: string }> = {};
        const allMatches = [...upcomingMatches, ...r32Matches];
        allMatches.forEach((m) => {
          const saved = data.predictions[m.id];
          prepopulated[m.id] = {
            home: saved ? saved.home.toString() : "",
            away: saved ? saved.away.toString() : "",
          };
        });
        setLocalScores(prepopulated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoaded && user) {
      fetchData();
    } else if (authLoaded && !user) {
      setLoading(false);
    }
  }, [user, authLoaded, knockoutBracket]);

  const handleViewAiPrediction = async (matchId: string, homeTeamId: string | null, awayTeamId: string | null) => {
    if (!user || !profile) {
      alert(dict.noUser);
      return;
    }

    if (!homeTeamId || !awayTeamId) return;

    // Check if the user played at least 5 games today in MinMat
    const playedToday = profile.minmatOyunSayisiBugun || 0;
    if (playedToday < 5) {
      const alertMsg = dict.noMinMatGames || "🔒 Bu tahmini görmek için bugün Minmat'ta en az 5 oyun oynamalısın!";
      alert(alertMsg);
      return;
    }

    setAiLoading((prev) => ({ ...prev, [matchId]: true }));
    setAiError((prev) => ({ ...prev, [matchId]: "" }));

    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeTeamId,
          awayTeamId,
          locale: activeLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analysis) {
          setAiAnalyses((prev) => ({
            ...prev,
            [matchId]: {
              skor: data.analysis.skor,
              analiz: data.analysis.analiz,
            },
          }));
        } else {
          setAiError((prev) => ({ ...prev, [matchId]: "AI analizi yüklenemedi." }));
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        setAiError((prev) => ({
          ...prev,
          [matchId]:
            res.status === 403 && errData.error
              ? errData.error
              : "Sunucu hatası.",
        }));
      }
    } catch (err) {
      console.error(err);
      setAiError((prev) => ({ ...prev, [matchId]: "Ağ hatası oluştu." }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  // Handle score text input changes
  const handleScoreChange = (matchId: string, side: "home" | "away", val: string) => {
    setLocalScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: val,
      },
    }));
  };

  // Submit batch of initial predictions
  const handleBatchSave = async () => {
    if (!user || !profile) return;
    setActionLoading("batch");
    setMessage(null);

    // Format local scores to numbers
    const payload: Record<string, { home: number; away: number }> = {};
    let filledCount = 0;
    upcomingMatches.forEach((m) => {
      const score = localScores[m.id];
      if (score && score.home !== "" && score.away !== "") {
        payload[m.id] = {
          home: parseInt(score.home, 10),
          away: parseInt(score.away, 10),
        };
        filledCount++;
      }
    });

    if (filledCount === 0) {
      setMessage({ text: dict.scoreRequired, type: "error" });
      setActionLoading(null);
      return;
    }

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions: payload,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setDbPredictions(data.predictions);
        setMessage({ text: dict.saveSuccess, type: "success" });
        window.dispatchEvent(new CustomEvent("taraftar-puan-guncellendi"));
      } else {
        setMessage({ text: `${dict.saveError} ${data.error}`, type: "error" });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setMessage({ text: `${dict.saveError} ${err.message}`, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // Save single match prediction using a change key (tahminGuncellemeHakki)
  const handleSingleSave = async (matchId: string) => {
    if (!user || !profile) return;
    const score = localScores[matchId];
    if (!score || score.home === "" || score.away === "") {
      setMessage({ text: dict.scoreRequired, type: "error" });
      return;
    }

    setActionLoading(matchId);
    setMessage(null);

    const payload = {
      [matchId]: {
        home: parseInt(score.home, 10),
        away: parseInt(score.away, 10),
      },
    };

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions: payload,
          singleMatchId: matchId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setDbPredictions(data.predictions);
        setEditingMatches((prev) => ({ ...prev, [matchId]: false }));
        const successMsg = locale === "tr"
          ? `🔁 Tahminin Başarıyla Güncellendi! (Kalan Hak: ${data.profile.tahminGuncellemeHakki})`
          : `🔁 Prediction Successfully Updated! (Remaining Rights: ${data.profile.tahminGuncellemeHakki})`;
        setMessage({ text: successMsg, type: "success" });
        window.dispatchEvent(new CustomEvent("taraftar-puan-guncellendi"));
      } else {
        setMessage({ text: `${dict.saveError} ${data.error}`, type: "error" });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setMessage({ text: `${dict.saveError} ${err.message}`, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  if (!authLoaded || loading) {
    return (
      <PageShell title={dict.title} subtitle={dict.subtitle}>
        <div className="flex flex-col items-center justify-center py-20 text-emerald-400 font-extrabold gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse">{dict.loading}</p>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell title={dict.title} subtitle={dict.subtitle}>
        <div className="max-w-md mx-auto text-center py-16 px-6 border border-zinc-800 bg-zinc-950/60 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-4xl mx-auto shadow-inner">
            🔒
          </div>
          <h2 className="text-xl font-black text-white">{dict.title}</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{dict.noUser}</p>
          <SignInButton mode="redirect" forceRedirectUrl="/tahminler">
            <button className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#060b14] font-black text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95">
              Giriş Yap / Kaydol
            </button>
          </SignInButton>
        </div>
      </PageShell>
    );
  }

  const isFreeSubmitActive = profile && !profile.genelTahminHakkiKullanildi;

  return (
    <PageShell title={dict.title} subtitle={dict.subtitle}>
      {/* Top Banner widgets */}
      {profile && (
        <section className="grid gap-4 md:grid-cols-2 mb-10">
          {/* Status banner */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                {dict.statusTitle}
              </h3>
              <p className="text-sm text-zinc-200 font-medium leading-relaxed">
                {profile.genelTahminHakkiKullanildi ? dict.submitted : dict.notSubmitted}
              </p>
            </div>
            {!profile.genelTahminHakkiKullanildi && (
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  İlk Tahmin Hakkı Aktif
                </span>
              </div>
            )}
          </div>

          {/* Change rights banner */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            <div>
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                {locale === "tr" ? "🔁 Kalan Maç Güncelleme Hakkın" : "🔁 Remaining Match Update Rights"}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-indigo-400 drop-shadow-lg">
                  {profile.tahminGuncellemeHakki}
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  {dict.rightsActive} 🔑
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-4 leading-normal">
              ℹ️ MinMat mini-oyununu oynayarak skor rekorları kırıp daha fazla tahmin değiştirme anahtarı 🔑 kazanabilirsiniz.
            </p>
          </div>
        </section>
      )}

      {/* Message Notifications */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          <span className="text-lg">{message.type === "success" ? "🏆" : "⚠️"}</span>
          <p>{message.text}</p>
        </div>
      )}

      {/* Tab Switcher: Grup vs Son 32 */}
      <div className="flex border-b border-white/10 mb-6 gap-6 z-10 relative">
        <button
          type="button"
          onClick={() => setTahminTab("groups")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            tahminTab === "groups"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          {locale === "tr" ? "Grup Aşaması Tahminleri" : "Group Stage Predictions"}
        </button>
        <button
          type="button"
          onClick={() => setTahminTab("r32")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            tahminTab === "r32"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          {locale === "tr" ? "Son 32 Turu Tahminleri" : "Round of 32 Predictions"}
        </button>
      </div>

      {/* Match Cards List */}
      <section className="space-y-6">
        
        {/* Timezone Selector Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">
              {locale === "tr" ? "🌍 Saat Dilimi Seçimi:" : "🌍 Timezone Selection:"}
            </span>
            <select
              value={timezoneId}
              onChange={(e) => setTimezoneId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-indigo-400 hover:text-white outline-none focus:border-indigo-500 transition-all font-black cursor-pointer shadow-inner"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold relative z-10">
            {locale === "tr"
              ? `ℹ️ Maç başlama saatleri seçtiğiniz saat dilimine (${timezoneId === "TSİ" ? "Türkiye'ye" : timezoneId}) göre otomatik dönüştürülmektedir.`
              : `ℹ️ Match kick-off times are automatically converted to your selected timezone (${timezoneId === "TSİ" ? "Turkey" : timezoneId}).`}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {displayedMatches.map((matchItem) => {
            const match = matchItem as any;
            const home = match.homeTeamId ? getTeamById(match.homeTeamId) : null;
            const away = match.awayTeamId ? getTeamById(match.awayTeamId) : null;
            const def = KNOCKOUT_DEFS.find((d: any) => d.id === match.id) as any;
            const isKnockout = match.id.startsWith("r32-") || match.id.startsWith("r16-") || match.id.startsWith("qf-") || match.id.startsWith("sf-") || match.id.startsWith("final-");

            // Calculate dynamic timezone kickoff date and time using base TSİ time (UTC+3)
            const selectedTimezone = TIMEZONES.find((t) => t.id === timezoneId) || TIMEZONES[0];
            const [tsiHourStr, tsiMinStr] = (match.time || "12:00").split(":");
            const tsiHour = parseInt(tsiHourStr, 10);
            const tsiMin = parseInt(tsiMinStr, 10);

            const [yearStr, monthStr, dayStr] = match.date.split("-");
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1;
            const day = parseInt(dayStr, 10);
            const rawDate = new Date(Date.UTC(year, month, day, tsiHour, tsiMin, 0));
            // Base time is in TSİ (UTC+3), convert to actual UTC Date
            const actualUtcDate = new Date(rawDate.getTime() - 3 * 60 * 60 * 1000);

            // Apply selected timezone offset compared to actual UTC time
            const convertedDate = new Date(actualUtcDate.getTime() + selectedTimezone.offset * 60 * 60 * 1000);

            const formattedDate = convertedDate.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long",
              timeZone: "UTC",
            });

            const formattedTime = convertedDate.toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            });

            // Check timing locks
            const isMatchStarted = getAdjustedDate() >= actualUtcDate;

            // Check prediction input state
            // Unlocked if:
            // 1. Match not started AND (initial free submit mode OR user has update rights OR user toggled edit mode for this card)
            const hasUpdateRights = profile && profile.tahminGuncellemeHakki > 0;
            const isEditing = editingMatches[match.id];
            const isInputDisabled = isMatchStarted || !home || !away || 
              (!isKnockout && !isFreeSubmitActive && !hasUpdateRights && !isEditing);

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:p-4.5 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all duration-300 shadow-2xl flex flex-col justify-between"
              >
                {/* Visual background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 via-transparent to-transparent pointer-events-none" />

                {/* Card content structure */}
                <div className="space-y-3">
                  
                  {/* Kickoff top bar */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-500 border-b border-zinc-900 pb-1.5 mb-1.5">
                    <span className="font-extrabold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest text-[9px]">
                      {isKnockout ? getKnockoutMatchName(match) : `${dict.matchDay} ${match.group}`}
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>📅 {formattedDate}</span>
                      <span className="text-zinc-400 font-extrabold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 ml-1">
                        ⏰ {formattedTime}{selectedTimezone.id !== "TSİ" ? ` (${selectedTimezone.id})` : ""}
                      </span>
                    </div>
                  </div>

                  {/* ROW 1: Team Info (VS Row) */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4 py-1">
                    {/* Home Team */}
                    <Link 
                      href={home ? `/ulkeler/${home.id}` : "#"}
                      onClick={(e) => { if (!home) e.preventDefault(); }}
                      className={`flex items-center gap-2.5 sm:gap-3 flex-1 overflow-hidden ${
                        home ? "hover:text-emerald-400 cursor-pointer transition-colors group" : "cursor-default"
                      }`}
                    >
                      <div className="relative w-9 h-6 sm:w-10 sm:h-6.5 overflow-hidden rounded shadow border border-zinc-800/60 transition-all flex-shrink-0">
                        {home ? (
                          <img
                            src={home.flagUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 font-extrabold text-[10px]">
                            ?
                          </div>
                        )}
                      </div>
                      <span className="text-zinc-100 font-black text-xs sm:text-sm truncate">
                        {home 
                          ? (locale === "tr" ? home.nameTr : home.nameEn) 
                          : getPlaceholderTeamName(def?.homeSym, undefined, locale)
                        }
                      </span>
                    </Link>

                    {/* VS Indicator */}
                    <span className="text-zinc-500 font-black text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 bg-zinc-900 border border-zinc-800 rounded-lg flex-shrink-0">
                      VS
                    </span>

                    {/* Away Team */}
                    <Link 
                      href={away ? `/ulkeler/${away.id}` : "#"}
                      onClick={(e) => { if (!away) e.preventDefault(); }}
                      className={`flex items-center gap-2.5 sm:gap-3 flex-1 justify-end text-right overflow-hidden ${
                        away ? "hover:text-emerald-400 cursor-pointer transition-colors group" : "cursor-default"
                      }`}
                    >
                      <span className="text-zinc-100 font-black text-xs sm:text-sm truncate">
                        {away 
                          ? (locale === "tr" ? away.nameTr : away.nameEn) 
                          : getPlaceholderTeamName(undefined, def?.awayOpts, locale)
                        }
                      </span>
                      <div className="relative w-9 h-6 sm:w-10 sm:h-6.5 overflow-hidden rounded shadow border border-zinc-800/60 transition-all flex-shrink-0">
                        {away ? (
                          <img
                            src={away.flagUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 font-extrabold text-[10px]">
                            ?
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* ROW 2: Real Result */}
                  <div className="text-center py-1.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs sm:text-sm font-extrabold text-zinc-400">
                    {match.played || match.homeScore !== null ? (
                      <span className="text-emerald-400">
                        {dict.realScore}: {match.homeScore} - {match.awayScore}
                      </span>
                    ) : (
                      <span>{dict.notPlayed}</span>
                    )}
                  </div>

                  {/* ROW 3: User Prediction inputs and Card Submit */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 sm:p-3.5 flex flex-col items-center gap-2.5 shadow-inner">
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="number"
                        min="0"
                        value={localScores[match.id]?.home ?? ""}
                        onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                        disabled={isInputDisabled}
                        className="w-12 h-11 text-center bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded-xl text-white font-extrabold text-lg transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        placeholder="-"
                      />
                      <span className="text-zinc-600 font-bold">-</span>
                      <input
                        type="number"
                        min="0"
                        value={localScores[match.id]?.away ?? ""}
                        onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                        disabled={isInputDisabled}
                        className="w-12 h-11 text-center bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded-xl text-white font-extrabold text-lg transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        placeholder="-"
                      />
                    </div>

                    {/* Context Action Buttons */}
                    {isMatchStarted ? (
                      <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 mt-1 select-none">
                        {dict.lockedMatch}
                      </div>
                    ) : (!home || !away) ? (
                      <div className="text-[10px] font-bold text-zinc-500 text-center select-none py-1 leading-relaxed">
                        ⚠️ {locale === "tr" ? "Eşleşen takımlar henüz belli değil." : "Teams are not yet determined."}
                      </div>
                    ) : isKnockout ? (
                      <button
                        onClick={() => handleSingleSave(match.id)}
                        disabled={actionLoading !== null}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        {actionLoading === match.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          locale === "tr" ? "Tahmini Kaydet" : "Save Prediction"
                        )}
                      </button>
                    ) : isFreeSubmitActive ? (
                      // Batch mode - just placeholder or instructions
                      <span className="text-[10px] text-zinc-500 font-medium tracking-wide text-center">
                        ✓ Genel tahmin hakkınızla kaydedilecektir.
                      </span>
                    ) : (
                      // Single change right operations
                      <div className="w-full flex gap-2 justify-center mt-1">
                        {hasUpdateRights ? (
                          <button
                            onClick={() => handleSingleSave(match.id)}
                            disabled={actionLoading !== null}
                            className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-[#060b14] text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            {actionLoading === match.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-[#060b14] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "🔁 " + (locale === "tr" ? "Tahmini Güncelle (1 🔑)" : "Update Prediction (1 🔑)")
                            )}
                          </button>
                        ) : !isEditing ? (
                          <button
                            onClick={() => setEditingMatches((prev) => ({ ...prev, [match.id]: true }))}
                            disabled={!profile || profile.tahminGuncellemeHakki <= 0}
                            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-black text-indigo-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:border-zinc-800 disabled:hover:text-indigo-400 transition-all active:scale-95 shadow"
                          >
                            {dict.unlockToEdit}
                          </button>
                        ) : (
                          <div className="w-full flex gap-2">
                            <button
                              onClick={() => {
                                setEditingMatches((prev) => ({ ...prev, [match.id]: false }));
                                // Revert to db values
                                const saved = dbPredictions[match.id];
                                setLocalScores((prev) => ({
                                  ...prev,
                                  [match.id]: {
                                    home: saved ? saved.home.toString() : "",
                                    away: saved ? saved.away.toString() : "",
                                  },
                                }));
                              }}
                              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-black text-zinc-400 hover:text-white transition-all"
                            >
                              {dict.cancelEdit}
                            </button>
                            <button
                              onClick={() => handleSingleSave(match.id)}
                              disabled={actionLoading !== null}
                              className="flex-grow py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-[#060b14] text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              {actionLoading === match.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-[#060b14] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "🔑 " + dict.updateSingleMatch
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ROW 4: Yapay Zeka Bölümü (AI prediction - interactive) */}
                <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-col gap-2">
                  <div className="flex justify-end">
                    {aiAnalyses[match.id] ? (
                      <span className="text-[10px] sm:text-xs font-extrabold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow select-none">
                        🧠 {dict.aiButton || "AI Analizini Gör"} ✅
                      </span>
                    ) : (
                      <button
                        onClick={() => handleViewAiPrediction(match.id, match.homeTeamId, match.awayTeamId)}
                        disabled={aiLoading[match.id] || !home || !away}
                        className="text-[10px] sm:text-xs font-black text-zinc-300 hover:text-white bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/25 hover:border-indigo-500/40 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        🧠 {aiLoading[match.id] ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          dict.aiButton || "AI Analizini Gör"
                        )}
                        <span className="text-[9px] bg-zinc-900 text-indigo-400 border border-indigo-950 px-1 py-0.5 rounded font-black">
                          {profile && (profile.minmatOyunSayisiBugun ?? 0) >= 5 ? "🔓 AÇIK" : "🔒 KİLİTLİ"}
                        </span>
                      </button>
                    )}
                  </div>

                  {aiAnalyses[match.id] && (
                    <>
                      {/* UI Guard: Eğer yorum boş veya null ise o yoruma ait metin kutusunu/kartını tamamen gizle, sadece skor tahminini temiz göster */}
                      {(!aiAnalyses[match.id].analiz || aiAnalyses[match.id].analiz.trim() === "" || match.played) ? (
                        <div className="flex justify-center items-center py-2 animate-fadeIn">
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
                            AI Tahmini: {aiAnalyses[match.id].skor}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-indigo-950/15 border border-indigo-900/35 text-[11px] leading-relaxed text-zinc-300 animate-fadeIn shadow-inner flex flex-col gap-1.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              AI Tahmini: {aiAnalyses[match.id].skor}
                            </span>
                          </div>
                          <p className="text-zinc-400 font-medium">{aiAnalyses[match.id].analiz}</p>
                        </div>
                      )}
                    </>
                  )}

                  {aiError[match.id] && (
                    <div className="text-[10px] text-rose-400 font-semibold text-right">
                      ⚠️ {aiError[match.id]}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Global Save Button for FREE Initial Submit */}
        {isFreeSubmitActive && (
          <div className="mt-10 p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-base">
                {dict.savePredictions}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
                ⚠️ Bu buton girmiş olduğunuz tüm maç skorlarını veritabanına topluca kaydeder ve turnuva başı ücretsiz tahmin hakkınızı tamamlayıp kilitler. Lütfen tüm skorları doğru girdiğinizden emin olun!
              </p>
            </div>
            <button
              onClick={handleBatchSave}
              disabled={actionLoading !== null}
              className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#060b14] font-black text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
              {actionLoading === "batch" ? (
                <div className="w-4 h-4 border-2 border-[#060b14] border-t-transparent rounded-full animate-spin" />
              ) : (
                "💾 " + dict.savePredictions
              )}
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
