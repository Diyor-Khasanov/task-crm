"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Users,
  LayoutGrid,
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface EmployeeItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  position: string;
  role: "ADMIN" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | string;
  phone?: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  assignedTo?: EmployeeItem | null;
}

interface ChartItem {
  label: string;
  date: string;
  created: number;
  completed: number;
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
  chart?: ChartItem[];
  recentTasks?: TaskItem[];
  myTasks?: TaskItem[];
  recentEmployees?: EmployeeItem[];
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [employeesList, setEmployeesList] = useState<EmployeeItem[]>([]);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "employees" | "tasks" | "profile">("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      // 1. Fetch dashboard stats & summary data
      const response = await fetch("/api/dashboard");
      const json = await response.json().catch(() => null);

      if (response.ok && json?.success && json.data) {
        setDashboardData(json.data);
      } else if (response.status === 401) {
        setError("Your session expired. Please sign in again.");
      } else {
        setError(json?.error?.message || `Dashboard request failed with status ${response.status}.`);
      }

      // 2. Fetch full employees list
      const empResponse = await fetch("/api/employees");
      const empJson = await empResponse.json().catch(() => null);
      if (empResponse.ok && empJson?.success && empJson.data) {
        setEmployeesList(empJson.data);
      }

      // 3. Fetch full tasks list
      const taskResponse = await fetch("/api/tasks");
      const taskJson = await taskResponse.json().catch(() => null);
      if (taskResponse.ok && taskJson?.success && taskJson.data) {
        setTasksList(taskJson.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Network error: could not reach the CRM backend API.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Prevent react-hooks/set-state-in-effect by calling asynchronously
      const timer = setTimeout(() => {
        fetchDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (loading || (!user && !error)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] text-zinc-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-900" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-medium text-zinc-400">Verifying session</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const stats = dashboardData?.stats;
  const recentEmployees = dashboardData?.recentEmployees || [];
  const recentTasks = dashboardData?.recentTasks || [];

  // Custom styling helper for status pills (Geist light design system)
  const getStatusStyle = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === "ACTIVE" || s === "DONE") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "ON_LEAVE" || s === "IN_PROGRESS") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-zinc-100 text-zinc-600 border-zinc-200";
  };

  const getPriorityStyle = (priorityStr: string) => {
    const p = priorityStr.toUpperCase();
    if (p === "HIGH") return "text-red-700 bg-red-50 border-red-200";
    if (p === "MEDIUM") return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-zinc-600 bg-zinc-50 border-zinc-200";
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased flex flex-col md:flex-row">

      {/* Left Sidebar Menu */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col shrink-0">

        {/* Logo Header: Solid black triangle */}
        <div className="p-6 border-b border-zinc-200/80 flex items-center gap-2.5">
          <svg className="h-5 w-5 text-black" viewBox="0 0 75 65" fill="currentColor">
            <polygon points="37.5,0 75,65 0,65" />
          </svg>
          <span className="font-semibold text-zinc-900 text-base tracking-tight">CorpCRM</span>
        </div>

        {/* User Quick Info */}
        <div className="px-6 py-4 border-b border-zinc-200/80 flex items-center gap-3 bg-zinc-50/40">
          {user.avatar ? (
            <img src={user.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover border border-zinc-200" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-xs">
              {user.firstName[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-zinc-900 truncate">{user.firstName} {user.lastName}</h4>
            <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
              <Shield className="h-3 w-3 text-zinc-500 shrink-0" />
              <span className="capitalize">{user.role.toLowerCase()}</span>
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 bg-white">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "dashboard"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <LayoutGrid className={`h-4 w-4 ${activeTab === "dashboard" ? "text-zinc-900" : "text-zinc-400"}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "employees"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Users className={`h-4 w-4 ${activeTab === "employees" ? "text-zinc-900" : "text-zinc-400"}`} />
            <span>Employees</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "tasks"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${activeTab === "tasks" ? "text-zinc-900" : "text-zinc-400"}`} />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "profile"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <User className={`h-4 w-4 ${activeTab === "profile" ? "text-zinc-900" : "text-zinc-400"}`} />
            <span>Profile</span>
          </button>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-zinc-200 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Logout</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 py-5 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight capitalize">
              {activeTab === "dashboard" ? "Dashboard" : activeTab}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {activeTab === "dashboard" && "Overview of company metrics and real-time activities."}
              {activeTab === "employees" && "Manage internal directory, roles and real-time statuses."}
              {activeTab === "tasks" && "Monitor active tickets, timelines and assignments."}
              {activeTab === "profile" && "View your personal account settings and parameters."}
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={dataLoading}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${dataLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Workspace</span>
          </button>
        </header>

        {/* Page Inner Scroll Container */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">

              {/* Stats Cards Row */}
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total Employees */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total employees</span>
                      <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                        {dataLoading ? "—" : stats?.totalEmployees ?? 0}
                      </h3>
                    </div>
                    <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Active Tasks */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active tasks</span>
                      <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                        {dataLoading ? "—" : stats?.activeTasks ?? 0}
                      </h3>
                    </div>
                    <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Completed tasks</span>
                      <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                        {dataLoading ? "—" : stats?.completedTasks ?? 0}
                      </h3>
                    </div>
                    <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending tasks</span>
                      <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                        {dataLoading ? "—" : stats?.pendingTasks ?? 0}
                      </h3>
                      {stats?.overdueTasks !== undefined && stats.overdueTasks > 0 && (
                        <div className="p-1 px-2 rounded-md bg-red-50 border border-red-100 text-red-700 text-[10px] font-medium mt-2 flex items-center gap-1.5 w-fit">
                          <AlertCircle className="h-3 w-3" />
                          <span>{stats.overdueTasks} overdue</span>
                        </div>
                      )}
                    </div>
                    <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart (Task Activity) & Recent Employees Split Grid */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px]">

                {/* Task Activity Chart Card */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Task activity</h3>
                      <p className="text-[11px] text-zinc-400 font-medium">Overview of task creation vs completion over the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-black" />
                        <span>Completed</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-xs bg-zinc-200" />
                        <span>Created</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Custom/Flexible Chart Component */}
                  <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2 border-b border-zinc-100 pb-2 relative">

                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-zinc-300">
                      <div className="border-t border-dashed border-zinc-100 w-full pt-1"></div>
                      <div className="border-t border-dashed border-zinc-100 w-full pt-1"></div>
                      <div className="border-t border-dashed border-zinc-100 w-full pt-1"></div>
                      <div className="border-t border-dashed border-zinc-100 w-full pt-1"></div>
                      <div className="w-full"></div>
                    </div>

                    {/* Bars Rendering */}
                    {dashboardData?.chart && dashboardData.chart.map((day, idx) => {
                      const maxVal = Math.max(...(dashboardData.chart?.map(c => Math.max(c.created, c.completed)) || [1]));
                      const createdHeight = maxVal > 0 ? (day.created / maxVal) * 100 : 0;
                      const completedHeight = maxVal > 0 ? (day.completed / maxVal) * 100 : 0;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                          {/* Floating Values on Hover */}
                          <div className="absolute -top-12 bg-black text-white rounded px-2.5 py-1.5 text-[9px] leading-tight flex flex-col gap-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-150">
                            <div>Created: <b>{day.created}</b></div>
                            <div>Completed: <b>{day.completed}</b></div>
                          </div>

                          <div className="w-full max-w-[24px] h-32 flex items-end justify-center gap-1">
                            {/* Created Bar */}
                            <div
                              style={{ height: `${createdHeight}%` }}
                              className="w-1/2 bg-zinc-200 rounded-t-xs transition-all duration-300"
                            />
                            {/* Completed Bar */}
                            <div
                              style={{ height: `${completedHeight}%` }}
                              className="w-1/2 bg-black rounded-t-xs transition-all duration-300"
                            />
                          </div>

                          <span className="text-[10px] font-semibold text-zinc-400 mt-2">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}

                    {!dashboardData?.chart && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
                        No activity metrics loaded.
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Employees Card */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-zinc-900 text-sm">Recent employees</h3>
                      <button
                        onClick={() => setActiveTab("employees")}
                        className="text-xs font-semibold text-zinc-500 hover:text-black transition"
                      >
                        View all
                      </button>
                    </div>

                    {recentEmployees.length > 0 ? (
                      <div className="space-y-4">
                        {recentEmployees.slice(0, 5).map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {employee.avatar ? (
                                <img src={employee.avatar} alt={employee.firstName} className="h-8 w-8 rounded-full object-cover border border-zinc-200" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-semibold text-zinc-600 text-xs">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-zinc-900 truncate">
                                  {employee.firstName} {employee.lastName}
                                </h4>
                                <p className="text-[10px] text-zinc-400 truncate mt-0.5">{employee.position}</p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-full border ${getStatusStyle(employee.status)}`}>
                              {employee.status.toLowerCase().replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-zinc-400">
                        No recorded staff.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Recent Tasks Table/Card */}
              <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">Recent tasks</h3>
                    <p className="text-[11px] text-zinc-400 font-medium">Status of the most recently logged system activities</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="text-xs font-semibold text-zinc-500 hover:text-black transition"
                  >
                    View all
                  </button>
                </div>

                {recentTasks.length > 0 ? (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left text-xs text-zinc-600 min-w-[600px]">
                      <thead className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/70">
                        <tr>
                          <th className="py-3 px-6">Task Title</th>
                          <th className="py-3 px-4">Assigned Employee</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50">
                        {recentTasks.slice(0, 5).map((task) => (
                          <tr key={task.id} className="hover:bg-zinc-50/50 transition duration-150">
                            <td className="py-3.5 px-6 font-semibold text-zinc-950 max-w-xs truncate">
                              {task.title}
                            </td>
                            <td className="py-3.5 px-4">
                              {task.assignedTo ? (
                                <div className="flex items-center gap-2">
                                  {task.assignedTo.avatar ? (
                                    <img src={task.assignedTo.avatar} alt={task.assignedTo.firstName} className="h-6 w-6 rounded-full object-cover border border-zinc-100" />
                                  ) : (
                                    <div className="h-6 w-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 text-[10px]">
                                      {task.assignedTo.firstName[0]}
                                    </div>
                                  )}
                                  <span className="font-semibold text-zinc-800 text-[11px]">
                                    {task.assignedTo.firstName} {task.assignedTo.lastName}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold text-zinc-400">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-400 font-medium">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded border ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-full border ${getStatusStyle(task.status)}`}>
                                {task.status.toLowerCase().replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    No active tasks retrieved.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW: EMPLOYEES DIRECTORY */}
          {activeTab === "employees" && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Employees Directory</h3>
                  <p className="text-[11px] text-zinc-400 font-medium">Viewing all registered staff parameters</p>
                </div>
              </div>

              {employeesList.length > 0 ? (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left text-xs text-zinc-600 min-w-[700px]">
                    <thead className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/70">
                      <tr>
                        <th className="py-3 px-6">Name & Role</th>
                        <th className="py-3 px-4">Job Title</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-6">Phone Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50">
                      {employeesList.map((employee) => (
                        <tr key={employee.id} className="hover:bg-zinc-50/50 transition duration-150">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              {employee.avatar ? (
                                <img src={employee.avatar} alt={employee.firstName} className="h-8 w-8 rounded-full object-cover border border-zinc-200" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-zinc-900 text-xs">
                                  {employee.firstName} {employee.lastName}
                                </h4>
                                <span className={`inline-block mt-0.5 px-1.5 py-0.2 bg-zinc-50 text-[8px] font-semibold text-zinc-500 rounded uppercase border border-zinc-200/80`}>
                                  {employee.role}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-700">
                            {employee.position}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-full border ${getStatusStyle(employee.status)}`}>
                              {employee.status.toLowerCase().replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 font-medium font-mono text-[11px]">
                            {employee.email}
                          </td>
                          <td className="py-3.5 px-6 text-zinc-400 font-medium">
                            {employee.phone || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400">
                  {dataLoading ? "Retrieving employee catalog..." : "No employees recorded."}
                </div>
              )}
            </div>
          )}

          {/* VIEW: ALL TASKS */}
          {activeTab === "tasks" && (
            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">All Operational Tasks</h3>
                  <p className="text-[11px] text-zinc-400 font-medium">Track and view all active assignments and milestones</p>
                </div>
              </div>

              {tasksList.length > 0 ? (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left text-xs text-zinc-600 min-w-[700px]">
                    <thead className="border-b border-zinc-200 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/70">
                      <tr>
                        <th className="py-3 px-6">Task Title</th>
                        <th className="py-3 px-4">Assigned Employee</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50">
                      {tasksList.map((task) => (
                        <tr key={task.id} className="hover:bg-zinc-50/50 transition duration-150">
                          <td className="py-3.5 px-6">
                            <h4 className="font-semibold text-zinc-900 text-xs">{task.title}</h4>
                            {task.description && (
                              <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs truncate">{task.description}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {task.assignedTo ? (
                              <div className="flex items-center gap-2">
                                {task.assignedTo.avatar ? (
                                  <img src={task.assignedTo.avatar} alt={task.assignedTo.firstName} className="h-6 w-6 rounded-full object-cover border border-zinc-100" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 text-[10px]">
                                    {task.assignedTo.firstName[0]}
                                  </div>
                                )}
                                <span className="font-semibold text-zinc-800 text-[11px]">
                                  {task.assignedTo.firstName} {task.assignedTo.lastName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-zinc-400">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-medium">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded border ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-full border ${getStatusStyle(task.status)}`}>
                              {task.status.toLowerCase().replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400">
                  {dataLoading ? "Retrieving task queues..." : "No operational tasks found."}
                </div>
              )}
            </div>
          )}

          {/* VIEW: USER PROFILE */}
          {activeTab === "profile" && (
            <div className="max-w-2xl bg-white rounded-lg border border-zinc-200 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100">
                {user.avatar ? (
                  <img src={user.avatar} alt="User Avatar" className="h-16 w-16 rounded-full object-cover border border-zinc-200 p-0.5 bg-white shadow-xs" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xl shadow-xs">
                    {user.firstName[0]}
                  </div>
                )}
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">{user.position || "Head of Operations"}</p>
                  <span className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-[10px] font-semibold text-zinc-700 uppercase tracking-wide rounded-full">
                    <Shield className="h-3 w-3 text-zinc-500" />
                    <span>{user.role}</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Email address</span>
                    </span>
                    <p className="text-xs font-semibold text-zinc-800 font-mono">{user.email}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Phone number</span>
                    </span>
                    <p className="text-xs font-semibold text-zinc-800">{user.phone || "None registered"}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Assigned Position</span>
                    </span>
                    <p className="text-xs font-semibold text-zinc-800">{user.position || "Administrator"}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Session Status</span>
                    </span>
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active Authorization</span>
                    </p>
                  </div>

                </div>

                <div className="pt-4 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium">
                  Authentication session is handled strictly via secure HTTPOnly browser keys. No client side local storage exposure.
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
