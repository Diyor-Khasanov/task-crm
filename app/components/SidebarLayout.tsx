"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  Users,
  CheckCircle2,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  CircleDot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || (!user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-zinc-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-900" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-medium text-zinc-400">Verifying session</p>
        </div>
      </main>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, eyebrow: "Overview" },
    { name: "Employees", href: "/employees", icon: Users, eyebrow: "Directory" },
    { name: "Tasks", href: "/tasks", icon: CheckCircle2, eyebrow: "Queue" },
    { name: "Profile", href: "/profile", icon: User, eyebrow: "Account" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)] text-zinc-950 font-sans antialiased md:flex">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-zinc-200/80 bg-white/85 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-zinc-200 bg-white shadow-[0_1px_12px_rgba(24,24,27,0.06)]">
            <svg className="h-4 w-4 text-black" viewBox="0 0 75 65" fill="currentColor" aria-hidden="true">
              <polygon points="37.5,0 75,65 0,65" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-950 text-base tracking-tight">CorpCRM</span>
        </div>
        <div className="flex items-center gap-3">
          {user.avatar && (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-zinc-200"
            />
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 shadow-sm transition hover:text-zinc-950 focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar - fixed-height chrome, never part of page scrolling */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] shrink-0 transform flex-col overflow-hidden border-r border-zinc-200/80 bg-white/88 shadow-[24px_0_80px_rgba(24,24,27,0.08)] backdrop-blur-2xl transition-transform duration-250 ease-out md:sticky md:top-0 md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-zinc-200/45 blur-3xl" />
          <div className="absolute bottom-20 right-[-96px] h-56 w-56 rounded-full bg-neutral-950/[0.045] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        </div>

        {/* Logo Header */}
        <div className="relative flex h-[76px] items-center justify-between border-b border-zinc-200/70 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_28px_rgba(24,24,27,0.08)]">
              <svg className="h-4.5 w-4.5 text-black" viewBox="0 0 75 65" fill="currentColor" aria-hidden="true">
                <polygon points="37.5,0 75,65 0,65" />
              </svg>
            </div>
            <div>
              <span className="block font-semibold text-zinc-950 text-base tracking-tight">CorpCRM</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-400">Geist system</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative px-4 pt-5">
          <div className="rounded-2xl border border-zinc-200/80 bg-white/75 p-4 shadow-[0_18px_50px_rgba(24,24,27,0.06)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
              <span>Live workspace</span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-5 tracking-tight text-zinc-950">
              {user.firstName} {user.lastName}
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200/70 bg-zinc-50/80 px-3 py-2">
              <span className="text-[11px] font-medium text-zinc-500">{user.role}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="relative flex-1 overflow-hidden p-4">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-sm font-semibold tracking-tight transition-all ${
                    isActive
                      ? "border-zinc-950/10 bg-zinc-950 text-white shadow-[0_18px_40px_rgba(24,24,27,0.16)]"
                      : "border-transparent text-zinc-500 hover:border-zinc-200/80 hover:bg-white/80 hover:text-zinc-950 hover:shadow-[0_10px_28px_rgba(24,24,27,0.06)]"
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition ${isActive ? "border-white/10 bg-white/10 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-500 group-hover:text-zinc-950"}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span>{item.name}</span>
                    <span className={`text-[10px] font-medium uppercase tracking-[0.18em] ${isActive ? "text-white/55" : "text-zinc-400"}`}>{item.eyebrow}</span>
                  </span>
                  {isActive && <CircleDot className="h-4 w-4 text-white/70" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="relative border-t border-zinc-200/70 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-3.5 py-3 text-sm font-semibold text-zinc-500 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 shrink-0 text-zinc-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-zinc-950/30 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Main Panel */}
      <div className="flex h-[calc(100vh-57px)] min-w-0 flex-1 flex-col overflow-hidden md:h-screen">
        {/* Top Header - Desktop only */}
        <header className="hidden md:flex h-[76px] shrink-0 border-b border-zinc-200/80 bg-white/70 px-8 items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">Workspace</div>
            <div className="mt-1 text-sm font-semibold tracking-tight text-zinc-950">
              {user.firstName} {user.lastName} <span className="font-medium text-zinc-400">/</span> <span className="text-zinc-500">{user.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-500 shadow-sm transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span>Logout</span>
            </button>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-200 ring-offset-2 ring-offset-white"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-zinc-100 font-bold text-zinc-700 text-xs ring-2 ring-white">
                {user.firstName[0]}
              </div>
            )}
          </div>
        </header>

        {/* Page Content View Area */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(244,244,245,0.95),transparent_34%),linear-gradient(180deg,#ffffff_0%,#fafafa_54%,#f4f4f5_100%)]">
          {children}
        </main>
      </div>
    </div>
  );
}
