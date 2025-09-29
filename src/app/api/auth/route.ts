import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/hash";

type UserRole = "doctor" | "patient";
type StoredUser = {
  username: string;
  passwordHash: string;
  role: UserRole;
};

const DATA_PATH = path.join(process.cwd(), "src", "data", "users.json");

async function readUsers(): Promise<Record<string, StoredUser>> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, StoredUser>;
    return parsed || {};
  } catch (e) {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username?: string; password?: string };
  const username = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  const users = await readUsers();
  const user = users[username];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}


