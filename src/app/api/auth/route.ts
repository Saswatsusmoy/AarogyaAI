import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username?: string; password?: string };
  const username = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: { username: user.username, passwordHash: user.passwordHash, role: user.role } });
}


