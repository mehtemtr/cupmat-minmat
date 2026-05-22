"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { buildSignInUrl } from "@/lib/auth/sign-in-url";

function AuthRedirectContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded) return;

    const redirectUrl = searchParams.get("redirect") || "/minmat/index.html";

    if (isSignedIn) {
      window.location.replace(redirectUrl);
      return;
    }

    window.location.replace(buildSignInUrl(redirectUrl));
  }, [isLoaded, isSignedIn, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="font-bold text-zinc-400">
          Yönlendiriliyorsunuz... / Redirecting...
        </p>
      </div>
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  );
}
