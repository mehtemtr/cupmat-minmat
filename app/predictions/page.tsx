"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PredictionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tahminler");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-emerald-400 font-extrabold gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="animate-pulse">Yönlendiriliyorsunuz...</p>
    </div>
  );
}
