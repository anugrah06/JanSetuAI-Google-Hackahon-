"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "CITIZEN" | "GOVERNMENT_ADMIN";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginCitizen: (usernameOrEmail: string, password: string) => Promise<User>;
  loginAdmin: (usernameOrEmail: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user profile on load via HttpOnly cookie or cached token
  const refreshUser = async () => {
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("jansetu_auth_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers,
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const userData: User = await res.json();
        setUser(userData);
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("jansetu_auth_token");
        }
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginCitizen = async (usernameOrEmail: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/citizen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password: password,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(errData.detail || "Citizen authentication failed");
      }

      const data = await res.json();
      if (data.access_token && typeof window !== "undefined") {
        sessionStorage.setItem("jansetu_auth_token", data.access_token);
      }
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (usernameOrEmail: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password: password,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(errData.detail || "Government administrator authentication failed");
      }

      const data = await res.json();
      if (data.access_token && typeof window !== "undefined") {
        sessionStorage.setItem("jansetu_auth_token", data.access_token);
      }
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("jansetu_auth_token");
      }
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        loginCitizen,
        loginAdmin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
