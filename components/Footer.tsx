"use client";

import { Trophy, Instagram, Facebook, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LocaleContext";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="border-t border-white/10 bg-[#060b14] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <Trophy className="h-5 w-5 text-emerald-400" />
            <span className="text-sm">{t("footer.tagline")}</span>
          </div>

          {/* Social Media & Feedback */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 my-1 text-zinc-400">
            <a 
              href="https://x.com/Statmatikcom" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-sky-400 transition-colors duration-200 text-xs sm:text-sm font-medium"
              title="X"
            >
              <XIcon className="h-4 w-4" />
              <span>X</span>
            </a>
            <a 
              href="https://www.instagram.com/statmatik/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-pink-500 transition-colors duration-200 text-xs sm:text-sm font-medium"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61590443797517" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200 text-xs sm:text-sm font-medium"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </a>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <a 
              href="mailto:info.mahtemyazilim@gmail.com" 
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors duration-200 text-xs sm:text-sm font-medium"
              title="E-posta"
            >
              <Mail className="h-4 w-4" />
              <span>info.mahtemyazilim@gmail.com</span>
            </a>
          </div>

          <p className="text-xs text-zinc-600">{t("footer.rights")}</p>
          
          <div className="flex justify-center gap-4 text-xs text-zinc-500 mb-2">
            <a href="/privacy.html" target="_blank" className="hover:text-emerald-400 transition-colors underline decoration-zinc-700 underline-offset-4">
              Gizlilik Politikası / Privacy Policy
            </a>
          </div>

          <div className="max-w-4xl rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-[10px] leading-relaxed text-zinc-500 sm:text-xs">
            <strong className="text-zinc-400">Yasal Uyarı:</strong> statmatik.com / Statmatik uygulamasında yer alan tüm içerikler, istatistikler ve tahminler yalnızca bilgilendirme ve analiz amaçlıdır; kesinlikle yatırım tavsiyesi, iddaa veya şans oyunları yönlendirmesi içermez. Bu verilerin kullanımından doğabilecek maddi/manevi zararlardan ve tüm hukuki sonuçlardan tamamen kullanıcının kendisi sorumludur. Uygulamamız kumar veya bahis oynatmaz.
          </div>
        </div>
      </div>
    </footer>
  );
}
