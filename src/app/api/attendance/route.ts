// POST /api/attendance — Batch save attendance counter increments
// Receives { updates: [{ studentId, incrementBy }] }
// Performs a single batchUpdate to Google Sheets
import { NextRequest, NextResponse } from "next/server";
import { getStudents, batchUpdateValues, getSheetData } from "@/lib/google-sheets";
import { BatchSaveRequest, BatchSaveResponse } from "@/lib/types";

function colIndexToLetter(index: number): string {
  let letter = "";
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json();
    const { updates, date } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0 || !date) {
      return NextResponse.json(
        { error: "updates array and date are required" },
        { status: 400 }
      );
    }

    const allStudents = await getStudents();
    const errors: string[] = [];
    const batchData: { range: string; values: (string | number)[][] }[] = [];

    // Find the date column
    const headerRows = await getSheetData("Attendance!A1:ZZ1");
    const headers = headerRows[0] || [];
    let dateColIndex = headers.findIndex((h) => h?.trim() === date.trim());

    if (dateColIndex === -1) {
      // Create new column for this date
      dateColIndex = headers.length;
      if (dateColIndex < 11) dateColIndex = 11; // Start from column L if somehow empty
      const letter = colIndexToLetter(dateColIndex);
      batchData.push({
        range: `Attendance!${letter}1`,
        values: [[date]],
      });
    }

    const colLetter = colIndexToLetter(dateColIndex);

    for (const update of updates) {
      const student = allStudents.find((s) => s.rollNumber === update.rollNumber);
      if (!student) {
        errors.push(`Student "${update.rollNumber}" not found`);
        continue;
      }

      if (!update.status) continue; // Unselected

      batchData.push({
        range: `Attendance!${colLetter}${student.rowIndex}`,
        values: [[update.status]],
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
