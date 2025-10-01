"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StoredUser, UserRole, clearSession, createUser, getCurrentUserClient, setSession, validateCredentials } from "@/lib/auth";

type AuthState = {
  user: StoredUser | null;
  loading: boolean;
  login: (username: string, password: string, remember?: boolean) => Promise<{ ok: true } | { ok: false; error: string }>
  register: (username: string, password: string, role: UserRole) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const current = getCurrentUserClient();
    if (!current) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetch("/api/users")
      .then(res => res.json())
      .then((users: Record<string, StoredUser>) => {
        const u = users[current.username];
        setUser(u || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string, remember: boolean = false) => {
    const res = await validateCredentials(username, password);
    if (!res.ok) return res;
    setSession(res.user, remember);
    setUser(res.user);
    return { ok: true } as const;
  }, []);

  const register = useCallback(async (username: string, password: string, role: UserRole) => {
    const res = await createUser(username, password, role);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


