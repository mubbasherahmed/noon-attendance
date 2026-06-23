// =============================================
// Google Sheets API Client
// Singleton client with helper functions for
// reading, writing, and batch-updating sheets.
// =============================================

import { google, sheets_v4 } from "googleapis";
import { Room, Student } from "./types";

// ── Auth & Client ────────────────────────────

function getAuthClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY environment variables"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

let sheetsClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (!sheetsClient) {
    const auth = getAuthClient();
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable");
  }
  return id;
}

// ── Generic Helpers ──────────────────────────

export async function getSheetData(
  range: string
): Promise<string[][]> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range,
  });
  return (response.data.values as string[][]) || [];
}

export async function updateCell(
  range: string,
  value: string | number
): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[value]],
    },
  });
}

export async function batchUpdateValues(
  data: { range: string; values: (string | number)[][] }[]
): Promise<number> {
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: data.map((d) => ({
        range: d.range,
        values: d.values,
      })),
    },
  });
  return response.data.totalUpdatedCells || 0;
}

export async function deleteRow(
  sheetTabName: string,
  rowIndex: number
): Promise<void> {
  const sheets = getSheetsClient();

  // First, get the sheet's numeric ID from its tab name
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetTabName
  );

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`Sheet tab "${sheetTabName}" not found`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex, // exclusive
            },
          },
        },
      ],
    },
  });
}

// ── Domain-Specific Helpers ──────────────────

/**
 * Fetch all rooms from the "Rooms" tab.
 * Columns: Room ID | Room Name | Current_Sheet_Name | Campus_Name
 */
export async function getRooms(campusFilter?: string): Promise<Room[]> {
  const rows = await getSheetData("Rooms!A2:D");
  const rooms: Room[] = rows.map((row, idx) => ({
    roomId: row[0] || "",
    roomName: row[1] || "",
    currentSheetName: row[2] || "",
    campusName: row[3] || "",
    rowIndex: idx + 2, // +2 because row 1 is header and rows are 1-indexed
  }));

  if (campusFilter) {
    return rooms.filter(
      (r) => r.campusName.toLowerCase() === campusFilter.toLowerCase()
    );
  }
  return rooms;
}

/**
 * Fetch all students from the "Attendance_Data" tab.
 * Columns: Sheet_Name | Student ID | Student Name | Roll Number | Attendance_Counter | Campus_Name
 */
export async function getStudents(
  campusFilter?: string,
  sheetFilter?: string
): Promise<Student[]> {
  const rows = await getSheetData("Attendance_Data!A2:F");
  let students: Student[] = rows.map((row, idx) => ({
    sheetName: row[0] || "",
    studentId: row[1] || "",
    studentName: row[2] || "",
    rollNumber: row[3] || "",
    attendanceCounter: parseInt(row[4] || "0", 10),
    campusName: row[5] || "",
    rowIndex: idx + 2,
  }));

  if (campusFilter) {
    students = students.filter(
      (s) => s.campusName.toLowerCase() === campusFilter.toLowerCase()
    );
  }
  if (sheetFilter) {
    students = students.filter(
      (s) => s.sheetName.toLowerCase() === sheetFilter.toLowerCase()
    );
  }

  return students;
}

/**
 * Get unique campus names from the Rooms tab.
 */
export async function getCampuses(): Promise<string[]> {
  const rows = await getSheetData("Rooms!D2:D");
  const campuses = new Set<string>();
  rows.forEach((row) => {
    if (row[0]?.trim()) {
      campuses.add(row[0].trim());
    }
  });
  return Array.from(campuses).sort();
}

/**
 * Get unique sheet names from the Attendance_Data tab, optionally filtered by campus.
 */
export async function getSheetNames(campusFilter?: string): Promise<string[]> {
  const rows = await getSheetData("Attendance_Data!A2:F");
  const names = new Set<string>();
  rows.forEach((row) => {
    const sheetName = row[0]?.trim();
    const campus = row[5]?.trim();
    if (sheetName) {
      if (!campusFilter || campus?.toLowerCase() === campusFilter.toLowerCase()) {
        names.add(sheetName);
      }
    }
  });
  return Array.from(names).sort();
}
