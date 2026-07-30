"use client";

import React, { useState, useEffect, useTransition } from "react";
import SidebarLayout from "../components/SidebarLayout";
import {
  User,
  Shield,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [, startTransition] = useTransition();

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({});

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({});

  // Set initial form values when user profile is loaded
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setPosition(user.position || "");
        setPhone(user.phone || "");
        setAvatar(user.avatar || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    setProfileFieldErrors({});

    try {
      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        position,
      };
      if (phone.trim()) payload.phone = phone.trim();
      if (avatar.trim()) payload.avatar = avatar.trim();

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setProfileSuccess("Your profile was updated successfully!");
        // Refresh session context
        startTransition(async () => {
          await refreshUser();
        });
      } else if (res.status === 422 && json.error?.fieldErrors) {
        setProfileFieldErrors(json.error.fieldErrors);
        setProfileError(json.error.message || "Please correct highlighted fields.");
      } else {
        setProfileError(json.error?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      setProfileError("Network error: Could not reach the API.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);
    setPasswordFieldErrors({});

    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({
        confirmPassword: ["Passwords do not match"]
      });
      setPasswordError("Your new password and confirmation do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setPasswordSuccess("Your password has been changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (res.status === 422 && json.error?.fieldErrors) {
        setPasswordFieldErrors(json.error.fieldErrors);
        setPasswordError(json.error.message || "Invalid input parameters.");
      } else {
        setPasswordError(json.error?.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      setPasswordError("Network error: Could not reach the API.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SidebarLayout>
      <div className="crm-page-narrow">
        {/* Header Section */}
        <div>
          <h1 className="crm-page-title">Profile</h1>
          <p className="crm-page-subtitle">
            Manage your personal profile details, attributes, and security.
          </p>
        </div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick summary cards */}
          <div className="space-y-6 lg:col-span-1">
            <div className="crm-card p-6 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile Avatar"
                  className="h-20 w-20 rounded-full object-cover border border-zinc-200 mx-auto p-0.5 bg-white shadow-xs"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-2xl mx-auto shadow-xs">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              )}
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">{user.position || "Head of Operations"}</p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 border border-zinc-200/50 text-[10px] font-bold text-zinc-600 uppercase tracking-wider rounded-full">
                <Shield className="h-3 w-3 text-zinc-500" />
                <span>{user.role}</span>
              </span>
            </div>

            <div className="crm-card p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account metadata</h4>
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 text-xs text-zinc-600">
                  <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="font-mono">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2.5 text-xs text-zinc-600">
                    <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs text-zinc-600">
                  <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Authorization
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form: Profile details */}
            <div className="crm-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <h3 className="text-sm font-bold text-zinc-900 mb-5 pb-3 border-b border-zinc-100">Profile Details</h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileSuccess && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-600 flex items-start gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 flex items-start gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{profileError}</span>
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
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          profileFieldErrors.firstName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {profileFieldErrors.firstName?.map((err) => (
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
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          profileFieldErrors.lastName ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {profileFieldErrors.lastName?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>
                </div>

                {/* Position / Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        profileFieldErrors.position ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                  </div>
                  {profileFieldErrors.position?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* Phone & Avatar */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Avatar URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50 focus:outline-none"
                  >
                    {profileLoading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>

            {/* Form: Password changes */}
            <div className="crm-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <h3 className="text-sm font-bold text-zinc-900 mb-5 pb-3 border-b border-zinc-100">Update Password</h3>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordSuccess && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-600 flex items-start gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 flex items-start gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Current password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-10 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                        passwordFieldErrors.currentPassword ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    >
                      {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {passwordFieldErrors.currentPassword?.map((err) => (
                    <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                  ))}
                </div>

                {/* New password & confirmation row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          passwordFieldErrors.newPassword ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {passwordFieldErrors.newPassword?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full rounded-md border bg-white py-1.5 pl-9 pr-3 text-xs text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 ${
                          passwordFieldErrors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-200"
                        }`}
                      />
                    </div>
                    {passwordFieldErrors.confirmPassword?.map((err) => (
                      <span key={err} className="mt-1 block text-[10px] text-red-500 font-medium">{err}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50 focus:outline-none"
                  >
                    {passwordLoading ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
