"use client";

import { Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LocaleContext";

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="border-t border-white/10 bg-[#060b14] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <Trophy className="h-5 w-5 text-emerald-400" />
            <span className="text-sm">{t("footer.tagline")}</span>
          </div>
          <p className="text-xs text-zinc-600">{t("footer.rights")}</p>
          
          <div className="mt-4 max-w-4xl rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-[10px] leading-relaxed text-zinc-500 sm:text-xs">
            <strong className="text-zinc-400">Yasal Uyarı:</strong> statmatik.com / Statmatik uygulamasında yer alan tüm içerikler, istatistikler ve tahminler yalnızca bilgilendirme ve analiz amaçlıdır; kesinlikle yatırım tavsiyesi, iddaa veya şans oyunları yönlendirmesi içermez. Bu verilerin kullanımından doğabilecek maddi/manevi zararlardan ve tüm hukuki sonuçlardan tamamen kullanıcının kendisi sorumludur. Uygulamamız kumar veya bahis oynatmaz.
          </div>
        </div>
      </div>
    </footer>
  );
}
