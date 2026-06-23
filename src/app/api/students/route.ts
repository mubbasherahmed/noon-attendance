// GET /api/students?campus=X&sheet=Y — Fetch students with optional filters
import { NextRequest, NextResponse } from "next/server";
import { getStudents } from "@/lib/google-sheets";

export async function GET(request: NextRequest) {
  try {
    const campus = request.nextUrl.searchParams.get("campus") || undefined;
    const sheet = request.nextUrl.searchParams.get("sheet") || undefined;
    const students = await getStudents(campus, sheet);
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", details: String(error) },
      { status: 500 }
    );
  }
}
