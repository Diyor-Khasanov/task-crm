"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const refreshUser = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setUser(json.data);
          return json.data;
        }
      }
      setUser(null);
      return null;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
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
      setLoading(false);
      router.push("/login");
    }
  };

  // On mount, check if user is already authenticated
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, []);

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
