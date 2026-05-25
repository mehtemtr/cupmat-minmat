"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, AlertCircle, Database, Save } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  created_at: string;
}

export function AdminNickPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editableProfiles, setEditableProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const keySequence = useRef<string[]>([]);
  const targetSequence = ["n", "i", "c", "k"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (!/^[a-z]$/.test(key)) {
        keySequence.current = [];
        return;
      }

      keySequence.current.push(key);

      if (keySequence.current.length > targetSequence.length) {
        keySequence.current.shift();
      }

      const isMatch = keySequence.current.length === targetSequence.length &&
        keySequence.current.every((k, i) => k === targetSequence[i]);

      if (isMatch) {
        setShowPanel(true);
        keySequence.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && editableProfiles.length > 0) {
      const changed = profiles.some((p, i) => p.nickname !== editableProfiles[i].nickname);
      setHasChanges(changed);
    }
  }, [editableProfiles, profiles]);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-agent?task=bulk_get");
      if (!res.ok) throw new Error("Veriler çekilemedi");
      const data = await res.json();
      setProfiles(data);
      setEditableProfiles([...data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameChange = (index: number, newNickname: string) => {
    const updated = [...editableProfiles];
    updated[index] = { ...updated[index], nickname: newNickname.trim() || null };
    setEditableProfiles(updated);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/ai-agent?task=bulk_update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableProfiles),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Güncelleme başarısız");
      }

      setSuccess(true);
      setProfiles([...editableProfiles]);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (!showPanel) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#060b14] shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Nick Düzenleme Paneli</h2>
              <p className="text-xs text-zinc-400">NICK yazarak açılır</p>
            </div>
          </div>
          <button
            onClick={() => setShowPanel(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfiles}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
              >
                {loading ? "⏳ Veriler çekiliyor..." : "🔄 Profilleri Yükle"}
              </button>

              {success && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-emerald-400 text-sm font-semibold">
                  <Check className="h-4 w-4" />
                  Başarıyla güncellendi!
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-400 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges || profiles.length === 0}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all shadow-lg ${
                hasChanges && !saving
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-emerald-950 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/20"
                  : "bg-white/10 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <span className="animate-pulse">⏳</span>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Değişiklikleri Kaydet
                  {hasChanges && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">!</span>}
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {profiles.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <Database className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Henüz veri yok</p>
                <p className="text-sm mt-1">Profilleri yüklemek için yukarıdaki butona tıklayın</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#060b14] border-b border-white/10">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase w-28">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">E-posta</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase w-64">Nickname (Düzenlenebilir)</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase w-20">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {editableProfiles.map((profile, index) => {
                      const isChanged = profiles[index]?.nickname !== profile.nickname;
                      const isEmpty = !profile.nickname;

                      return (
                        <tr key={profile.id} className={`hover:bg-white/5 transition-colors ${isChanged ? "bg-emerald-500/5" : ""}`}>
                          <td className="px-4 py-3 text-xs font-mono text-zinc-500 truncate">
                            {profile.id.slice(0, 12)}...
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-300 truncate">
                            {profile.email}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={profile.nickname || ""}
                              onChange={(e) => handleNicknameChange(index, e.target.value)}
                              placeholder="Boş - tıklayın ve yazın..."
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all ${
                                isEmpty
                                  ? "bg-red-500/10 border border-red-500/30 text-red-300 focus:border-red-400 placeholder-red-500/50"
                                  : isChanged
                                  ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-300 focus:border-emerald-400"
                                  : "bg-white/5 border border-white/10 text-white focus:border-emerald-500/50"
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            {isEmpty ? (
                              <span className="text-xs text-red-400 font-bold">❌ BOŞ</span>
                            ) : isChanged ? (
                              <span className="text-xs text-emerald-400 font-bold">✏️ DEĞİŞTİ</span>
                            ) : (
                              <span className="text-xs text-zinc-500 font-medium">✓ OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
