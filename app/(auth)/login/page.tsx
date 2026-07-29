"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const demoProfiles = {
  admin: { label: "Admin", email: "admin@corpcrm.dev", pass: "Admin123!" },
  employee: { label: "Employee", email: "alice.freeman@corpcrm.dev", pass: "Employee123!" },
};

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
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_440px]">
        <section className="flex flex-col justify-between border-zinc-200 px-6 py-8 lg:border-r lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-950" />
              <span className="text-sm font-semibold tracking-tight">CorpCRM</span>
            </div>
            <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
              Private beta
            </span>
          </div>

          <div className="my-20 max-w-2xl lg:my-0">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.26em] text-zinc-500">
              Tasks · People · Focus
            </p>
            <h1 className="text-5xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-7xl">
              A quieter CRM for precise teams.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Minimal surfaces, clear hierarchy, and fast role-based access keep the work visible without visual noise.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
            {['Instant demo access', 'Role-aware dashboard', 'Calm monochrome UI'].map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center px-6 py-10 lg:px-10">
          <div className="w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-semibold tracking-[-0.04em]">Sign in</h2>
              <p className="mt-2 text-sm text-zinc-500">Choose a demo profile or enter credentials manually.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2">
              {(Object.keys(demoProfiles) as Array<keyof typeof demoProfiles>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseProfile(key)}
                  className={`rounded-2xl border px-4 py-3 text-left transition hover:border-zinc-950 ${
                    selectedProfile === key ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm font-medium">
                    {demoProfiles[key].label}
                    {selectedProfile === key && <Check className="h-4 w-4" />}
                  </div>
                  <div className={`mt-1 truncate text-xs ${selectedProfile === key ? "text-zinc-300" : "text-zinc-500"}`}>
                    {demoProfiles[key].email}
                  </div>
                </button>
              ))}
            </div>

            {generalError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@corpcrm.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-950 ${
                      fieldErrors.email?.length ? "border-red-300" : "border-zinc-200"
                    }`}
                  />
                </div>
                {fieldErrors.email?.map((err) => <span key={err} className="mt-1 block text-xs text-red-600">{err}</span>)}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:border-zinc-950 ${
                      fieldErrors.password?.length ? "border-red-300" : "border-zinc-200"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password?.map((err) => <span key={err} className="mt-1 block text-xs text-red-600">{err}</span>)}
              </label>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Continue"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
