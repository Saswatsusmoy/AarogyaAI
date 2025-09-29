import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username }, include: { patientProfile: true } });
  if (!user || user.role !== "patient") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(user.patientProfile || null);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as {
    username?: string;
    name?: string | null;
    age?: number | null;
    gender?: string | null;
    weight?: number | null;
    height?: number | null;
    phone?: string | null;
    allergies?: string | null;
    ailments?: string | null;
    scribeNotes?: string | null;
  };
  const username = (body.username || "").trim().toLowerCase();
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== "patient") return NextResponse.json({ error: "not found" }, { status: 404 });
  const upserted = await prisma.patientProfile.upsert({
    where: { userId: user.id },
    update: {
      name: body.name ?? undefined,
      age: body.age ?? undefined,
      gender: body.gender ?? undefined,
      weight: body.weight ?? undefined,
      height: body.height ?? undefined,
      phone: body.phone ?? undefined,
      allergies: body.allergies ?? undefined,
      ailments: body.ailments ?? undefined,
      scribeNotes: body.scribeNotes ?? undefined,
    },
    create: {
      userId: user.id,
      name: body.name ?? null,
      age: body.age ?? null,
      gender: body.gender ?? null,
      weight: body.weight ?? null,
      height: body.height ?? null,
      phone: body.phone ?? null,
      allergies: body.allergies ?? null,
      ailments: body.ailments ?? null,
      scribeNotes: body.scribeNotes ?? null,
    },
  });
  return NextResponse.json(upserted);
}


