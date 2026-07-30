"use client";

import React, { useState, useEffect, useTransition } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { Search, RefreshCw, Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  avatar?: string;
  role?: string;
  status?: string;
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
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type PriorityType = "ALL" | "LOW" | "MEDIUM" | "HIGH";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

type TaskForm = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedToId: string;
};

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  assignedToId: "",
};

function toDateInputValue(date: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function assigneeId(task: Task) {
  return task.assignedTo?.id || "";
}

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [, startTransition] = useTransition();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignableEmployees, setAssignableEmployees] = useState<Employee[]>([]);
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyTaskForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("pageSize", "10");
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      params.append("sortBy", "dueDate");
      params.append("sortOrder", "asc");

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setTasks(json.data || []);
        if (json.meta) setMeta(json.meta);
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

  const fetchAssignableEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch("/api/employees/assignable");
      const json = await res.json();
      if (res.ok && json.success) setAssignableEmployees(json.data || []);
    } catch (err) {
      console.error("Failed to fetch assignable employees:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, priorityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignableEmployees();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetForm = () => {
    setForm(emptyTaskForm);
    setFieldErrors({});
    setGeneralError(null);
  };

  const openAddModal = () => {
    resetForm();
    setAddOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: toDateInputValue(task.dueDate),
      assignedToId: assigneeId(task),
    });
    setFieldErrors({});
    setGeneralError(null);
  };

  const formPayload = (mode: "create" | "edit") => {
    const payload: Record<string, unknown> = {
      title: form.title,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate,
      assignedToId: form.assignedToId || null,
    };
    if (mode === "create") {
      if (form.description.trim()) payload.description = form.description.trim();
    } else {
      payload.description = form.description.trim();
    }
    if (mode === "edit" && editTask) {
      Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if (key === "dueDate" && value === toDateInputValue(editTask.dueDate)) delete payload[key];
        if (key === "assignedToId" && value === (assigneeId(editTask) || null)) delete payload[key];
        if (key !== "dueDate" && key !== "assignedToId" && value === (editTask as unknown as Record<string, unknown>)[key]) delete payload[key];
      });
    }
    return payload;
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTask = editTask;
    const mode = selectedTask ? "edit" : "create";
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);
    try {
      const endpoint = mode === "create" ? "/api/tasks" : selectedTask ? `/api/tasks/${selectedTask.id}` : null;
      if (!endpoint) return;
      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload(mode)),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAddOpen(false);
        setEditTask(null);
        resetForm();
        fetchTasks();
      } else if (res.status === 422 && json.error?.fieldErrors) {
        setFieldErrors(json.error.fieldErrors);
        setGeneralError(json.error.message || "Some fields need your attention.");
      } else {
        setGeneralError(json.error?.message || "Failed to save task.");
      }
    } catch (err) {
      console.error("Save task failed:", err);
      setGeneralError("Network error: Could not reach the API.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSelectedTask = async () => {
    if (!deleteTask) return;
    setSubmitting(true);
    setGeneralError(null);
    try {
      const res = await fetch(`/api/tasks/${deleteTask.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setDeleteTask(null);
        fetchTasks();
      } else {
        setGeneralError(json.error?.message || "Failed to delete task.");
      }
    } catch (err) {
      console.error("Delete task failed:", err);
      setGeneralError("Network error: Could not reach the API.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === "DONE") return "bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold";
    if (s === "IN_PROGRESS") return "bg-amber-50 text-amber-700 border-amber-100 font-semibold";
    return "bg-zinc-50 text-zinc-600 border-zinc-200/60 font-semibold";
  };

  const getPriorityStyle = (priorityStr: string) => {
    const p = priorityStr.toUpperCase();
    if (p === "HIGH") return "text-red-700 bg-red-50/60 border-red-100 font-semibold";
    if (p === "MEDIUM") return "text-amber-700 bg-amber-50/60 border-amber-100 font-semibold";
    return "text-zinc-600 bg-zinc-50/60 border-zinc-200/60 font-semibold";
  };

  const fieldError = (name: string) => fieldErrors[name]?.map((err) => (
    <span key={err} className="mt-1 block text-[11px] font-medium text-red-500">{err}</span>
  ));

  const modalOpen = addOpen || Boolean(editTask);

  return (
    <SidebarLayout>
      <div className="crm-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="crm-page-title">Tasks</h1>
            <p className="crm-page-subtitle">Track and manage real assignments from the live CRM API.</p>
          </div>
          {isAdmin && (
            <button onClick={openAddModal} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
              <span>Add task</span>
            </button>
          )}
        </div>

        <div className="crm-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex flex-col items-center justify-between gap-3 border-b border-zinc-100 p-5 sm:flex-row">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 transition focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950" />
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select value={statusFilter} onChange={(e) => startTransition(() => { setStatusFilter(e.target.value as StatusType); setCurrentPage(1); })} className="crm-filter-select w-full sm:w-auto">
                  <option value="ALL">All statuses</option><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Completed</option>
                </select>
              </div>
              <div className="relative flex-1 sm:flex-initial">
                <select value={priorityFilter} onChange={(e) => startTransition(() => { setPriorityFilter(e.target.value as PriorityType); setCurrentPage(1); })} className="crm-filter-select w-full sm:w-auto">
                  <option value="ALL">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            {loading && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24"><div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-950" /><p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Loading tasks...</p></div>
            ) : error ? (
              <div className="py-24 text-center"><p className="text-sm font-semibold text-red-500">{error}</p><button onClick={() => startTransition(fetchTasks)} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"><RefreshCw className="h-3.5 w-3.5" /><span>Try Again</span></button></div>
            ) : tasks.length === 0 ? (
              <div className="py-24 text-center"><p className="text-xs font-medium text-zinc-400">No tasks found in your queue.</p></div>
            ) : (
              <table className="w-full min-w-[900px] text-left text-xs text-zinc-600">
                <thead className="border-b border-zinc-100 bg-zinc-50/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400"><tr><th className="px-6 py-3.5">Task Title</th><th className="px-4 py-3.5">Assigned Employee</th><th className="px-4 py-3.5">Due Date</th><th className="px-4 py-3.5">Priority</th><th className="px-4 py-3.5">Status</th>{isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}</tr></thead>
                <tbody className="divide-y divide-zinc-100">
                  {tasks.map((task) => {
                    const deadlineDate = new Date(task.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = today > deadlineDate && task.status !== "DONE";
                    return (
                      <tr key={task.id} className="transition hover:bg-zinc-50/40">
                        <td className="px-6 py-3.5"><h4 className="text-xs font-semibold text-zinc-900">{task.title}</h4>{task.description && <p className="mt-0.5 max-w-xs truncate text-[11px] text-zinc-400">{task.description}</p>}</td>
                        <td className="px-4 py-3.5">{task.assignedTo ? <div className="flex items-center gap-2">{task.assignedTo.avatar ? <img src={task.assignedTo.avatar} alt={task.assignedTo.firstName} className="h-6 w-6 rounded-full border border-zinc-100 object-cover" /> : <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-bold text-zinc-500">{task.assignedTo.firstName[0]}</div>}<span className="text-[11px] font-semibold text-zinc-800">{task.assignedTo.firstName} {task.assignedTo.lastName}</span></div> : <span className="text-[10px] font-semibold text-zinc-400">Unassigned</span>}</td>
                        <td className="px-4 py-3.5"><span className={`font-mono text-[11px] font-semibold ${isOverdue ? "rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-red-600" : "text-zinc-500"}`}>{Number.isNaN(deadlineDate.getTime()) ? "—" : deadlineDate.toLocaleDateString()}</span></td>
                        <td className="px-4 py-3.5"><span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getPriorityStyle(task.priority)}`}>{task.priority}</span></td>
                        <td className="px-4 py-3.5"><span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadge(task.status)}`}>{task.status.toLowerCase().replace("_", " ")}</span></td>
                        {isAdmin && <td className="px-6 py-3.5 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(task)} className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-zinc-950" aria-label="Edit task"><Edit2 className="h-3.5 w-3.5" /></button><button onClick={() => { setDeleteTask(task); setGeneralError(null); }} className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Delete task"><Trash2 className="h-3.5 w-3.5" /></button></div></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/20 p-4 text-xs text-zinc-500">
            <div>Showing <span className="font-semibold text-zinc-900">{meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1}</span>-<span className="font-semibold text-zinc-900">{Math.min(meta.page * meta.pageSize, meta.total)}</span> of <span className="font-semibold text-zinc-900">{meta.total}</span> tasks</div>
            <div className="flex items-center gap-2"><button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={!meta.hasPreviousPage || loading} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50">Previous</button><span className="px-1 font-medium text-zinc-500">Page {meta.page} of {meta.totalPages}</span><button onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.totalPages))} disabled={!meta.hasNextPage || loading} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50">Next</button></div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-bold text-zinc-950">{editTask ? "Edit task" : "Add task"}</h2><button onClick={() => { setAddOpen(false); setEditTask(null); resetForm(); }} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><X className="h-4 w-4" /></button></div>
            {generalError && <div className="mb-4 flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{generalError}</div>}
            <form onSubmit={submitTask} className="space-y-4">
              <div><label className="crm-label">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="crm-control" required />{fieldError("title")}</div>
              <div><label className="crm-label">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="crm-control min-h-24" />{fieldError("description")}</div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="crm-label">Due date</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="crm-control" required />{fieldError("dueDate")}</div><div><label className="crm-label">Assignee</label><select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="crm-control"><option value="">Unassigned</option>{assignableEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}</select>{fieldError("assignedToId")}</div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="crm-label">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="crm-control"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>{fieldError("priority")}</div><div><label className="crm-label">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} className="crm-control"><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select>{fieldError("status")}</div></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => { setAddOpen(false); setEditTask(null); resetForm(); }} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">Cancel</button><button disabled={submitting} className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">{submitting ? "Saving..." : "Save task"}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteTask && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="text-sm font-bold text-zinc-950">Delete task</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Are you sure you want to delete <span className="font-semibold text-zinc-900">{deleteTask.title}</span>? This action will call the live API and cannot be undone.</p>
            {generalError && <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">{generalError}</div>}
            <div className="mt-6 flex justify-end gap-2"><button onClick={() => setDeleteTask(null)} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">Cancel</button><button onClick={deleteSelectedTask} disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">{submitting ? "Deleting..." : "Delete task"}</button></div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
