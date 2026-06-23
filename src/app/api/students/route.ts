// GET /api/students?campus=X&sheet=Y — Fetch students with optional filters
import { NextRequest, NextResponse } from "next/server";
import { getStudents, appendRow, batchUpdateValues, deleteRow } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const campus = request.nextUrl.searchParams.get("campus") || undefined;
    const sheet = request.nextUrl.searchParams.get("sheet") || undefined;
    const date = request.nextUrl.searchParams.get("date") || undefined;
    const students = await getStudents(campus, sheet, date);
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", details: String(error) },
      { status: 500 }
    );
  }
}


