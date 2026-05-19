"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function AuthRedirectContent() {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded) {
      const redirectUrl = searchParams.get("redirect") || "/minmat/index.html";
      // Redirect back
      window.location.href = redirectUrl;
    }
  }, [isLoaded, isSignedIn, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-zinc-400">Yönlendiriliyorsunuz... / Redirecting...</p>
      </div>
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthRedirectContent />
    </Suspense>
  );
}
