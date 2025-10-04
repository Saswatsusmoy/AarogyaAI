export type UserRole = "doctor" | "patient";

export type StoredUser = {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
};

const SESSION_KEY = "aarogyaai_session_user";
const AUTH_COOKIE = "aarogyaai_auth";

export async function createUser(
  username: string,
  password: string,
  role: UserRole
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "User-Agent": "AarogyaAI-Frontend/1.0.0",
    },
    body: JSON.stringify({ username, password, role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || "Failed to create user" };
  }
  // Create empty profile per role
  try {
    if (role === "patient") {
      await fetch("/api/patient/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "AarogyaAI-Frontend/1.0.0",
        },
        body: JSON.stringify({ username }),
      });
    } else if (role === "doctor") {
      await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "AarogyaAI-Frontend/1.0.0",
        },
        body: JSON.stringify({ username }),
      });
    }
  } catch {
    // ignore soft failure
  }
  return { ok: true };
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "User-Agent": "AarogyaAI-Frontend/1.0.0",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || "Invalid credentials" };
  }
  const data = (await res.json()) as { ok: true; user: StoredUser };
  return data;
}

export function setSession(user: StoredUser, remember: boolean = false): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }));
  const cookieValue = encodeURIComponent(
    JSON.stringify({ u: user.username, r: user.role })
  );
  // If remember is true, persist for 30 days, otherwise session cookie
  if (remember) {
    const maxAge = 60 * 60 * 24 * 30;
    document.cookie = `${AUTH_COOKIE}=${cookieValue}; Max-Age=${maxAge}; Path=/`;
  } else {
    document.cookie = `${AUTH_COOKIE}=${cookieValue}; Path=/`;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${AUTH_COOKIE}=; Max-Age=0; Path=/`;
}

export function getCurrentUserClient(): { username: string } | null {
  if (typeof window === "undefined") return null;
  const sessionRaw = localStorage.getItem(SESSION_KEY);
  if (!sessionRaw) return null;
  try {
    const session = JSON.parse(sessionRaw) as { username: string };
    return session;
  } catch {
    return null;
  }
}

export function parseAuthCookie(value: string | undefined): { u?: string; r?: UserRole } {
  if (!value) return {};
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as { u?: string; r?: UserRole };
    return parsed || {};
  } catch {
    return {};
  }
}


