"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, LogOut, RefreshCw, Users } from "lucide-react";
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
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-zinc-950" />
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
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">{user.role.toLowerCase()} dashboard</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-7xl">
              Good to see you, {user.firstName}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
              A focused command surface for the work that matters now: concise metrics, recent tasks, and team context.
            </p>
          </div>

          <button onClick={fetchDashboardData} disabled={dataLoading} className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition hover:border-zinc-950 disabled:opacity-60">
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
            <article key={card.label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-medium uppercase tracking-[0.18em]">{card.label}</span>
                <card.icon className="h-4 w-4" />
              </div>
              <div className="mt-8 text-4xl font-semibold tracking-[-0.05em]">{dataLoading && !dashboardData ? "—" : card.value}</div>
              <div className="mt-2 text-sm text-zinc-500">{card.detail}</div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <article className="rounded-[2rem] border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em]">Recent tasks</h2>
                <p className="mt-1 text-sm text-zinc-500">{isAdmin ? "Newest work across the organization." : "Your current assignment queue."}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-400" />
            </div>

            {tasks.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {tasks.map((task) => (
                  <div key={task.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <h3 className="font-medium tracking-[-0.02em]">{task.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">Due {new Date(task.dueDate).toLocaleDateString()} · {task.priority.toLowerCase()} priority</p>
                    </div>
                    <span className="w-fit rounded-full border border-zinc-200 px-3 py-1 text-xs capitalize text-zinc-600">
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

          <aside className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.03em]">{isAdmin ? "New people" : "Workspace note"}</h2>
            <p className="mt-1 text-sm text-zinc-500">{isAdmin ? "Latest employee records." : "Session and access details."}</p>

            {isAdmin && dashboardData?.recentEmployees?.length ? (
              <div className="mt-6 space-y-3">
                {dashboardData.recentEmployees.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="mt-1 text-sm text-zinc-500">{employee.position}</div>
                    <div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-400">{employee.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3 text-sm leading-6 text-zinc-600">
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
