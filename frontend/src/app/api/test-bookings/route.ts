import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId, appointmentId, patientUsername, scheduledAt, notes } = body;

    if (!testId || !patientUsername) {
      return NextResponse.json(
        { error: "Test ID and patient username are required" },
        { status: 400 }
      );
    }

    // Find the patient
    const patient = await prisma.user.findUnique({
      where: { username: patientUsername.toLowerCase() }
    });

    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Find the test
    const test = await prisma.medicalTests.findUnique({
      where: { TestID: testId }
    });

    if (!test) {
      return NextResponse.json(
        { error: "Medical test not found" },
        { status: 404 }
      );
    }

    // Validate scheduledAt if provided
    let scheduledDate = null;
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduled date" },
          { status: 400 }
        );
      }
    }

    // Check if appointment exists if appointmentId is provided
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });
      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }
    }

    // Create test booking record
    const testBooking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testId,
      testName: test.TestName,
      appointmentId: appointmentId || null,
      patientUsername,
      patientId: patient.id,
      scheduledAt: scheduledDate ? scheduledDate.toISOString() : null,
      notes: notes || null,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      message: `Test booking for "${test.TestName}" has been created successfully.`
    };

    // In a real implementation, this would save to a test_bookings table
    // For now, we'll return the booking data
    return NextResponse.json(testBooking, { status: 201 });

  } catch (error) {
    console.error("Error creating test booking:", error);
    return NextResponse.json(
      { error: "Failed to create test booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientUsername = searchParams.get("patientUsername");

    if (!patientUsername) {
      return NextResponse.json(
        { error: "Patient username is required" },
        { status: 400 }
      );
    }

    // Find the patient
    const patient = await prisma.user.findUnique({
      where: { username: patientUsername.toLowerCase() }
    });

    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // For now, return mock data since we don't have a test bookings table
    // In a real implementation, you'd query the test bookings table
    const mockBookings = [
      {
        id: "booking_1",
        testId: "test_1",
        testName: "Blood Test",
        appointmentId: "appt_1",
        status: "PENDING",
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockBookings);

  } catch (error) {
    console.error("Error fetching test bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch test bookings" },
      { status: 500 }
    );
  }
}
