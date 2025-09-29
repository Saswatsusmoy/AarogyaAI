import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export async function GET() {
  const users = await prisma.user.findMany();
  const result = users.reduce<Record<string, { username: string; passwordHash: string; role: string }>>((acc, u) => {
    acc[u.username] = { username: u.username, passwordHash: u.passwordHash, role: u.role };
    return acc;
  }, {});
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username?: string; password?: string; role?: "doctor" | "patient" };
  const username = (body.username || "").trim().toLowerCase();
  const password = body.password || "";
  const role = body.role;
  if (!username || !password || (role !== "doctor" && role !== "patient")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });
  await prisma.user.create({ data: { username, passwordHash: hashPassword(password), role } });
  return NextResponse.json({ ok: true });
}


