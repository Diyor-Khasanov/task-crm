"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const roleCookieName = "crm_user_role";

function rememberUserRole(userData: User) {
  document.cookie = `${roleCookieName}=${userData.role}; path=/; SameSite=Lax`;
}

function clearUserRole() {
  document.cookie = `${roleCookieName}=; path=/; max-age=0; SameSite=Lax`;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EMPLOYEE";
  avatar: string;
  position?: string;
  phone?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setUser(json.data);
          rememberUserRole(json.data);
          return json.data;
        }
      }
      setUser(null);
      clearUserRole();
      return null;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      setUser(null);
      clearUserRole();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    rememberUserRole(userData);
    setLoading(false);
    router.push("/dashboard");
  };

  const logout = async () => {
    setLoading(true);
    try {
      // 1. Clear local cookies via our api/logout route
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Error calling local logout endpoint:", error);
    } finally {
      setUser(null);
      clearUserRole();
      setLoading(false);
      router.push("/login");
    }
  };

  // On mount, check if user is already authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshUser();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
