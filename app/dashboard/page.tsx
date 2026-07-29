"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  User,
  Shield,
  Activity,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";

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
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: EmployeeItem;
  createdBy?: EmployeeItem;
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

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    // Avoid synchronous state updates inside effect triggering cascading render warnings
    setTimeout(() => {
      setDataLoading(true);
      setError(null);
    }, 0);

    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setDashboardData(json.data);
        } else {
          setError(json.error?.message || "Failed to parse dashboard data.");
        }
      } else {
        if (response.status === 401) {
          setError("Unauthorized access. Please login again.");
        } else {
          setError(`Error: Server responded with status ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Network error: Could not reach the API.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboardData();
    }
  }, [user]);

  // Loading page state
  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-4 shadow-2xl shadow-indigo-500/20 animate-bounce flex items-center justify-center">
            <Activity className="h-full w-full text-slate-950 font-black" />
          </div>
          <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full animate-infinite-scroll" />
          </div>
          <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase animate-pulse">
            Configuring secure session...
          </p>
        </div>
      </div>
    );
  }

  // Fallback if not logged in after redirect
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-400 p-1.5 shadow-md flex items-center justify-center">
            <Activity className="h-full w-full text-slate-950" />
          </div>
          <span className="text-lg font-black tracking-wide bg-gradient-to-r from-indigo-400 to-emerald-300 bg-clip-text text-transparent">
            CorpCRM
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            v1.2.0
          </span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 border-r border-slate-800 pr-4">
            <img
              src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`;
              }}
            />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                {isAdmin ? (
                  <Shield className="h-2.5 w-2.5 text-indigo-400" />
                ) : (
                  <User className="h-2.5 w-2.5 text-emerald-400" />
                )}
                {user.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">

        {/* Prominent High-Visibility Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 shadow-2xl p-6 sm:p-10">
          {/* Glowing blur effects */}
          <div className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
          {isAdmin ? (
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          ) : (
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              {/* Mandatory Prominent Role Greetings */}
              {isAdmin ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300 tracking-wide uppercase">
                  <Shield className="h-3.5 w-3.5 text-indigo-400" /> Administrative Access
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 tracking-wide uppercase">
                  <User className="h-3.5 w-3.5 text-emerald-400" /> Employee Workspace
                </div>
              )}

              {/* HELLO ADMIN / HELLO EMPLOYEE */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {isAdmin ? (
                  <>Hello <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">Admin</span></>
                ) : (
                  <>Hello <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Employee</span></>
                )}
                , {user.firstName} {user.lastName}!
              </h1>

              <p className="text-slate-400 text-sm max-w-xl">
                {isAdmin
                  ? "Manage global tasks, review department statistics, oversee team productivity and coordinate strategic operations."
                  : "Here is your task dashboard. Check pending deliverables, update progress, and coordinate with administrative project heads."}
              </p>
            </div>

            {/* Quick Context Action */}
            <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl backdrop-blur-sm self-start md:self-auto min-w-[220px]">
              <img
                src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={`${user.firstName}`}
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`;
                }}
              />
              <div className="space-y-0.5">
                <div className="text-xs text-slate-400 font-semibold">Logged-in User</div>
                <div className="text-sm font-bold text-slate-100">{user.email}</div>
                <div className="text-[10px] text-slate-500 font-bold">{user.position || "Staff"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">Workforce Analytics</h2>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={dataLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading Stats Placeholder */}
          {dataLoading && !dashboardData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          ) : dashboardData ? (
            /* Render Real Stats Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1: Total Employees or Assigned Tasks */}
              {isAdmin ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">{dashboardData.stats.totalEmployees || 0}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" /> Active employees registered
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Inbox</span>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <Briefcase className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white">{dashboardData.stats.assignedTasks || 0}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> Workload currently active
                  </div>
                </div>
              )}

              {/* Card 2: Completed Tasks */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{dashboardData.stats.completedTasks || 0}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Successfully resolved tasks</div>
              </div>

              {/* Card 3: Pending/Active Tasks */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {isAdmin ? "Pending Workloads" : "Your Pending Tasks"}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{dashboardData.stats.pendingTasks || 0}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Awaiting actions/verification</div>
              </div>

              {/* Card 4: Overdue Tasks */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 group shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Alerts</span>
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-red-400">{dashboardData.stats.overdueTasks || 0}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-1">Past designated deadlines</div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Detailed Lists: Recent Tasks */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">

            {/* Left section: tasks list (takes 2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {isAdmin ? "5 Newest Enterprise Tasks" : "Your Assigned Workload Items"}
                </h3>
                <span className="text-xs text-indigo-400 font-semibold">View all tasks →</span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm space-y-4">
                {/* Check list content */}
                {isAdmin && dashboardData.recentTasks && dashboardData.recentTasks.length > 0 ? (
                  <div className="divide-y divide-slate-800/60">
                    {dashboardData.recentTasks.map((task: TaskItem) => (
                      <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1">{task.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              task.priority === "HIGH" ? "bg-red-500/10 text-red-400" :
                              task.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                            }`}>{task.priority}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            task.status === "DONE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" :
                            task.status === "IN_PROGRESS" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" :
                            "bg-slate-800 border-slate-700/60 text-slate-400"
                          }`}>{task.status}</span>
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isAdmin && dashboardData.myTasks && dashboardData.myTasks.length > 0 ? (
                  <div className="divide-y divide-slate-800/60">
                    {dashboardData.myTasks.map((task: TaskItem) => (
                      <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1">{task.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              task.priority === "HIGH" ? "bg-red-500/10 text-red-400" :
                              task.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                            }`}>{task.priority}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            task.status === "DONE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" :
                            task.status === "IN_PROGRESS" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" :
                            "bg-slate-800 border-slate-700/60 text-slate-400"
                          }`}>{task.status}</span>
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Briefcase className="h-8 w-8 text-slate-700 mx-auto" />
                    <p className="text-sm font-bold text-slate-500">No recent tasks available</p>
                    <p className="text-xs text-slate-600">Great job! All systems are currently fully up-to-date.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right section: employees or notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {isAdmin ? "Recently Added Employees" : "Enterprise System Notes"}
              </h3>

              <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm h-full">
                {isAdmin && dashboardData.recentEmployees && dashboardData.recentEmployees.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentEmployees.map((emp: EmployeeItem) => (
                      <div key={emp.id} className="flex items-center gap-3">
                        <img
                          src={emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`}
                          alt={emp.firstName}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=10b981&color=fff`;
                          }}
                        />
                        <div className="text-left flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-200 truncate">{emp.firstName} {emp.lastName}</h5>
                          <p className="text-[10px] text-slate-500 truncate font-semibold">{emp.position}</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10">
                          {emp.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 text-slate-400 text-xs">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs text-indigo-300">
                        <Shield className="h-3.5 w-3.5" /> High Privilege Status
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Cookies are saved in httpOnly container. Browser javascript cannot intercept token.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800/50 space-y-1">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Safe Sessions Enabled
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Session cookies carries credentials for you automatically on subsequent requests.
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-600 italic">
                      Systems checks pass. Connected to Vercel API Hub.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
