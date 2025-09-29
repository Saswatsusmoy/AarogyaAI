import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Append a transcription line to a specific appointment
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { appointmentId?: string; text?: string };
  const appointmentId = (body.appointmentId || "").trim();
  const text = (body.text || "").trim();
  if (!appointmentId || !text) return NextResponse.json({ error: "appointmentId and text required" }, { status: 400 });

  // Verify appointment exists
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return NextResponse.json({ error: "appointment not found" }, { status: 404 });

  await prisma.appointmentTranscription.create({
    data: { appointmentId, text },
  });
  return NextResponse.json({ ok: true });
}

// Get all transcriptions for a specific appointment
export async function GET(req: NextRequest) {
  const appointmentId = req.nextUrl.searchParams.get("appointmentId")?.trim();
  if (!appointmentId) return NextResponse.json({ error: "appointmentId required" }, { status: 400 });

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return NextResponse.json({ error: "appointment not found" }, { status: 404 });

  const transcriptions = await prisma.appointmentTranscription.findMany({
    where: { appointmentId },
    orderBy: { createdAt: 'asc' },
    select: { text: true, createdAt: true },
  });
  
  return NextResponse.json(transcriptions);
}


