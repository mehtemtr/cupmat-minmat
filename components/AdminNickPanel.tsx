"use client";

import { useState, useEffect, useRef } from "react";
import { X, Copy, Check, AlertCircle, Database } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  nickname: string | null;
  created_at: string;
}

export function AdminNickPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [copied, setCopied] = useState(false);
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

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/bulk-update");
      if (!res.ok) throw new Error("Veriler çekilemedi");
      const data = await res.json();
      setProfiles(data);
      setJsonInput(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!jsonInput.trim()) {
      setError("JSON boş olamaz");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const data = JSON.parse(jsonInput);
      const res = await fetch("/api/profile/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Güncelleme başarısız");
      }

      setSuccess(true);
      await fetchProfiles();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geçersiz JSON formatı");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!showPanel) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#060b14] shadow-2xl shadow-emerald-500/10">
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
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
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

          <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-300">📊 Tüm Profiller</h3>
                <span className="text-xs text-zinc-500">{profiles.length} kullanıcı</span>
              </div>
              <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#060b14] border-b border-white/10">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">E-posta</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-zinc-400 uppercase">Nickname</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-xs font-mono text-zinc-500 truncate max-w-[100px]">
                          {profile.id.slice(0, 12)}...
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-300 truncate max-w-[180px]">
                          {profile.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${profile.nickname ? "text-emerald-400" : "text-red-400"}`}>
                            {profile.nickname || "❌ BOŞ"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-300">📝 JSON Düzenleme</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Kopyalandı!" : "Kopyala"}
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="flex-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none"
                placeholder="Profilleri yükledikten sonra JSON buraya gelecek..."
              />
              <button
                onClick={handleSave}
                disabled={saving || !jsonInput.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-bold text-emerald-950 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
              >
                {saving ? "⏳ Kaydediliyor..." : "💾 Supabase'i Güncelle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
