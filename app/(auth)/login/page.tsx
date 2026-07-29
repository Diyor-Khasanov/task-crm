"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Lock,
  Mail,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  Shield,
  User,
  Sparkles,
  Activity,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error handling states
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Feedback states for copy buttons
  const [copiedType, setCopiedType] = useState<"admin" | "employee" | null>(null);

  const handleCopyCredentials = async (type: "admin" | "employee") => {
    const creds = {
      admin: { email: "admin@corpcrm.dev", pass: "Admin123!" },
      employee: { email: "alice.freeman@corpcrm.dev", pass: "Employee123!" },
    };

    const chosen = creds[type];

    // Auto-fill form fields
    setEmail(chosen.email);
    setPassword(chosen.pass);

    // Clear previous errors
    setGeneralError(null);
    setFieldErrors({});

    // Write to clipboard
    try {
      await navigator.clipboard.writeText(chosen.email); // standard requires clipboard action
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Could not copy to clipboard", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Log in user via context
        login(result.data);
      } else {
        // Handle errors
        if (response.status === 422 && result.error?.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
          setGeneralError(result.error.message || "Please correct the errors in the form.");
        } else if (response.status === 401) {
          setGeneralError("Invalid email or password. Please verify your credentials.");
        } else {
          setGeneralError(result.error?.message || "An unexpected error occurred. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setGeneralError("Network error: Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Left Column: Brand Hero & Presentation */}
      <div className="hidden md:flex md:w-1/2 p-12 lg:p-20 flex-col justify-between relative border-r border-slate-800/40 bg-slate-900/40 backdrop-blur-xl">
        {/* Brand logo header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-2.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <Activity className="h-full w-full text-slate-950 font-bold" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-300 bg-clip-text text-transparent tracking-wide">
            CorpCRM
          </span>
        </div>

        {/* Hero Middle Content */}
        <div className="my-auto space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Enterprise Portal
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Supercharge your workflow with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Role-Based Access</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Welcome to CorpCRM. A highly secure, fluid dashboard designed specifically to coordinate roles, optimize employee performance, and track enterprise deliverables.
          </p>

          {/* Quick info boxes */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1.5">
                <Shield className="h-4 w-4" /> Administrator
              </div>
              <p className="text-xs text-slate-400">Full management of tasks, employees, and operations.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1.5">
                <User className="h-4 w-4" /> Employee
              </div>
              <p className="text-xs text-slate-400">Streamlined inbox view to track and update assigned workloads.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} CorpCRM Inc. All rights reserved. Built with passion and Next.js.
        </div>
      </div>

      {/* Right Column: Secure Login Form */}
      <div className="flex-1 p-6 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center items-center z-10">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo header */}
          <div className="flex md:hidden items-center gap-3 justify-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-2.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <Activity className="h-full w-full text-slate-950 font-bold" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-300 bg-clip-text text-transparent tracking-wide">
              CorpCRM
            </span>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Secure Sign-in
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your credentials or click a demo profile below to inspect different role views.
            </p>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Demo Profiles</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin Copy Button */}
              <button
                type="button"
                onClick={() => handleCopyCredentials("admin")}
                className={`group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  copiedType === "admin"
                    ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                    : "bg-slate-900/60 hover:bg-slate-800/40 border-slate-800 hover:border-indigo-500/30"
                }`}
              >
                <div className="w-full flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Admin Account
                  </span>
                  {copiedType === "admin" ? (
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  )}
                </div>
                <div className="text-xs font-medium text-slate-300 truncate w-full">admin@corpcrm.dev</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Password: Admin123!</div>
              </button>

              {/* Employee Copy Button */}
              <button
                type="button"
                onClick={() => handleCopyCredentials("employee")}
                className={`group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  copiedType === "employee"
                    ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 hover:bg-slate-800/40 border-slate-800 hover:border-emerald-500/30"
                }`}
              >
                <div className="w-full flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Employee Account
                  </span>
                  {copiedType === "employee" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  )}
                </div>
                <div className="text-xs font-medium text-slate-300 truncate w-full">alice.freeman@corpcrm.dev</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Password: Employee123!</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              Clicking a profile automatically fills the form and copies the email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Alert */}
            {generalError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-start gap-3 animate-shake">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold tracking-wider text-slate-300 uppercase">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@corpcrm.dev"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: [] });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900 border rounded-xl font-medium text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 ${
                    fieldErrors.email?.length
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                />
              </div>
              {fieldErrors.email && fieldErrors.email.map((err, idx) => (
                <p key={idx} className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3 w-3" /> {err}
                </p>
              ))}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold tracking-wider text-slate-300 uppercase">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: [] });
                    }
                  }}
                  className={`w-full pl-10 pr-11 py-3 bg-slate-900 border rounded-xl font-medium text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 ${
                    fieldErrors.password?.length
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && fieldErrors.password.map((err, idx) => (
                <p key={idx} className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                  <AlertCircle className="h-3 w-3" /> {err}
                </p>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold rounded-xl tracking-wide shadow-xl shadow-indigo-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Additional text */}
          <div className="pt-2 text-center md:text-left">
            <span className="text-xs text-slate-500">
              Only secure login portal is activated. Unauthorized requests are strictly logged.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
