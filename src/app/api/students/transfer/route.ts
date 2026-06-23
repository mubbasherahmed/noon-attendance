// POST /api/students/transfer — Transfer student between sheets
// Handles both merge (sum counters) and clean swap scenarios
import { NextRequest, NextResponse } from "next/server";
import {
  getStudents,
  updateCell,
  batchUpdateValues,
  deleteRow,
} from "@/lib/google-sheets";
import { TransferRequest, TransferResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: TransferRequest = await request.json();
    const { studentId, sourceSheet, targetSheet, campusName } = body;

    if (!studentId || !sourceSheet || !targetSheet || !campusName) {
      return NextResponse.json(
        {
          error:
            "studentId, sourceSheet, targetSheet, and campusName are all required",
        },
        { status: 400 }
      );
    }

    if (sourceSheet === targetSheet) {
      return NextResponse.json(
        { error: "Source and target sheets must be different" },
        { status: 400 }
      );
    }

    // Fetch students for the campus
    const allStudents = await getStudents(campusName);

    // Find the source student
    const sourceStudent = allStudents.find(
      (s) => s.studentId === studentId && s.sheetName === sourceSheet
    );

    if (!sourceStudent) {
      return NextResponse.json(
        {
          error: `Student "${studentId}" not found on sheet "${sourceSheet}" in campus "${campusName}"`,
        },
        { status: 404 }
      );
    }

    // Check if student already exists on the target sheet
    const targetStudent = allStudents.find(
      (s) => s.studentId === studentId && s.sheetName === targetSheet
    );

    if (targetStudent) {
      return NextResponse.json(
        {
          error: `Student "${studentId}" already exists on target sheet "${targetSheet}". Merging daily attendance is not supported.`,
        },
        { status: 400 }
      );
    } else {
      // ── CLEAN SWAP PATH ──
      // Simply update the Sheet_Name cell (column A) from sourceSheet to targetSheet
      await updateCell(
        `Attendance_Data!A${sourceStudent.rowIndex}`,
        targetSheet
      );

      const response: TransferResponse = {
        success: true,
        merged: false,
        message: `Transferred student "${sourceStudent.studentName}" from "${sourceSheet}" to "${targetSheet}".`,
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("Failed to transfer student:", error);
    return NextResponse.json(
      { error: "Failed to transfer student", details: String(error) },
      { status: 500 }
    );
  }
}
