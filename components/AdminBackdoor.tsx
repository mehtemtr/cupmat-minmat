"use client";

import { useState, useEffect, useRef } from "react";

export default function AdminBackdoor() {
  const keySequenceRef = useRef<string[]>([]);
  const [toast, setToast] = useState<{
    type: "loading" | "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if typing in input/textarea/select fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      if (!/^[a-z]$/.test(key)) {
        keySequenceRef.current = [];
        return;
      }

      keySequenceRef.current.push(key);

      if (keySequenceRef.current.length > 15) {
        keySequenceRef.current.shift();
      }

      const currentString = keySequenceRef.current.join("");

      if (currentString.endsWith("ajtran")) {
        console.log("🔐 Admin Backdoor tetiklendi: AJTRAN");
        const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "";
        
        setToast({ type: "loading", message: "📰 NewsGlo Haber Taraması Başlatılıyor..." });
        
        fetch(`/api/cron/fetch-news`, { 
          method: "GET",
          headers: { "Authorization": `Bearer ${secret}` }
        })
          .then(async (newsRes) => {
            if (newsRes.ok) {
              setToast({ type: "success", message: "✅ NewsGlo Haberleri Başarıyla Güncellendi!" });
            } else {
              const data = await newsRes.json().catch(() => ({}));
              setToast({ 
                type: "error", 
                message: `❌ Haber Hatası: ${data.error || newsRes.statusText || "Bilinmeyen Hata"}` 
              });
            }
            setTimeout(() => setToast({ type: null, message: "" }), 5000);
          })
          .catch((err) => {
            setToast({ type: "error", message: `❌ Sunucu Hatası: ${err.message || String(err)}` });
            setTimeout(() => setToast({ type: null, message: "" }), 5000);
          });

        keySequenceRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!toast.type) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform scale-100 ${
      toast.type === "loading"
        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300 animate-pulse"
        : toast.type === "success"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
        : "bg-red-500/10 border-red-500/30 text-red-300"
    }`}>
      {toast.type === "loading" && (
        <span className="text-lg animate-spin">⏳</span>
      )}
      {toast.type === "success" && (
        <span className="text-lg">✅</span>
      )}
      {toast.type === "error" && (
        <span className="text-lg">❌</span>
      )}
      <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
    </div>
  );
}
