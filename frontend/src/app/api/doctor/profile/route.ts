import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username }, include: { doctorProfile: true } });
  if (!user || user.role !== "doctor") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(user.doctorProfile || null);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    username?: string;
    name?: string | null;
    age?: number | null;
    phone?: string | null;
    department?: string | null;
    speciality?: string | null;
  };
  const username = (body.username || "").trim().toLowerCase();
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== "doctor") return NextResponse.json({ error: "not found" }, { status: 404 });
  const upserted = await prisma.doctorProfile.upsert({
    where: { userId: user.id },
    update: {
      name: body.name ?? undefined,
      age: body.age ?? undefined,
      phone: body.phone ?? undefined,
      department: body.department ?? undefined,
      speciality: body.speciality ?? undefined,
    },
    create: {
      userId: user.id,
      name: body.name ?? null,
      age: body.age ?? null,
      phone: body.phone ?? null,
      department: body.department ?? null,
      speciality: body.speciality ?? null,
    },
  });
  return NextResponse.json(upserted);
}


