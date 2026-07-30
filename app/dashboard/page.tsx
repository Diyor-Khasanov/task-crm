"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SidebarLayout from "../components/SidebarLayout";

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
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
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
      setError("Network error: could not reach the CRM backend API.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchDashboardData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchDashboardData, user]);

  const stats = dashboardData?.stats;
  const recentEmployees = dashboardData?.recentEmployees || [];
  // For employees, we should display myTasks; for admins, we display recentTasks
  const tasksToShow = dashboardData?.scope === "EMPLOYEE" ? dashboardData.myTasks || [] : dashboardData?.recentTasks || [];

  const getStatusStyle = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === "ACTIVE" || s === "DONE") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold";
    }
    if (s === "ON_LEAVE" || s === "IN_PROGRESS") {
      return "bg-amber-50 text-amber-700 border-amber-100 font-semibold";
    }
    return "bg-zinc-50 text-zinc-600 border-zinc-200/60 font-semibold";
  };

  const getPriorityStyle = (priorityStr: string) => {
    const p = priorityStr.toUpperCase();
    if (p === "HIGH") return "text-red-700 bg-red-50/60 border-red-100 font-semibold";
    if (p === "MEDIUM") return "text-amber-700 bg-amber-50/60 border-amber-100 font-semibold";
    return "text-zinc-600 bg-zinc-50/60 border-zinc-200/60 font-semibold";
  };

  return (
    <SidebarLayout>
      <div className="crm-page">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="crm-page-title">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="crm-page-subtitle">
              Here is an overview of company metrics and real-time activities.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={dataLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 focus:outline-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${dataLoading ? "animate-spin" : ""}`} />
            <span>Refresh Workspace</span>
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees / Assigned Tasks */}
          <div className="crm-card p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {dashboardData?.scope === "EMPLOYEE" ? "Assigned Tasks" : "Total employees"}
                </span>
                <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                  {dataLoading ? "—" : (dashboardData?.scope === "EMPLOYEE" ? stats?.assignedTasks ?? 0 : stats?.totalEmployees ?? 0)}
                </h3>
              </div>
              <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="crm-card p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
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
          <div className="crm-card p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
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
          <div className="crm-card p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending tasks</span>
                <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">
                  {dataLoading ? "—" : stats?.pendingTasks ?? 0}
                </h3>
                {stats?.overdueTasks !== undefined && stats.overdueTasks > 0 && (
                  <div className="p-1 px-2 rounded-md bg-red-50 border border-red-100 text-red-700 text-[10px] font-semibold mt-2 flex items-center gap-1.5 w-fit">
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
          <div className="crm-card p-6 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
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

            {/* SVG Custom Chart Component */}
            <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2 border-b border-zinc-100 pb-2 relative mt-4">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-zinc-300">
                <div className="border-t border-dashed border-zinc-200/60 w-full pt-1"></div>
                <div className="border-t border-dashed border-zinc-200/60 w-full pt-1"></div>
                <div className="border-t border-dashed border-zinc-200/60 w-full pt-1"></div>
                <div className="border-t border-dashed border-zinc-200/60 w-full pt-1"></div>
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
                    <div className="absolute -top-14 bg-zinc-950 text-white rounded-lg px-3 py-2 text-[10px] leading-tight flex flex-col gap-1 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 border border-zinc-800 min-w-[100px]">
                      <p className="font-bold border-b border-zinc-800 pb-1 mb-0.5 text-zinc-400">{day.date || day.label}</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          <span>Created:</span>
                        </span>
                        <b className="text-white">{day.created}</b>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          <span>Completed:</span>
                        </span>
                        <b className="text-white">{day.completed}</b>
                      </div>
                    </div>

                    <div className="w-full max-w-[32px] h-36 flex items-end justify-center gap-1.5 px-0.5">
                      {/* Created Bar */}
                      <div
                        style={{ height: `${createdHeight}%` }}
                        className="w-1/2 bg-zinc-200 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-zinc-300 shadow-[inset_0_-10px_10px_rgba(0,0,0,0.02)]"
                      />
                      {/* Completed Bar */}
                      <div
                        style={{ height: `${completedHeight}%` }}
                        className="w-1/2 bg-zinc-950 rounded-t-sm transition-all duration-500 ease-out group-hover:bg-zinc-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      />
                    </div>

                    <span className="text-[10px] font-semibold text-zinc-500 mt-2 tracking-tight group-hover:text-zinc-950 transition-colors">
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
          <div className="crm-card p-6 flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-zinc-900 text-sm">Recent employees</h3>
            </div>

            {recentEmployees.length > 0 ? (
              <div className="space-y-4">
                {recentEmployees.slice(0, 5).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.firstName} className="h-8 w-8 rounded-full object-cover border border-zinc-200" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs shadow-xs">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-900 truncate">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-semibold">{employee.position}</p>
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

        {/* Recent Tasks Card */}
        <div className="crm-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">
                {dashboardData?.scope === "EMPLOYEE" ? "My Tasks" : "Recent tasks"}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">Status of the most recently logged system activities</p>
            </div>
          </div>

          {tasksToShow.length > 0 ? (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs text-zinc-600 min-w-[600px]">
                <thead className="border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/70">
                  <tr>
                    <th className="py-3 px-6">Task Title</th>
                    <th className="py-3 px-4">Assigned Employee</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50">
                  {tasksToShow.slice(0, 5).map((task) => (
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
                      <td className="py-3.5 px-4">
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const deadlineDate = new Date(task.dueDate);
                          const isOverdue = today > deadlineDate && task.status !== "DONE";
                          return (
                            <span className={`font-mono text-[11px] font-semibold ${isOverdue ? "text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200" : "text-zinc-500"}`}>
                              {deadlineDate.toLocaleDateString()}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded border ${getPriorityStyle(task.priority)}`}>
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
    </SidebarLayout>
  );
}
