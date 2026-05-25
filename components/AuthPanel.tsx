"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton, SignOutButton, UserProfile } from "@clerk/nextjs";
import { Settings, LogOut, User as UserIcon } from "lucide-react";

export default function AuthPanel() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [nickname, setNickname] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      localStorage.setItem("clerk_user_id", user.id);
      fetchNickname();
    }
  }, [isSignedIn, user]);

  const fetchNickname = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/profile/nickname");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setNickname(data.nickname);
          setNewNickname(data.nickname);
        }
      }
    } catch (error) {
      console.error("Nickname çekme hatası:", error);
    }
  };

  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: newNickname.trim() }),
      });

      if (res.ok) {
        setNickname(newNickname.trim());
        setIsEditingNickname(false);
      }
    } catch (error) {
      console.error("Nickname güncelleme hatası:", error);
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
      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-emerald-950 font-bold text-sm hover:bg-emerald-400 transition-colors">
            <UserIcon className="h-4 w-4" />
            Giriş Yap / Kayıt Ol
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 relative z-50">
      {!isEditingNickname ? (
        <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white font-semibold text-sm">
          {nickname || user?.username || user?.fullName || "Kullanıcı"}
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Yeni nick..."
          />
          <button
            onClick={handleSaveNickname}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "..." : "Kaydet"}
          </button>
          <button
            onClick={() => {
              setIsEditingNickname(false);
              setNewNickname(nickname);
            }}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20"
          >
            İptal
          </button>
        </div>
      )}

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
              onClick={() => setIsEditingNickname(!isEditingNickname)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm font-medium"
            >
              {isEditingNickname ? "✓ Nick Düzenleniyor" : "✏️ Nick Değiştir"}
            </button>
            
            <button
              onClick={() => {
                setShowUserProfile(true);
                setShowSettings(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white text-sm font-medium"
            >
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
