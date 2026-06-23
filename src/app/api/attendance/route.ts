// POST /api/attendance — Batch save attendance counter increments
// Receives { updates: [{ studentId, incrementBy }] }
// Performs a single batchUpdate to Google Sheets
import { NextRequest, NextResponse } from "next/server";
import { getStudents, batchUpdateValues } from "@/lib/google-sheets";
import { BatchSaveRequest, BatchSaveResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Fetch all students to find their current counters and row indices
    const allStudents = await getStudents();
    const errors: string[] = [];
    const batchData: { range: string; values: (string | number)[][] }[] = [];

    for (const update of updates) {
      const student = allStudents.find((s) => s.studentId === update.studentId);
      if (!student) {
        errors.push(`Student "${update.studentId}" not found`);
        continue;
      }

      const newCounter = student.attendanceCounter + update.incrementBy;

      // Column E = Attendance_Counter in the Attendance_Data tab
      batchData.push({
        range: `Attendance_Data!E${student.rowIndex}`,
        values: [[newCounter]],
      });
    }

    let updatedCount = 0;
    if (batchData.length > 0) {
      updatedCount = await batchUpdateValues(batchData);
    }

    const response: BatchSaveResponse = {
      success: errors.length === 0,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to batch save attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance data", details: String(error) },
      { status: 500 }
    );
  }
}
