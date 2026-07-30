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
  X
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
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] text-zinc-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-900" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-medium text-zinc-400">Verifying session</p>
        </div>
      </main>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased flex flex-col md:flex-row">

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <svg className="h-5 w-5 text-black" viewBox="0 0 75 65" fill="currentColor">
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <span className="font-semibold text-zinc-900 text-base tracking-tight">CorpCRM</span>
        </div>
        <div className="flex items-center gap-4">
          {user.avatar && (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-7 w-7 rounded-full object-cover border border-zinc-200"
            />
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 text-zinc-500 hover:text-zinc-900 focus:outline-none"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 transform md:transform-none md:static transition-transform duration-250 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Header */}
        <div className="p-6 h-[65px] border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 text-black" viewBox="0 0 75 65" fill="currentColor">
              <polygon points="37.5,0 75,65 0,65" />
            </svg>
            <span className="font-semibold text-zinc-900 text-base tracking-tight">CorpCRM</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-zinc-400 hover:text-zinc-600 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 bg-white">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 font-bold shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-zinc-200 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-4 w-4 text-zinc-400 hover:text-red-500 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Panel */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header - Desktop only */}
        <header className="hidden md:flex h-[65px] bg-white border-b border-zinc-200/80 px-8 items-center justify-end sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover border border-zinc-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-xs">
                {user.firstName[0]}
              </div>
            )}
          </div>
        </header>

        {/* Page Content View Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
