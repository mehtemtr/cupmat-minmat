"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";

export default function MinMatPage() {
  const { getToken } = useAuth();
  const { locale } = useLocale();

  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      console.log("[PARENT] Sending LOCALE_CHANGED to iframe:", locale);
      iframe.contentWindow.postMessage({ type: "LOCALE_CHANGED", locale }, "*");
    }
  }, [locale]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Sadece kendi origin'imizden gelen taleplere yanıt verelim
      if (event.data && event.data.type === "GET_CLERK_TOKEN") {
        try {
          const freshToken = await getToken();
          console.log("[PARENT] Iframe için Clerk tokenı başarıyla alındı.");
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ token: freshToken });
          }
        } catch (err) {
          console.error("[PARENT] Clerk tokenı alınamadı:", err);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ token: null });
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [getToken]);

  return (
    <div className="min-h-screen bg-[#060b14] pt-16">
      <div className="w-full h-[calc(100vh-64px)]">
        <iframe 
          src="/minmat/index.html" 
          className="w-full h-full border-0 block"
          title="MinMat Oyunu"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      </div>
    </div>
  );
}
