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
      if (!event.data) return;

      // Sadece kendi origin'imizden gelen taleplere yanıt verelim
      if (event.data.type === "GET_CLERK_TOKEN") {
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

      if (event.data.type === "SHARE_SCORE") {
        const { score, mode, name, lang } = event.data;
        const currentLang = (lang || "tr").toLowerCase();
        
        const shareTexts: Record<string, string> = {
          tr: "MinMat Zeka ve Matematik Oyununda {score} puan yaptım! Rekorumu geçebilir misin? 🏆",
          en: "I scored {score} in MinMat Brain & Math Game! Can you beat my record? 🏆",
          de: "Ich habe {score} Punkte im MinMat-Mathespiel erreicht! Kannst du meinen Rekord schlagen? 🏆",
          fr: "J'ai obtenu {score} points au jeu de maths MinMat ! Peux-tu battre mon record ? 🏆",
          es: "¡Conseguí {score} puntos en el juego matemático MinMat! ¿Puedes vencer mi récord? 🏆",
          pt: "Fiz {score} pontos no jogo de matemática MinMat! Consegue superar o meu recorde? 🏆",
          it: "Ho fatto {score} punti nel gioco matematico MinMat! Riesci a battere il mio record? 🏆",
          ko: "MinMat 두뇌 수학 게임에서 {score}점을 기록했습니다! 제 기록을 깨보시겠어요? 🏆",
          ar: "لقد سجلت {score} نقطة في لعبة الذكاء والرياضيات MinMat! هل يمكنك تحطيم رقمي القياسي؟ 🏆",
        };

        const copySuccessAlerts: Record<string, string> = {
          tr: "Paylaşım bağlantısı panoya kopyalandı!",
          en: "Sharing link copied to clipboard!",
          de: "Teilungslink in die Zwischenablage kopiert!",
          fr: "Lien de partage copié dans le presse-papiers !",
          es: "¡Enlace para compartir copiado al portapapeles!",
          pt: "Link de compartilhamento copiado para a área de transferência!",
          it: "Link di condivisione copiato negli appunti!",
          ko: "공유 링크가 클립보드에 복사되었습니다!",
          ar: "تم نسخ رابط المشاركة إلى الحافظة!",
        };

        const textTemplate = shareTexts[currentLang] || shareTexts.en;
        const text = textTemplate.replace("{score}", String(score));
        const shareUrl = `${window.location.origin}/minmat/share?score=${score}&mode=${mode}&name=${encodeURIComponent(name)}&lang=${currentLang}`;

        const handleSuccess = () => {
          const iframe = document.querySelector("iframe");
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: "SHARE_SUCCESS" }, "*");
          }
        };

        if (navigator.share) {
          navigator.share({
            title: "MinMat",
            text: text,
            url: shareUrl,
          })
          .then(() => {
            console.log("[PARENT] Native share completed successfully.");
            handleSuccess();
          })
          .catch((err) => {
            console.log("[PARENT] Native share failed or was cancelled:", err);
          });
        } else {
          // Clipboard fallback
          try {
            navigator.clipboard.writeText(`${text} ${shareUrl}`)
            .then(() => {
              const alertMsg = copySuccessAlerts[currentLang] || copySuccessAlerts.en;
              alert(alertMsg);
              handleSuccess();
            })
            .catch((clipErr) => {
              console.error("[PARENT] Clipboard copy failed:", clipErr);
            });
          } catch (fallbackErr) {
            console.error("[PARENT] Fallback sharing error:", fallbackErr);
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
    <div className="fixed inset-x-0 top-0 bottom-16 md:top-16 md:bottom-0 bg-[#060b14] overflow-hidden flex flex-col">
      <div className="w-full flex-1 overflow-hidden">
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
