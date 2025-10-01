"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"doctor" | "patient">("patient");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(user.role === "doctor" ? "/doctor" : "/patient");
    }
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const res = await login(username, password, remember);
        if (!res.ok) {
          setError(res.error);
          return;
        }
      } else {
        const reg = await register(username, password, role);
        if (!reg.ok) {
          setError(reg.error);
          return;
        }
        const res = await login(username, password, remember);
        if (!res.ok) {
          setError(res.error);
          return;
        }
      }
      // Redirect by logged-in user's role if available, else form role
      const target = user?.role || role;
      router.replace(target === "doctor" ? "/doctor" : "/patient");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-6 shadow">
        <h1 className="text-2xl font-semibold mb-4">{mode === "login" ? "Login" : "Register"}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none pr-24"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm underline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select
                className="w-full px-3 py-2 rounded border border-white/20 bg-transparent outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            {error && (
              <div className="text-sm text-red-500 text-right">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded bg-foreground text-background hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-sm flex items-center justify-between">
          {mode === "login" ? (
            <button className="underline" onClick={() => setMode("register")}>Need an account? Register</button>
          ) : (
            <button className="underline" onClick={() => setMode("login")}>Have an account? Login</button>
          )}
          <button className="text-xs opacity-75 hover:opacity-100" onClick={() => { setUsername(""); setPassword(""); setError(null); }}>Clear</button>
        </div>
      </div>
    </div>
  );
}


