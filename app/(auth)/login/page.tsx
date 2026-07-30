"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const demoProfiles = {
  admin: { label: "Admin Account", email: "admin@corpcrm.dev", pass: "Admin123!", meta: "Command center" },
  employee: { label: "Employee Account", email: "alice.freeman@corpcrm.dev", pass: "Employee123!", meta: "Personal queue" },
};

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);
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

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center crm-app-shell text-zinc-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-900" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-medium text-zinc-400">Verifying session</p>
        </div>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center crm-app-shell px-4 py-16">
      <div className="w-full max-w-[440px]">

        {/* Geist minimalist logo: solid black triangle */}
        <div className="mb-8 flex flex-col items-center">
          <svg
            className="h-9 w-9 text-zinc-950 drop-shadow-sm transition-transform hover:scale-105"
            viewBox="0 0 75 65"
            fill="currentColor"
          >
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <h1 className="mt-5 crm-page-title text-center">
            Sign in to CorpCRM
          </h1>
          <p className="crm-page-subtitle text-center">
            Enter your credentials or choose a quick demo account
          </p>
        </div>

        {/* Demo profiles selector tab bar */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/55 p-1.5 shadow-sm backdrop-blur">
          {(Object.keys(demoProfiles) as Array<keyof typeof demoProfiles>).map((key) => {
            const active = selectedProfile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseProfile(key)}
                className={`relative flex flex-col items-start px-3.5 py-2 rounded-md border transition-all duration-150 text-left ${
                  active
                    ? "bg-white border-zinc-200 text-zinc-950 shadow-sm"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-white/70"
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
        <div className="crm-card-elevated p-8">
          {generalError && (
            <div className="crm-alert-error mb-5">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="crm-label"
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
                  className={`crm-control crm-control-icon-left ${
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
                className="crm-label"
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
                  className={`crm-control crm-control-icon-left crm-control-icon-right ${
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
              className="crm-button-primary mt-2 w-full"
            >
              {loading ? "Signing in..." : "Continue"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Minimalist footer info */}
        <p className="mt-8 text-center text-[10px] text-zinc-400 font-medium">
          Design System 1 · Secure HTTPOnly session authorization · CorpCRM 2026
        </p>
      </div>
    </main>
  );
}
