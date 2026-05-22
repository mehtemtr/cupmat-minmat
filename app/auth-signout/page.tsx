"use client";

import { useEffect, Suspense } from "react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { clearClientSessionStorage } from "@/lib/auth/client-session-storage";
import { buildSignInUrl } from "@/lib/auth/sign-in-url";

function AuthSignOutContent() {
  const { signOut, session } = useClerk();
  const { isLoaded, isSignedIn } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded) return;

    const returnTo = searchParams.get("redirect") || "/cupmat";
    const signInUrl = buildSignInUrl(returnTo);

    const performSignOut = async () => {
      clearClientSessionStorage();

      try {
        await session?.reload();
      } catch {
        // Oturum zaten sonlanmış olabilir
      }

      try {
        if (isSignedIn) {
          await signOut({
            redirectUrl: signInUrl,
            sessionId: session?.id,
          });
          return;
        }
      } catch (err) {
        console.error("SignOut error:", err);
      }

      window.location.replace(signInUrl);
    };

    performSignOut();
  }, [isLoaded, isSignedIn, signOut, session, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        <p className="font-bold text-zinc-400">
          Çıkış yapılıyor... / Signing out...
        </p>
      </div>
    </div>
  );
}

export default function AuthSignOutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      }
    >
      <AuthSignOutContent />
    </Suspense>
  );
}
