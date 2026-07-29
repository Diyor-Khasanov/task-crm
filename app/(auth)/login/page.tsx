"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const demoProfiles = {
  admin: { label: "Admin", email: "admin@corpcrm.dev", pass: "Admin123!", meta: "Command center" },
  employee: { label: "Employee", email: "alice.freeman@corpcrm.dev", pass: "Employee123!", meta: "Personal queue" },
};

const proofPoints = ["12 active squads", "98% task clarity", "04 overdue risks"];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedProfile, setSelectedProfile] = useState<"admin" | "employee" | null>(null);

  const chooseProfile = (type: "admin" | "employee") => {
    const profile = demoProfiles[type];
    setEmail(profile.email);
    setPassword(profile.pass);
    setSelectedProfile(type);
    setGeneralError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        login(result.data);
      } else if (response.status === 422 && result.error?.fieldErrors) {
        setFieldErrors(result.error.fieldErrors);
        setGeneralError(result.error.message || "Please correct the highlighted fields.");
      } else if (response.status === 401) {
        setGeneralError("Invalid email or password.");
      } else {
        setGeneralError(result.error?.message || "Unable to sign in. Please try again.");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setGeneralError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-950">
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full border border-black/10" />
      <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] translate-x-1/3 translate-y-1/3 rounded-full border-[5rem] border-black/5" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 p-4 lg:grid-cols-[1fr_500px] lg:p-6">
        <section className="relative flex min-h-[52rem] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-zinc-950 p-6 text-white sm:p-10 lg:min-h-0">
          <div className="absolute inset-px rounded-[2.2rem] mono-noise opacity-35" />
          <div className="absolute right-8 top-8 h-40 w-40 rounded-full border border-white/20" />
          <div className="absolute -bottom-20 left-12 h-64 w-64 rounded-full border-[3rem] border-white/10" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-zinc-950 shadow-[8px_8px_0_rgba(255,255,255,0.18)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-semibold tracking-tight">CorpCRM</span>
                <span className="text-xs text-white/55">Monochrome operating system</span>
              </div>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">Private beta</span>
          </div>

          <div className="relative z-10 my-16 max-w-3xl lg:my-0">
            <p className="mb-6 w-fit rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
              Tasks · People · Focus
            </p>
            <h1 className="text-6xl font-black leading-[0.86] tracking-[-0.08em] sm:text-8xl lg:text-9xl">
              Work, cut into signal.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/68">
              A high-contrast CRM with editorial rhythm, decisive cards, and role-aware views that keep teams moving without decoration overload.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div key={item} className="rounded-3xl border border-white/15 bg-white/8 p-4 backdrop-blur">
                <div className="text-2xl font-semibold tracking-[-0.05em]">{item.slice(0, 2)}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">{item.slice(3)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center px-2 py-8 lg:px-8">
          <div className="w-full rounded-[2rem] border border-zinc-200 bg-white/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.10)] backdrop-blur sm:p-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Secure entry</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.06em]">Sign in</h2>
              </div>
              <div className="hidden h-16 w-16 rounded-full border border-zinc-950 sm:block" />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              {(Object.keys(demoProfiles) as Array<keyof typeof demoProfiles>).map((key) => (
                <button key={key} type="button" onClick={() => chooseProfile(key)} className={`group rounded-3xl border p-4 text-left transition ${selectedProfile === key ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950 hover:-translate-y-0.5 hover:border-zinc-950"}`}>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    {demoProfiles[key].label}
                    {selectedProfile === key && <Check className="h-4 w-4" />}
                  </div>
                  <div className={`mt-3 text-xs ${selectedProfile === key ? "text-zinc-300" : "text-zinc-500"}`}>{demoProfiles[key].meta}</div>
                </button>
              ))}
            </div>

            {generalError && <div className="mb-4 rounded-2xl border border-zinc-950 bg-white px-4 py-3 text-sm font-medium text-zinc-950 shadow-[5px_5px_0_#09090b]">{generalError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input id="email" type="email" required placeholder="name@corpcrm.dev" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full rounded-2xl border bg-white py-4 pl-11 pr-4 text-sm outline-none transition focus:border-zinc-950 focus:shadow-[5px_5px_0_#09090b] ${fieldErrors.email?.length ? "border-zinc-950" : "border-zinc-200"}`} />
                </div>
                {fieldErrors.email?.map((err) => <span key={err} className="mt-1 block text-xs text-zinc-700">{err}</span>)}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Password</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full rounded-2xl border bg-white py-4 pl-11 pr-12 text-sm outline-none transition focus:border-zinc-950 focus:shadow-[5px_5px_0_#09090b] ${fieldErrors.password?.length ? "border-zinc-950" : "border-zinc-200"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-950" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password?.map((err) => <span key={err} className="mt-1 block text-xs text-zinc-700">{err}</span>)}
              </label>

              <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Enter workspace"}
                {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
