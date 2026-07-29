"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, Command, LogOut, RefreshCw, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface EmployeeItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  position: string;
  role: "ADMIN" | "EMPLOYEE";
  status: string;
}

interface TaskItem {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
}

interface DashboardStats {
  totalEmployees?: number;
  activeTasks?: number;
  assignedTasks?: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

interface DashboardData {
  scope: "ADMIN" | "EMPLOYEE";
  stats: DashboardStats;
  recentTasks?: TaskItem[];
  myTasks?: TaskItem[];
  recentEmployees?: EmployeeItem[];
}

const formatStatus = (status: TaskItem["status"]) => status.replace("_", " ").toLowerCase();

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard");
      const json = await response.json().catch(() => null);

      if (response.ok && json?.success && json.data) {
        setDashboardData(json.data);
      } else if (response.status === 401) {
        setError("Your session expired. Please sign in again.");
      } else {
        setError(json?.error?.message || `Dashboard request failed with status ${response.status}.`);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Network error: could not reach the dashboard API.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = window.setTimeout(() => {
        fetchDashboardData();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [user]);

  if (loading || (!user && !error)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border border-zinc-200 border-t-zinc-950" />
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Checking session</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const tasks = isAdmin ? dashboardData?.recentTasks ?? [] : dashboardData?.myTasks ?? [];
  const stats = dashboardData?.stats;
  const statCards = [
    {
      label: isAdmin ? "People" : "Assigned",
      value: isAdmin ? stats?.totalEmployees ?? 0 : stats?.assignedTasks ?? 0,
      detail: isAdmin ? "registered employees" : "open assignments",
      icon: Users,
    },
    { label: "Complete", value: stats?.completedTasks ?? 0, detail: "finished tasks", icon: CheckCircle2 },
    { label: "Pending", value: stats?.pendingTasks ?? 0, detail: "awaiting action", icon: Clock },
    { label: "Overdue", value: stats?.overdueTasks ?? 0, detail: "need attention", icon: AlertCircle },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-950">
      <div className="absolute inset-0 grid-bg opacity-80" />
      <div className="absolute right-[-10rem] top-24 h-96 w-96 rounded-full border-[4rem] border-black/5" />
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-zinc-950 text-white shadow-[5px_5px_0_rgba(0,0,0,0.14)]"><Command className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold tracking-tight">CorpCRM</div>
              <div className="text-xs text-zinc-500">{isAdmin ? "Admin console" : "Employee workspace"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-zinc-500">{user.position || user.role}</div>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-950 hover:text-zinc-950 hover:shadow-[4px_4px_0_#09090b]">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 grid gap-8 rounded-[2.5rem] bg-zinc-950 p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.18)] sm:p-10 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <p className="w-fit rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/60">{user.role.toLowerCase()} dashboard</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.07em] text-white sm:text-7xl">
              Good to see you, {user.firstName}.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">
              A focused command surface for the work that matters now: concise metrics, recent tasks, and team context.
            </p>
          </div>

          <button onClick={fetchDashboardData} disabled={dataLoading} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(255,255,255,0.22)] disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.label} className="group rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-zinc-950 hover:shadow-[8px_8px_0_#09090b]">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-medium uppercase tracking-[0.18em]">{card.label}</span>
                <card.icon className="h-4 w-4" />
              </div>
              <div className="mt-8 text-5xl font-black tracking-[-0.08em]">{dataLoading && !dashboardData ? "—" : card.value}</div>
              <div className="mt-2 text-sm text-zinc-500">{card.detail}</div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2.25rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em]">Recent tasks</h2>
                <p className="mt-1 text-sm text-zinc-500">{isAdmin ? "Newest work across the organization." : "Your current assignment queue."}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950 text-white"><ArrowUpRight className="h-5 w-5" /></div>
            </div>

            {tasks.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {tasks.map((task) => (
                  <div key={task.id} className="grid gap-3 py-5 transition hover:px-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <h3 className="font-medium tracking-[-0.02em]">{task.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">Due {new Date(task.dueDate).toLocaleDateString()} · {task.priority.toLowerCase()} priority</p>
                    </div>
                    <span className="w-fit rounded-full border border-zinc-950 px-3 py-1 text-xs font-semibold capitalize text-zinc-950">
                      {formatStatus(task.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500">
                {dataLoading ? "Loading tasks..." : "No tasks to show."}
              </div>
            )}
          </article>

          <aside className="rounded-[2.25rem] border border-zinc-950 bg-zinc-950 p-5 text-white shadow-[12px_12px_0_rgba(0,0,0,0.10)] sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.03em]">{isAdmin ? "New people" : "Workspace note"}</h2>
            <p className="mt-1 text-sm text-white/55">{isAdmin ? "Latest employee records." : "Session and access details."}</p>

            {isAdmin && dashboardData?.recentEmployees?.length ? (
              <div className="mt-6 space-y-3">
                {dashboardData.recentEmployees.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border border-white/15 bg-white p-4 text-zinc-950">
                    <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="mt-1 text-sm text-zinc-500">{employee.position}</div>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-400">{employee.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3 text-sm leading-6 text-zinc-950">
                <p className="rounded-2xl border border-zinc-200 bg-white p-4">Authenticated through secure, httpOnly session cookies.</p>
                <p className="rounded-2xl border border-zinc-200 bg-white p-4">The interface intentionally removes decoration so status and decisions remain clear.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
