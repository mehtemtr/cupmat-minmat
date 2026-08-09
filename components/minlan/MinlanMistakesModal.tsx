"use client";

import React, { useState, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/minlan/types";
import { X, BrainCircuit, AlertCircle, RefreshCw } from "lucide-react";

interface MinlanMistakesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nativeLang: LanguageCode;
  targetLang: LanguageCode;
}

export function MinlanMistakesModal({
  isOpen,
  onClose,
  nativeLang,
  targetLang,
}: MinlanMistakesModalProps) {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchMistakes() {
      setLoading(true);
      try {
        const timestamp = Date.now();
        const res = await fetch(
          `/api/minlan/mistakes?native=${nativeLang}&target=${targetLang}&t=${timestamp}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success && data.mistakes) {
          setMistakes(data.mistakes);
        }
      } catch (err) {
        console.error("Failed to fetch mistakes", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMistakes();
  }, [isOpen, nativeLang, targetLang]);

  if (!isOpen) return null;

  const nativeObj = SUPPORTED_LANGUAGES.find((l) => l.code === nativeLang);
  const targetObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Hata Analizi</h3>
              <p className="text-xs text-slate-400">Son 3 günde en çok karıştırılanlar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-3">
          <div className="text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
            {nativeObj?.flag} {nativeObj?.name} → {targetObj?.flag} {targetObj?.name}
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-500/50" />
              <span>Veriler analiz ediliyor...</span>
            </div>
          ) : mistakes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 border border-emerald-500/20">
                <span className="text-2xl">🎉</span>
              </div>
              <span className="font-bold text-emerald-400">Harika iş çıkarıyorsun!</span>
              <span className="text-sm">Son 3 günde kayıtlı hatan bulunmuyor.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {mistakes.map((m, idx) => (
                <div
                  key={m.word_id || idx}
                  className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{m.native_word}</span>
                    <span className="text-xs text-purple-300 font-mono">{m.target_word}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-black text-red-400">{m.count} Hata</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
