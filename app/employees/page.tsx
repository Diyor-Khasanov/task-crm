"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import SidebarLayout from "../components/SidebarLayout";
import {
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  X,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
  Mail,
  User,
  Briefcase,
  Phone,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  avatar?: string;
  role: "ADMIN" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  createdAt: string;
  phone?: string;
}

interface MetaData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type RoleType = "ADMIN" | "EMPLOYEE";
type StatusType = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export default function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [, startTransition] = useTransition();

  const [employees, setEmployees] = useState<Employee[]>([]);
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

  // Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | RoleType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Actions Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modal States
  const [addOpen, setAddOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);

  // Form States & Errors
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    position: "",
    phone: "",
    avatar: "",
    role: "EMPLOYEE" as RoleType,
    status: "ACTIVE" as StatusType
  });
  const [addErrors, setAddErrors] = useState<Record<string, string[]>>({});
  const [addGeneralError, setAddGeneralError] = useState<string | null>(null);
  const [addSubmitLoading, setAddSubmitLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    position: "",
    phone: "",
    avatar: "",
    role: "EMPLOYEE" as RoleType,
    status: "ACTIVE" as StatusType
  });
  const [editErrors, setEditErrors] = useState<Record<string, string[]>>({});
  const [editGeneralError, setEditGeneralError] = useState<string | null>(null);
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

  const [deleteGeneralError, setDeleteGeneralError] = useState<string | null>(null);
  const [deleteSubmitLoading, setDeleteSubmitLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("pageSize", "10");
      if (search.trim()) {
        params.append("search", search.trim());
      }
      if (roleFilter !== "ALL") {
        params.append("role", roleFilter);
      }
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      params.append("sortBy", "createdAt");
      params.append("sortOrder", "desc");

      const res = await fetch(`/api/employees?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setEmployees(json.data || []);
        if (json.meta) {
          setMeta(json.meta);
        }
      } else {
        setError(json.error?.message || "Failed to load employees list.");
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Network error: Could not load the employees catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Handle clicking outside of the active row actions menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetAddForm = () => {
    setAddForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      position: "",
      phone: "",
      avatar: "",
      role: "EMPLOYEE",
      status: "ACTIVE"
    });
    setAddErrors({});
    setAddGeneralError(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrors({});
    setAddGeneralError(null);
    setAddSubmitLoading(true);

    try {
      const payload: Record<string, unknown> = {
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        email: addForm.email,
        password: addForm.password,
        position: addForm.position,
        role: addForm.role,
        status: addForm.status,
      };
      if (addForm.phone.trim()) payload.phone = addForm.phone.trim();
      if (addForm.avatar.trim()) payload.avatar = addForm.avatar.trim();

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setAddOpen(false);
        resetAddForm();
        fetchEmployees();
      } else if (res.status === 422 && json.error?.fieldErrors) {
        setAddErrors(json.error.fieldErrors);
        setAddGeneralError(json.error.message || "Some fields need your attention.");
      } else {
        setAddGeneralError(json.error?.message || "Failed to create employee.");
      }
    } catch (err) {
      console.error("Add employee failed:", err);
      setAddGeneralError("Network error: Could not reach the API.");
    } finally {
      setAddSubmitLoading(false);
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditEmployee(emp);
    setEditForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      password: "",
      position: emp.position,
      phone: emp.phone || "",
      avatar: emp.avatar || "",
      role: emp.role,
      status: emp.status
    });
    setEditErrors({});
    setEditGeneralError(null);
    setActiveMenuId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;

    setEditErrors({});
    setEditGeneralError(null);
    setEditSubmitLoading(true);

    try {
      const payload: Record<string, unknown> = {};
      if (editForm.firstName !== editEmployee.firstName) payload.firstName = editForm.firstName;
      if (editForm.lastName !== editEmployee.lastName) payload.lastName = editForm.lastName;
      if (editForm.password.trim()) payload.password = editForm.password;
      if (editForm.position !== editEmployee.position) payload.position = editForm.position;
      if (editForm.phone !== (editEmployee.phone || "")) payload.phone = editForm.phone.trim();
      if (editForm.avatar !== (editEmployee.avatar || "")) payload.avatar = editForm.avatar.trim();
      if (editForm.role !== editEmployee.role) payload.role = editForm.role;
      if (editForm.status !== editEmployee.status) payload.status = editForm.status;

      const res = await fetch(`/api/employees/${editEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setEditEmployee(null);
        fetchEmployees();
      } else if (res.status === 422 && json.error?.fieldErrors) {
        setEditErrors(json.error.fieldErrors);
        setEditGeneralError(json.error.message || "Some fields need your attention.");
      } else if (res.status === 403 || res.status === 409) {
        setEditGeneralError(json.error?.message || "Operation refused by server.");
      } else {
        setEditGeneralError(json.error?.message || "Failed to update employee.");
      }
    } catch (err) {
      console.error("Edit employee failed:", err);
      setEditGeneralError("Network error: Could not reach the API.");
    } finally {
      setEditSubmitLoading(false);
    }
  };

  const openDeleteModal = (emp: Employee) => {
    setDeleteEmployee(emp);
    setDeleteGeneralError(null);
    setActiveMenuId(null);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteEmployee) return;
    setDeleteGeneralError(null);
    setDeleteSubmitLoading(true);

    try {
      const res = await fetch(`/api/employees/${deleteEmployee.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setDeleteEmployee(null);
        fetchEmployees();
      } else {
        setDeleteGeneralError(json.error?.message || "Failed to delete employee.");
      }
    } catch (err) {
      console.error("Delete employee failed:", err);
      setDeleteGeneralError("Network error: Could not reach the API.");
    } finally {
      setDeleteSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      const day = d.getUTCDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACTIVE") {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
          Active
        </span>
      );
    }
    if (s === "ON_LEAVE") {
      return (
        <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-full border border-amber-100 bg-amber-50 text-amber-600">
          On Leave
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide rounded-full border border-zinc-200 bg-zinc-100 text-zinc-600">
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r === "ADMIN") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-blue-100 bg-blue-50 text-blue-600">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-zinc-200 bg-zinc-100/80 text-zinc-600">
        Employee
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Employees</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your team members, their roles and access.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                resetAddForm();
                setAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add employee</span>
            </button>
          )}
        </div>

        {/* Main Content Card Container */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
          {/* Filters Bar */}
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, email or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition duration-150"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    const val = e.target.value as "ALL" | RoleType;
                    startTransition(() => {
                      setRoleFilter(val);
                      setCurrentPage(1);
                    });
                  }}
                  className="w-full sm:w-auto appearance-none inline-flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition min-w-[120px] focus:outline-none focus:border-zinc-950"
                >
                  <option value="ALL">All roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const val = e.target.value as "ALL" | StatusType;
                    startTransition(() => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    });
                  }}
                  className="w-full sm:w-auto appearance-none inline-flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition min-w-[120px] focus:outline-none focus:border-zinc-950"
                >
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto relative">
            {loading && employees.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border border-zinc-200 border-t-zinc-950" />
                <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Loading catalog...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <p className="text-sm font-semibold text-red-500">{error}</p>
                <button
                  onClick={() => {
                    startTransition(() => {
                      fetchEmployees();
                    });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : employees.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-xs text-zinc-400 font-medium">No team members match your criteria.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-600 min-w-[800px]">
                <thead className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/40">
                  <tr>
                    <th className="py-3.5 px-6">Employee</th>
                    <th className="py-3.5 px-4">Position</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-zinc-50/40 transition duration-150">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.firstName}
                              className="h-9 w-9 rounded-full object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs">
                              {emp.firstName[0]}
                              {emp.lastName[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-zinc-900 text-xs">
                              {emp.firstName} {emp.lastName}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                              {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-500">
                        {emp.position}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(emp.role)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(emp.status)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-500">
                        {formatDate(emp.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right relative">
                        {isAdmin && (
                          <div className="inline-block text-left">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-50 focus:outline-none"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {activeMenuId === emp.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 mt-1 w-36 origin-top-right rounded-lg bg-white p-1 border border-zinc-200 shadow-lg ring-1 ring-black/5 focus:outline-none text-left"
                              >
                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 rounded-md transition"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-zinc-400" />
                                  <span>Edit member</span>
                                </button>
                                <button
                                  onClick={() => openDeleteModal(emp)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                  <span>Delete member</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
              <span className="font-semibold text-zinc-900">{meta.total}</span> employees
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

      {/* MODAL: ADD EMPLOYEE */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Add New Team Member</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Register a new profile and configure its roles and access.</p>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-50 focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {addGeneralError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 flex items-start gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{addGeneralError}</span>
                  </div>
                )}

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={addForm.firstName}
                        onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          addErrors.firstName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {addErrors.firstName?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={addForm.lastName}
                        onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          addErrors.lastName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {addErrors.lastName?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="john.doe@corpcrm.dev"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        addErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  {addErrors.email?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Temporary Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Temporary Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        addErrors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">8–72 chars, must contain upper, lower, and digits.</span>
                  {addErrors.password?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Position / Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Software Engineer"
                      value={addForm.position}
                      onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        addErrors.position ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  {addErrors.position?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Optional Phone & Avatar */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="+1 555-0100"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Avatar URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={addForm.avatar}
                        onChange={(e) => setAddForm({ ...addForm, avatar: e.target.value })}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Status selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Access Role</label>
                    <select
                      value={addForm.role}
                      onChange={(e) => setAddForm({ ...addForm, role: e.target.value as RoleType })}
                      className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Initial Status</label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value as StatusType })}
                      className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitLoading}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {addSubmitLoading ? "Saving..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Edit Team Member</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Modify parameters for {editEmployee.firstName} {editEmployee.lastName}.</p>
              </div>
              <button
                onClick={() => setEditEmployee(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-50 focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {editGeneralError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 flex items-start gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{editGeneralError}</span>
                  </div>
                )}

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          editErrors.firstName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {editErrors.firstName?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          editErrors.lastName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {editErrors.lastName?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Address (Cannot change)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="email"
                      disabled
                      value={editEmployee.email}
                      className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 text-zinc-400 py-1.5 pl-9 pr-3 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Optional New Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">New Password (Leave blank to keep current)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        editErrors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">8–72 chars, must contain upper, lower, and digits.</span>
                  {editErrors.password?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Position / Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        editErrors.position ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  {editErrors.position?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Optional Phone & Avatar */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="+1 555-0100"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Avatar URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={editForm.avatar}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Status selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Access Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as RoleType })}
                      className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StatusType })}
                      className="w-full rounded-md border border-zinc-200 bg-white p-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitLoading}
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {editSubmitLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Content */}
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Delete Team Member?</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete <b className="text-zinc-900">{deleteEmployee.firstName} {deleteEmployee.lastName}</b>?
                  This action cannot be undone. All assigned tasks will be marked as unassigned.
                </p>
              </div>

              {deleteGeneralError && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600 text-left flex items-start gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{deleteGeneralError}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteEmployee(null)}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteSubmitLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteSubmitLoading ? "Deleting..." : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
