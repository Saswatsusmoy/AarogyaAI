import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereClause: any = {};

    if (search) {
      whereClause.TestName = {
        contains: search,
        mode: "insensitive",
      };
    }

    const tests = await prisma.medicalTests.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        TestName: "asc",
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Error fetching medical tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical tests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { TestName } = body;

    if (!TestName) {
      return NextResponse.json(
        { error: "Test name is required" },
        { status: 400 }
      );
    }

    const test = await prisma.medicalTests.create({
      data: {
        TestName,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Error creating medical test:", error);
    return NextResponse.json(
      { error: "Failed to create medical test" },
      { status: 500 }
    );
  }
}
