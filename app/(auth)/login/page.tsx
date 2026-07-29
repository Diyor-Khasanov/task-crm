"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  Check,
  AlertCircle,
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
      await navigator.clipboard.writeText(chosen.email);
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
        login(result.data);
      } else {
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
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black text-white px-6 py-12 selection:bg-neutral-800 selection:text-white">
      <div className="w-full max-w-[400px] space-y-8">

        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Minimalist Vercel Triangle Logo */}
          <svg
            viewBox="0 0 75 65"
            className="h-8 w-auto fill-current text-white transition-opacity hover:opacity-80 cursor-pointer"
            aria-label="Vercel Logo"
          >
            <path d="M37.5 0 L75 65 L0 65 Z" />
          </svg>

          <div className="space-y-1.5">
            <h1 className="text-xl font-medium tracking-tight text-white">
              Sign in to CorpCRM
            </h1>
            <p className="text-sm text-neutral-500 font-normal">
              Enter your credentials below to access the platform
            </p>
          </div>
        </div>

        {/* General Error Notification */}
        {generalError && (
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-red-900/30 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-mono leading-relaxed">{generalError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
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
                className={`w-full px-3 py-2 bg-black border rounded-md font-sans text-sm text-white placeholder-neutral-600 outline-none transition-all duration-150 ${
                  fieldErrors.email?.length
                    ? "border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                    : "border-neutral-800 hover:border-neutral-700 focus:border-neutral-200 focus:ring-1 focus:ring-neutral-200/10"
                }`}
              />
            </div>
            {fieldErrors.email && fieldErrors.email.map((err, idx) => (
              <p key={idx} className="text-xs text-red-400 font-mono flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {err}
              </p>
            ))}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
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
                className={`w-full pl-3 pr-10 py-2 bg-black border rounded-md font-sans text-sm text-white placeholder-neutral-600 outline-none transition-all duration-150 ${
                  fieldErrors.password?.length
                    ? "border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                    : "border-neutral-800 hover:border-neutral-700 focus:border-neutral-200 focus:ring-1 focus:ring-neutral-200/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {fieldErrors.password && fieldErrors.password.map((err, idx) => (
              <p key={idx} className="text-xs text-red-400 font-mono flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {err}
              </p>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-medium rounded-md text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="h-3 w-3 animate-spin rounded-full border border-neutral-400 border-t-black" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            )}
          </button>
        </form>

        {/* Minimalist Demo Credentials Selector */}
        <div className="pt-4 border-t border-neutral-900 space-y-3">
          <p className="text-xs font-mono text-neutral-500 text-center tracking-wide uppercase">
            Demo Environments
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCopyCredentials("admin")}
              className={`flex items-center justify-between px-3 py-2 bg-neutral-950 border text-left transition-all duration-200 rounded-md cursor-pointer ${
                copiedType === "admin"
                  ? "border-neutral-200 ring-1 ring-neutral-200/10"
                  : "border-neutral-900 hover:border-neutral-800"
              }`}
            >
              <div className="truncate pr-1">
                <p className="text-xs font-semibold text-neutral-200">Admin</p>
                <p className="text-[10px] text-neutral-500 truncate font-mono">admin@corpcrm.dev</p>
              </div>
              <div className="shrink-0">
                {copiedType === "admin" ? (
                  <Check className="h-3.5 w-3.5 text-neutral-400" />
                ) : (
                  <span className="text-[10px] font-mono text-neutral-600 uppercase group-hover:text-neutral-400">Copy</span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCopyCredentials("employee")}
              className={`flex items-center justify-between px-3 py-2 bg-neutral-950 border text-left transition-all duration-200 rounded-md cursor-pointer ${
                copiedType === "employee"
                  ? "border-neutral-200 ring-1 ring-neutral-200/10"
                  : "border-neutral-900 hover:border-neutral-800"
              }`}
            >
              <div className="truncate pr-1">
                <p className="text-xs font-semibold text-neutral-200">Employee</p>
                <p className="text-[10px] text-neutral-500 truncate font-mono">alice.freeman@corpcrm.dev</p>
              </div>
              <div className="shrink-0">
                {copiedType === "employee" ? (
                  <Check className="h-3.5 w-3.5 text-neutral-400" />
                ) : (
                  <span className="text-[10px] font-mono text-neutral-600 uppercase group-hover:text-neutral-400">Copy</span>
                )}
              </div>
            </button>
          </div>
          <p className="text-[10px] text-neutral-600 text-center font-mono">
            Clicking copies the email and populates credentials automatically.
          </p>
        </div>

      </div>
    </div>
  );
}
