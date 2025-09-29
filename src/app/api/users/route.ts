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

async function writeUsers(users: Record<string, StoredUser>): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2));
}

export async function GET() {
  const users = await readUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username?: string; password?: string; role?: UserRole };
  const username = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  const role = body.role;
  if (!username || !password || (role !== "doctor" && role !== "patient")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const users = await readUsers();
  if (users[username]) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  users[username] = { username, passwordHash: hashPassword(password), role };
  await writeUsers(users);
  return NextResponse.json({ ok: true });
}


