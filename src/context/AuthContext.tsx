"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAdmin: boolean;
  isUser: boolean;
  loginAsAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsUser: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const authStatus = localStorage.getItem("auth_status");
    if (authStatus === "admin") {
      setIsAdmin(true);
    } else if (authStatus === "user") {
      setIsUser(true);
    }
    setLoading(false);
  }, []);

  const loginAsAdmin = async (password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin", password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("auth_status", "admin");
        setIsAdmin(true);
        setIsUser(false);
        router.push("/");
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid password" };
    } catch (error) {
      return { success: false, error: "Authentication failed" };
    }
  };

  const loginAsUser = () => {
    localStorage.setItem("auth_status", "user");
    setIsUser(true);
    setIsAdmin(false);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("auth_status");
    setIsAdmin(false);
    setIsUser(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isUser, loginAsAdmin, loginAsUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
