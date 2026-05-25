"use client";

import { useEffect, useRef } from "react";

export default function AdminBackdoor() {
  const keySequenceRef = useRef<string[]>([]);
  const targetSequence = ["a", "j", "a", "n"];
  const ctrlPressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        ctrlPressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        ctrlPressedRef.current = false;
        keySequenceRef.current = [];
        return;
      }

      if (!ctrlPressedRef.current) return;

      const key = e.key.toLowerCase();
      keySequenceRef.current.push(key);

      if (keySequenceRef.current.length > targetSequence.length) {
        keySequenceRef.current.shift();
      }

      const isMatch = keySequenceRef.current.length === targetSequence.length &&
        keySequenceRef.current.every((k, i) => k === targetSequence[i]);

      if (isMatch) {
        console.log("🔐 Admin Backdoor tetiklendi: AJAN");
        const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "";
        fetch(`/api/ai-agent?task=full&secret=${secret}`, { method: "GET" }).catch(() => {});
        keySequenceRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return null;
}
