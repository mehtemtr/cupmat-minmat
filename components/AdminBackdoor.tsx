"use client";

import { useEffect, useRef } from "react";

export default function AdminBackdoor() {
  const keySequenceRef = useRef<string[]>([]);
  const targetSequence = ["a", "j", "t", "r", "a", "n"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (!/^[a-z]$/.test(key)) {
        keySequenceRef.current = [];
        return;
      }

      keySequenceRef.current.push(key);

      if (keySequenceRef.current.length > targetSequence.length) {
        keySequenceRef.current.shift();
      }

      const isMatch = keySequenceRef.current.length === targetSequence.length &&
        keySequenceRef.current.every((k, i) => k === targetSequence[i]);

      if (isMatch) {
        console.log("🔐 Admin Backdoor tetiklendi: AJTRAN");
        const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "";
        fetch(`/api/ai-agent?task=full&secret=${secret}`, { method: "GET" }).catch(() => {});
        keySequenceRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
