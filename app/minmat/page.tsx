"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function MinMatPage() {
  const { getToken } = useAuth();

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
    <div className="min-h-screen bg-[#060b14]">
      <div className="w-full h-screen">
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
