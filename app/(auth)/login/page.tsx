"use client";

import React, { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const demoProfiles = {
  admin: { label: "Admin Account", email: "admin@corpcrm.dev", pass: "Admin123!", meta: "Command center" },
  employee: { label: "Employee Account", email: "alice.freeman@corpcrm.dev", pass: "Employee123!", meta: "Personal queue" },
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
    <main className="relative flex min-h-screen items-center justify-center bg-black px-4 py-12 text-zinc-200">
      {/* Vercel Grid & Ambient Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 glowing-beam pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Vercel minimalist logo: solid triangle */}
        <div className="mb-8 flex flex-col items-center">
          <svg
            className="h-8 w-8 text-white transition-transform hover:scale-105"
            viewBox="0 0 75 65"
            fill="currentColor"
          >
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <h1 className="mt-4 text-xl font-medium tracking-tight text-white">
            Sign in to CorpCRM
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Enter your credentials or choose a quick demo account
          </p>
        </div>

        {/* Demo profiles selector tab bar */}
        <div className="mb-6 grid grid-cols-2 gap-2 p-1 rounded-md border border-zinc-800 bg-zinc-950/60 backdrop-blur-md">
          {(Object.keys(demoProfiles) as Array<keyof typeof demoProfiles>).map((key) => {
            const active = selectedProfile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseProfile(key)}
                className={`relative flex flex-col items-start px-3 py-2.5 rounded-sm transition-all duration-150 ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex w-full items-center justify-between text-xs font-semibold tracking-tight">
                  <span>{demoProfiles[key].label}</span>
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                  )}
                </div>
                <span className="mt-0.5 text-[10px] text-zinc-500 font-normal">
                  {demoProfiles[key].meta}
                </span>
              </button>
            );
          })}
        </div>

        {/* Login form container */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
          {generalError && (
            <div className="mb-4 rounded-md border border-red-900/50 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-400">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@corpcrm.dev"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedProfile(null);
                  }}
                  className={`w-full rounded-md border bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition duration-150 focus:border-zinc-200 focus:ring-1 focus:ring-zinc-200 ${
                    fieldErrors.email?.length ? "border-red-500" : "border-zinc-800"
                  }`}
                />
              </div>
              {fieldErrors.email?.map((err) => (
                <span key={err} className="mt-1 block text-[11px] text-red-400">
                  {err}
                </span>
              ))}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-zinc-400"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedProfile(null);
                  }}
                  className={`w-full rounded-md border bg-zinc-950 py-2 pl-9 pr-10 text-sm text-white placeholder-zinc-600 outline-none transition duration-150 focus:border-zinc-200 focus:ring-1 focus:ring-zinc-200 ${
                    fieldErrors.password?.length ? "border-red-500" : "border-zinc-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {fieldErrors.password?.map((err) => (
                <span key={err} className="mt-1 block text-[11px] text-red-400">
                  {err}
                </span>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-1.5 rounded-md bg-white py-2 px-4 text-xs font-semibold text-black transition duration-150 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue"}
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </form>
        </div>

        {/* Minimalist footer info */}
        <p className="mt-8 text-center text-[10px] text-zinc-600">
          Secure, HTTPOnly encrypted session authorization · CorpCRM 2026
        </p>
      </div>
    </main>
  );
}
