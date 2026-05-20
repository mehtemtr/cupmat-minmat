"use client";

import { useEffect, Suspense } from "react";
import { useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

function AuthSignOutContent() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ redirectUrl: "/" });
      } catch (err) {
        console.error("SignOut error:", err);
      }
    };
    performSignOut();
  }, [signOut, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-zinc-400">Çıkış yapılıyor... / Signing out...</p>
      </div>
    </div>
  );
}

export default function AuthSignOutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#060b14] text-white">
        <div className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthSignOutContent />
    </Suspense>
  );
}
