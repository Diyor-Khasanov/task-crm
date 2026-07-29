"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LogOut,
  ChevronRight,
  RefreshCw,
  Shield,
  User,
  Calendar
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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
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

  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black text-white">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border border-neutral-800 border-t-neutral-200" />
          <span className="text-xs font-mono text-neutral-400 tracking-wider">
            Loading secure session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  // Helper for priority display
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-400 font-mono";
      case "MEDIUM":
        return "text-amber-400 font-mono";
      default:
        return "text-neutral-500 font-mono";
    }
  };

  // Helper for status dot
  const getStatusDot = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-500";
      case "IN_PROGRESS":
        return "bg-blue-500 animate-pulse";
      default:
        return "bg-neutral-600";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-neutral-800 selection:text-white font-sans antialiased">
      {/* Vercel Header / Navigation bar */}
      <header className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Vercel Logo */}
          <svg
            viewBox="0 0 75 65"
            className="h-5 w-auto fill-current text-white cursor-pointer"
            aria-label="Vercel Logo"
            onClick={() => router.push("/")}
          >
            <path d="M37.5 0 L75 65 L0 65 Z" />
          </svg>

          <span className="text-neutral-800 text-lg select-none">/</span>

          {/* Breadcrumb path */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer">
              {isAdmin ? "Admin" : "Employee"} Workspace
            </span>
            <span className="text-neutral-800 text-xs select-none">/</span>
            <span className="text-sm font-medium text-white">
              CorpCRM
            </span>
          </div>
        </div>

        {/* Right side actions & details */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-neutral-950 border border-neutral-900">
            <div className="h-5 w-5 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800">
              <img
                src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=171717&color=fff`;
                }}
              />
            </div>
            <div className="text-[11px] font-mono font-medium text-neutral-300">
              {user.email}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-medium tracking-wide transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-10">

        {/* Simple Welcome Title Block - No gradients, just pure minimalist type */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-900">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400">
              {isAdmin ? (
                <>
                  <Shield className="h-3.5 w-3.5 text-neutral-400" /> Administrative Access
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-neutral-400" /> Employee Workspace
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {isAdmin ? "Hello Admin" : "Hello Employee"}, {user.firstName} {user.lastName}
            </h1>

            <p className="text-neutral-500 text-sm max-w-xl font-normal leading-relaxed">
              {isAdmin
                ? "Oversee team tasks, monitor analytics, and manage the system registry."
                : "Review and update your assigned tasks and sync deliverables."}
            </p>
          </div>

          {/* Quick Stats Summary Row */}
          <div className="flex items-center gap-3.5 px-4 py-3 bg-neutral-950 border border-neutral-900 rounded-md self-start md:self-auto min-w-[260px]">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
              <img
                src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={`${user.firstName}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=171717&color=fff`;
                }}
              />
            </div>
            <div className="space-y-0.5 truncate">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Active Profile</div>
              <div className="text-xs font-semibold text-neutral-200 truncate">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] font-mono text-neutral-400 truncate">{user.position || "Staff Consultant"}</div>
            </div>
          </div>
        </div>

        {/* Workforce Analytics Title & Statistics Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
              System Indicators
            </h2>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={dataLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-md cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="font-mono text-[10px]">Sync</span>
            </button>
          </div>

          {/* Stats Cards Grid - Pure Monochromatic Vercel design */}
          {dataLoading && !dashboardData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 rounded-md bg-neutral-950 border border-neutral-900 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-md bg-neutral-950 border border-red-900/30 text-red-400 text-xs flex items-center gap-2 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1: Headcount or Assigned workload */}
              {isAdmin ? (
                <div className="p-5 rounded-md bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 transition-colors">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Total Headcount</div>
                  <div className="text-2xl font-semibold text-white tracking-tight">{dashboardData.stats.totalEmployees || 0}</div>
                  <div className="text-[10px] font-mono text-neutral-600 mt-2">Active records registered</div>
                </div>
              ) : (
                <div className="p-5 rounded-md bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 transition-colors">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Assigned Workloads</div>
                  <div className="text-2xl font-semibold text-white tracking-tight">{dashboardData.stats.assignedTasks || 0}</div>
                  <div className="text-[10px] font-mono text-neutral-600 mt-2">Designated direct inbox</div>
                </div>
              )}

              {/* Card 2: Completed */}
              <div className="p-5 rounded-md bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 transition-colors">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Completed Tasks</div>
                <div className="text-2xl font-semibold text-white tracking-tight">{dashboardData.stats.completedTasks || 0}</div>
                <div className="text-[10px] font-mono text-neutral-600 mt-2">Marked resolve / archived</div>
              </div>

              {/* Card 3: Pending */}
              <div className="p-5 rounded-md bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 transition-colors">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Pending Actions</div>
                <div className="text-2xl font-semibold text-white tracking-tight">{dashboardData.stats.pendingTasks || 0}</div>
                <div className="text-[10px] font-mono text-neutral-600 mt-2">Active sprint deliverables</div>
              </div>

              {/* Card 4: Overdue Alerts */}
              <div className="p-5 rounded-md bg-neutral-950/40 border border-neutral-900 hover:border-neutral-800 transition-colors">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Overdue Alerts</div>
                <div className="text-2xl font-semibold text-red-500 tracking-tight">{dashboardData.stats.overdueTasks || 0}</div>
                <div className="text-[10px] font-mono text-neutral-600 mt-2">Past standard due dates</div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Detailed Content Split Grid */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">

            {/* Left section: Task rows (takes 2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                  {isAdmin ? "Enterprise Task Feed" : "Your Assigned Sprint Items"}
                </h3>
                <span className="text-[10px] font-mono text-neutral-500 hover:text-white cursor-pointer transition-colors uppercase">
                  View All Tasks
                </span>
              </div>

              <div className="bg-neutral-950/30 border border-neutral-900 rounded-md divide-y divide-neutral-900">
                {isAdmin && dashboardData.recentTasks && dashboardData.recentTasks.length > 0 ? (
                  dashboardData.recentTasks.map((task: TaskItem) => (
                    <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-950/70 transition-colors">
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(task.status)} shrink-0`} />
                          <h4 className="text-sm font-medium text-white truncate hover:text-neutral-300 cursor-pointer">{task.title}</h4>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-500 pl-3.5">
                          <span className={getPriorityStyle(task.priority)}>{task.priority}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <Calendar className="h-3 w-3 text-neutral-600" /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-900 text-neutral-400 bg-neutral-950">
                          {task.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-neutral-700" />
                      </div>
                    </div>
                  ))
                ) : !isAdmin && dashboardData.myTasks && dashboardData.myTasks.length > 0 ? (
                  dashboardData.myTasks.map((task: TaskItem) => (
                    <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-950/70 transition-colors">
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(task.status)} shrink-0`} />
                          <h4 className="text-sm font-medium text-white truncate hover:text-neutral-300 cursor-pointer">{task.title}</h4>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-500 pl-3.5">
                          <span className={getPriorityStyle(task.priority)}>{task.priority}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <Calendar className="h-3 w-3 text-neutral-600" /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-900 text-neutral-400 bg-neutral-950">
                          {task.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-neutral-700" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs font-mono text-neutral-500">No active tasks</p>
                    <p className="text-[11px] text-neutral-600">All registered system deliverables are up-to-date.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right section: employees list or developer system notes */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                {isAdmin ? "Team Directory" : "System Environment"}
              </h3>

              <div className="bg-neutral-950/30 border border-neutral-900 rounded-md p-5 space-y-4">
                {isAdmin && dashboardData.recentEmployees && dashboardData.recentEmployees.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentEmployees.map((emp: EmployeeItem) => (
                      <div key={emp.id} className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800">
                            <img
                              src={emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`}
                              alt={emp.firstName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=171717&color=fff`;
                              }}
                            />
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-medium text-neutral-200 truncate">{emp.firstName} {emp.lastName}</h5>
                            <p className="text-[10px] text-neutral-500 truncate font-mono">{emp.position}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase border border-neutral-900 bg-neutral-950 px-1.5 py-0.5 rounded">
                          {emp.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Secure Sessions Enabled
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                        Session credentials automatically populate through httpOnly containers. JS token theft is mitigated.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-neutral-900">
                      <div className="text-xs font-mono text-neutral-300 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" /> Enterprise Hub Connected
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                        Your browser request is proxying seamlessly back to the regional central datastore.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 text-center">
                      <p className="text-[9px] text-neutral-600 font-mono italic">
                        Connected to Vercel API Core. All checks pass.
                      </p>
                    </div>
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
