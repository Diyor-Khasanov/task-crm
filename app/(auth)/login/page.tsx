"use client";

import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4 py-16 text-zinc-900 antialiased">
      <div className="w-full max-w-[400px]">

        {/* Geist minimalist logo: solid black triangle */}
        <div className="mb-8 flex flex-col items-center">
          <svg
            className="h-8 w-8 text-black transition-transform hover:scale-105"
            viewBox="0 0 75 65"
            fill="currentColor"
          >
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
            Sign in to CorpCRM
          </h1>
          <p className="mt-1.5 text-center text-xs text-zinc-500">
            Enter your credentials or choose a quick demo account
          </p>
        </div>

        {/* Demo profiles selector tab bar */}
        <div className="mb-6 grid grid-cols-2 gap-1.5 p-1 rounded-lg border border-zinc-200/80 bg-zinc-100/50">
          {(Object.keys(demoProfiles) as Array<keyof typeof demoProfiles>).map((key) => {
            const active = selectedProfile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseProfile(key)}
                className={`relative flex flex-col items-start px-3.5 py-2 rounded-md border transition-all duration-150 text-left ${
                  active
                    ? "bg-white border-zinc-200 text-zinc-900 shadow-xs"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30"
                }`}
              >
                <div className="flex w-full items-center justify-between text-xs font-semibold tracking-tight">
                  <span>{demoProfiles[key].label}</span>
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 shadow-sm" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                  )}
                </div>
                <span className="mt-0.5 text-[10px] text-zinc-400 font-normal">
                  {demoProfiles[key].meta}
                </span>
              </button>
            );
          })}
        </div>

        {/* Login form container */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          {generalError && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50/60 px-4 py-3 text-xs font-medium text-red-600">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-600"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                  className={`w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-150 focus:border-black focus:ring-1 focus:ring-black ${
                    fieldErrors.email?.length ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
              </div>
              {fieldErrors.email?.map((err) => (
                <span key={err} className="mt-1 block text-[11px] text-red-500 font-medium">
                  {err}
                </span>
              ))}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-zinc-600"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                  className={`w-full rounded-md border bg-white py-2 pl-9 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-150 focus:border-black focus:ring-1 focus:ring-black ${
                    fieldErrors.password?.length ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password?.map((err) => (
                <span key={err} className="mt-1 block text-[11px] text-red-500 font-medium">
                  {err}
                </span>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 relative flex w-full items-center justify-center gap-1.5 rounded-md bg-black py-2 px-4 text-xs font-medium text-white transition duration-150 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Minimalist footer info */}
        <p className="mt-8 text-center text-[10px] text-zinc-400 font-medium">
          Secure, HTTPOnly encrypted session authorization · CorpCRM 2026
        </p>
      </div>
    </main>
  );
}
