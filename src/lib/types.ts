// =============================================
// Attendance Management App — Type Definitions
// =============================================

export interface Campus {
  campusName: string;
  principalName: string;
  numberOfStudents: number;
  /** 1-indexed row number in the Google Sheet */
  rowIndex: number;
}

export interface Room {
  roomId: string;
  roomName: string;
  currentSheetName: string;
  campusName: string;
  /** 1-indexed row number in the Google Sheet (for updates) */
  rowIndex: number;
}

export interface Student {
  studentId: string;
  studentName: string;
  rollNumber: string;
  sheetName: string;
  attendanceCounter: number;
  campusName: string;
  /** 1-indexed row number in the Google Sheet (for updates) */
  rowIndex: number;
}

export interface AttendanceUpdate {
  studentId: string;
  incrementBy: number;
}

export interface BatchSaveRequest {
  updates: AttendanceUpdate[];
}

export interface BatchSaveResponse {
  success: boolean;
  updatedCount: number;
  errors?: string[];
}

export interface TransferRequest {
  studentId: string;
  sourceSheet: string;
  targetSheet: string;
  campusName: string;
}

export interface TransferResponse {
  success: boolean;
  merged: boolean;
  message: string;
}

export interface RoomSwapRequest {
  roomId: string;
  newSheetName: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
