"use client";

import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

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

  // Splash Screen/Loading indicator while evaluating session
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100">
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-4 shadow-2xl shadow-indigo-500/20 animate-bounce flex items-center justify-center">
          <Activity className="h-full w-full text-slate-950 font-black" />
        </div>
        <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full animate-infinite-scroll animate-pulse" />
        </div>
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase animate-pulse">
          Initializing CorpCRM Router...
        </p>
      </div>
    </div>
  );
}
