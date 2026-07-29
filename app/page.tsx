"use client";

import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black text-neutral-100">
      <div className="flex items-center gap-3">
        {/* Simple elegant Vercel-style loading spinner */}
        <div className="h-4 w-4 animate-spin rounded-full border border-neutral-800 border-t-neutral-200" />
        <span className="text-xs font-mono text-neutral-400 tracking-wider">
          Redirecting...
        </span>
      </div>
    </div>
  );
}
