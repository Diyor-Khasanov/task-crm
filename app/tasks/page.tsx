"use client";

import React, { useState, useEffect, useTransition } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { Search, ChevronDown, RefreshCw } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  avatar?: string;
  role: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: Employee | null;
  createdBy?: Employee | null;
}

interface MetaData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type StatusType = "ALL" | "TODO" | "IN_PROGRESS" | "DONE";
type PriorityType = "ALL" | "LOW" | "MEDIUM" | "HIGH";

export default function TasksPage() {
  const [, startTransition] = useTransition();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<MetaData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("pageSize", "10");
      if (search.trim()) {
        params.append("search", search.trim());
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (priorityFilter !== "ALL") {
        params.append("priority", priorityFilter);
      }
      params.append("sortBy", "dueDate");
      params.append("sortOrder", "asc");

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setTasks(json.data || []);
        if (json.meta) {
          setMeta(json.meta);
        }
      } else {
        setError(json.error?.message || "Failed to load tasks.");
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError("Network error: Could not load the task queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, statusFilter, priorityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === "DONE") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold";
    }
    if (s === "IN_PROGRESS") {
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
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track and view all active assignments and milestones.
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
          {/* Filters Bar */}
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition duration-150"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value as StatusType;
                    startTransition(() => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    });
                  }}
                  className="w-full sm:w-auto appearance-none inline-flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition min-w-[120px] focus:outline-none focus:border-zinc-950"
                >
                  <option value="ALL">All statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    const val = e.target.value as PriorityType;
                    startTransition(() => {
                      setPriorityFilter(val);
                      setCurrentPage(1);
                    });
                  }}
                  className="w-full sm:w-auto appearance-none inline-flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition min-w-[120px] focus:outline-none focus:border-zinc-950"
                >
                  <option value="ALL">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto relative">
            {loading && tasks.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-950" />
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Loading tasks...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <p className="text-sm font-semibold text-red-500">{error}</p>
                <button
                  onClick={() => {
                    startTransition(() => {
                      fetchTasks();
                    });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-xs text-zinc-400 font-medium">No tasks found in your queue.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-600 min-w-[800px]">
                <thead className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/40">
                  <tr>
                    <th className="py-3.5 px-6">Task Title</th>
                    <th className="py-3.5 px-4">Assigned Employee</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-zinc-50/40 transition duration-150">
                      <td className="py-3.5 px-6">
                        <h4 className="font-semibold text-zinc-900 text-xs">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs truncate">{task.description}</p>
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
                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${getStatusBadge(task.status)}`}>
                          {task.status.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/20 text-xs text-zinc-500">
            <div>
              Showing <span className="font-semibold text-zinc-900">{meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1}</span>-
              <span className="font-semibold text-zinc-900">
                {Math.min(meta.page * meta.pageSize, meta.total)}
              </span> of{" "}
              <span className="font-semibold text-zinc-900">{meta.total}</span> tasks
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={!meta.hasPreviousPage || loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-zinc-500 font-medium px-1">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={!meta.hasNextPage || loading}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
