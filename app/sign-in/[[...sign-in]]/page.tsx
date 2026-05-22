"use client";

import { Suspense, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { clearClientSessionStorage } from "@/lib/auth/client-session-storage";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/cupmat";
  const isFresh = searchParams.get("fresh") === "1";

  useEffect(() => {
    if (isFresh) {
      clearClientSessionStorage();
    }
  }, [isFresh]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] px-4 py-12">
      <p className="mb-6 max-w-md text-center text-sm text-zinc-400">
        Devam etmek için hesabınızı seçin veya yeni bir hesapla giriş yapın.
      </p>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#060b14] text-zinc-400">
          Yükleniyor...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
