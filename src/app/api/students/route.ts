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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetName, studentId, studentName, rollNumber, campusName } = body;

    if (!sheetName || !studentId || !studentName || !rollNumber || !campusName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Columns: Sheet_Name | Student ID | Student Name | Roll Number | Attendance_Counter | Campus_Name
    await appendRow("Attendance_Data!A:F", [sheetName, studentId, studentName, rollNumber, "", campusName]);

    return NextResponse.json({ success: true, message: "Student created" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student", details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetName, studentId, studentName, rollNumber, campusName, rowIndex } = body;

    if (!rowIndex) {
      return NextResponse.json({ error: "rowIndex is required" }, { status: 400 });
    }

    await batchUpdateValues([
      {
        range: `Attendance_Data!A${rowIndex}:D${rowIndex}`,
        values: [[sheetName, studentId, studentName, rollNumber]],
      },
      {
        range: `Attendance_Data!F${rowIndex}`,
        values: [[campusName]],
      }
    ]);

    return NextResponse.json({ success: true, message: "Student updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rowIndex = request.nextUrl.searchParams.get("rowIndex");

    if (!rowIndex) {
      return NextResponse.json({ error: "rowIndex is required" }, { status: 400 });
    }

    await deleteRow("Attendance_Data", parseInt(rowIndex, 10));

    return NextResponse.json({ success: true, message: "Student deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student", details: String(error) }, { status: 500 });
  }
}
