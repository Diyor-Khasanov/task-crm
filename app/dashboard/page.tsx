"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock, LogOut, RefreshCw, Users, Shield, User } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "team">("overview");

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
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border border-zinc-800 border-t-white" />
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Verifying session</p>
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
      label: isAdmin ? "Team Members" : "Assigned Tasks",
      value: isAdmin ? stats?.totalEmployees ?? 0 : stats?.assignedTasks ?? 0,
      detail: isAdmin ? "Registered staff" : "Active assignments",
      icon: Users,
    },
    { label: "Completed", value: stats?.completedTasks ?? 0, detail: "Closed tickets", icon: CheckCircle2, dotColor: "bg-emerald-500" },
    { label: "Pending", value: stats?.pendingTasks ?? 0, detail: "Requires action", icon: Clock, dotColor: "bg-amber-500" },
    { label: "Overdue", value: stats?.overdueTasks ?? 0, detail: "Overdue targets", icon: AlertCircle, dotColor: "bg-rose-500" },
  ];

  return (
    <main className="relative min-h-screen bg-black text-zinc-200">
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Modern, Tight Vercel Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-6">
            {/* Vercel Logo */}
            <div className="flex items-center gap-2.5">
              <svg className="h-5 w-5 text-white" viewBox="0 0 75 65" fill="currentColor">
                <polygon points="37.5,0 75,65 0,65" />
              </svg>
              <span className="text-xs font-semibold tracking-wider text-white">CORP/CRM</span>
            </div>

            {/* Role indicator */}
            <div className="hidden items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[10px] font-medium tracking-tight text-zinc-400 sm:flex">
              {isAdmin ? <Shield className="h-3 w-3 text-zinc-500" /> : <User className="h-3 w-3 text-zinc-500" />}
              <span>{isAdmin ? "Admin Console" : "Employee Portal"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <div className="text-xs font-medium text-white">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] text-zinc-500">{user.position || user.role}</div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 transition duration-150 hover:border-zinc-700 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Minimal Vercel Navigation Tabs */}
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab("overview")}
              className={`border-b-2 py-2.5 transition duration-150 ${
                activeTab === "overview" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`border-b-2 py-2.5 transition duration-150 ${
                activeTab === "tasks" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Tasks
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("team")}
                className={`border-b-2 py-2.5 transition duration-150 ${
                  activeTab === "team" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Team Directory
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Dynamic welcome and active status banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Active Session</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
              Welcome back, {user.firstName}
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Manage internal workloads, assignments, and check active metrics.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={dataLoading}
            className="self-start inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs font-medium text-zinc-300 transition duration-150 hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
            <span>Refresh Workspace</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Vercel Stats Cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="group rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition duration-150 hover:border-zinc-800 hover:bg-zinc-950/80"
                >
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                    {card.dotColor ? (
                      <span className={`h-2 w-2 rounded-full ${card.dotColor}`} />
                    ) : (
                      <card.icon className="h-3.5 w-3.5 text-zinc-600" />
                    )}
                  </div>
                  <div className="mt-3.5 text-3xl font-semibold text-white tracking-tight">
                    {dataLoading && !dashboardData ? "—" : card.value}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">{card.detail}</div>
                </div>
              ))}
            </section>

            {/* Split layout: Recent Tasks & Notes/Sidebar */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Tasks List */}
              <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Recent Work Assignments</h3>
                    <p className="text-[11px] text-zinc-500">Tasks requiring immediate focus</p>
                  </div>
                  <button onClick={() => setActiveTab("tasks")} className="text-[11px] font-medium text-zinc-400 hover:text-white flex items-center gap-1">
                    <span>View all</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {tasks.length > 0 ? (
                  <div className="divide-y divide-zinc-900">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between py-3.5">
                        <div className="min-w-0 flex-1 pr-4">
                          <h4 className="truncate text-xs font-medium text-white">{task.title}</h4>
                          <p className="mt-0.5 text-[10px] text-zinc-500">
                            Due {new Date(task.dueDate).toLocaleDateString()} ·{" "}
                            <span className="capitalize">{task.priority.toLowerCase()} priority</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            task.status === "DONE" ? "bg-emerald-500" : task.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-zinc-600"
                          }`} />
                          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                            {formatStatus(task.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-zinc-900 py-10 text-center text-xs text-zinc-500">
                    {dataLoading ? "Fetching assignments..." : "No active tasks recorded."}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isAdmin ? "Latest Registrations" : "Workspace Protocol"}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {isAdmin ? "Newly onboarded personnel" : "System session configuration"}
                  </p>

                  {isAdmin && dashboardData?.recentEmployees?.length ? (
                    <div className="mt-4 space-y-3">
                      {dashboardData.recentEmployees.slice(0, 3).map((employee) => (
                        <div key={employee.id} className="rounded-md border border-zinc-900 bg-black p-3">
                          <div className="text-xs font-medium text-white">{employee.firstName} {employee.lastName}</div>
                          <div className="text-[10px] text-zinc-500">{employee.position}</div>
                          <div className="mt-1.5 flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-600">
                            <span>{employee.role}</span>
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3 text-xs leading-relaxed text-zinc-400">
                      <p className="rounded-md border border-zinc-900 bg-black p-3.5">
                        Authenticated with strict, httpOnly session storage keys. No persistent client tokens exposed.
                      </p>
                      <p className="rounded-md border border-zinc-900 bg-black p-3.5">
                        Role authorization boundaries enforced on both presentation level and direct REST API routers.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900 text-[10px] text-zinc-600">
                  Node Engine: stable-v26.1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks Grid */}
        {activeTab === "tasks" && (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">All Assignment Queues</h3>
              <p className="text-xs text-zinc-500">Filter and audit operational deliverables</p>
            </div>

            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="pb-3 pr-4">Task Name</th>
                      <th className="pb-3 px-4">Priority</th>
                      <th className="pb-3 px-4">Target Date</th>
                      <th className="pb-3 pl-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-zinc-900/25">
                        <td className="py-3.5 pr-4 text-white font-medium">{task.title}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${
                            task.priority === "HIGH" ? "text-rose-400" : task.priority === "MEDIUM" ? "text-amber-400" : "text-zinc-500"
                          }`}>
                            <span className={`h-1 w-1 rounded-full ${
                              task.priority === "HIGH" ? "bg-rose-500" : task.priority === "MEDIUM" ? "bg-amber-500" : "bg-zinc-500"
                            }`} />
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="py-3.5 pl-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            task.status === "DONE"
                              ? "border-emerald-950 bg-emerald-950/20 text-emerald-400"
                              : task.status === "IN_PROGRESS"
                              ? "border-amber-950 bg-amber-950/20 text-amber-400"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400"
                          }`}>
                            {formatStatus(task.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-900 py-12 text-center text-xs text-zinc-500">
                No active tasks found in database.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Team Directory */}
        {activeTab === "team" && isAdmin && (
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Internal Staff Directory</h3>
              <p className="text-xs text-zinc-500">Access profiles and workspace metadata</p>
            </div>

            {dashboardData?.recentEmployees && dashboardData.recentEmployees.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardData.recentEmployees.map((employee) => (
                  <div key={employee.id} className="rounded-md border border-zinc-900 bg-black/60 p-4 hover:border-zinc-800 transition duration-150">
                    <div className="flex items-center gap-3">
                      {employee.avatar ? (
                        <img src={employee.avatar} alt="" className="h-9 w-9 rounded-full object-cover border border-zinc-800 bg-zinc-950" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-white">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-white">{employee.firstName} {employee.lastName}</h4>
                        <p className="text-[10px] text-zinc-500">{employee.position}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-zinc-900 flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500">{employee.email}</span>
                      <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 font-bold uppercase text-[9px] text-zinc-400">
                        {employee.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-900 py-12 text-center text-xs text-zinc-500">
                No staff records retrieved.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
