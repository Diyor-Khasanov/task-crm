"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-zinc-950">
      <div className="flex flex-col items-center gap-5">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white shadow-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-950" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">
          Opening workspace
        </p>
      </div>
    </main>
  );
}
