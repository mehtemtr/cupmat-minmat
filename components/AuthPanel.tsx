"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton, SignOutButton, UserProfile } from "@clerk/nextjs";
import { Settings, LogOut, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthPanel() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [nickname, setNickname] = useState<string>("");
  const [tempNickname, setTempNickname] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      localStorage.setItem("clerk_user_id", user.id);
      fetchOrCreateNickname();
    }
  }, [isSignedIn, user]);

  const fetchOrCreateNickname = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/profile/nickname");
      if (res.ok) {
        const data = await res.json();
        if (data && data.nickname) {
          setNickname(data.nickname);
          setTempNickname(data.nickname);
        }
      }
    } catch (error) {
      console.error("Nickname hatası:", error);
    }
  };

  const handleBlur = async () => {
    if (!user || !tempNickname.trim() || tempNickname === nickname) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkRes = await fetch(`/api/profile/nickname?nickname=${encodeURIComponent(tempNickname.trim())}`);
      const checkData = await checkRes.json();

      if (!checkData.unique) {
        setError("Bu takma ad zaten kullanımda, lütfen başka bir isim seçin!");
        setTempNickname(nickname);
        return;
      }

      const res = await fetch("/api/profile/nickname", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: tempNickname.trim() }),
      });

      if (res.ok) {
        setNickname(tempNickname.trim());
      } else {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu");
        setTempNickname(nickname);
      }
    } catch (error) {
      console.error("Nickname güncelleme hatası:", error);
      setError("Sunucu hatası");
      setTempNickname(nickname);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
        <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2 relative z-50">
        <input
          type="text"
          value="Kartal1903"
          readOnly
          className="px-4 py-2 rounded-full text-sm font-semibold focus:outline-none transition-all bg-white/10 border border-white/20 text-white/50 cursor-not-allowed w-44"
          title="Giriş yapmadınız"
        />
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-emerald-950 font-bold text-sm hover:bg-emerald-400 transition-colors">
            <UserIcon className="h-4 w-4" />
            Giriş Yap
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 relative z-50">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBlur();
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold focus:outline-none transition-all w-44 ${
              error 
                ? "bg-red-500/10 border border-red-500/50 text-red-300 focus:border-red-400" 
                : "bg-white/10 border border-white/20 text-white focus:border-emerald-500"
            }`}
            placeholder="Takma adınız..."
          />
          
          {loading && (
            <div className="flex items-center gap-1 px-3 py-2 text-yellow-400 text-xs font-semibold">
              <span className="animate-pulse">⏳</span>
              Kaydediliyor...
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
        title="Ayarlar"
      >
        <Settings className="h-4 w-4 text-white" />
      </button>

      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-xl bg-[#060b14] border border-white/10 shadow-2xl p-4">
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowUserProfile(true);
                setShowSettings(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm font-medium"
            >
              <UserIcon className="h-4 w-4" />
              ⚙️ Hesap Ayarları
            </button>

            <div className="pt-2 border-t border-white/10">
              <SignOutButton>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 text-sm font-medium">
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            <button
              onClick={() => setShowUserProfile(false)}
              className="absolute -top-12 right-0 text-white hover:text-emerald-400 text-xl font-bold"
            >
              ✕ Kapat
            </button>
            <UserProfile 
              appearance={{
                elements: {
                  card: "bg-[#060b14] border border-white/10 rounded-2xl shadow-2xl",
                  headerTitle: "text-white font-bold",
                  headerSubtitle: "text-zinc-400",
                  navbarButton: "text-white hover:text-emerald-400",
                  navbarButtonActive: "text-emerald-400 border-b-emerald-400",
                  formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950",
                  formFieldLabel: "text-zinc-300",
                  formFieldInput: "bg-white/10 border-white/20 text-white",
                  socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border-white/10",
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
