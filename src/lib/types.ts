// =============================================
// Attendance Management App — Type Definitions
// Aligned with Supabase master_attendance table
// =============================================

import { MasterAttendanceRow } from "./database.types";

/** Re-export the row type as Student for convenience */
export type Student = MasterAttendanceRow;

/** Campus summary derived from DISTINCT campus_name */
export interface CampusSummary {
  campus_name: string;
  student_count: number;
}

/** Room summary derived from GROUP BY room */
export interface RoomSummary {
  room: string;
  student_count: number;
}

/** Single attendance status change */
export interface AttendanceUpdate {
  roll_number: string;
  status: "Present" | "Absent" | "Leave" | null;
}

/** Batch save request for attendance */
export interface BatchSaveRequest {
  campus_name: string;
  room: string;
  updates: AttendanceUpdate[];
}

export interface BatchSaveResponse {
  success: boolean;
  updatedCount: number;
  errors?: string[];
}

/** Student transfer / room change request */
export interface TransferRequest {
  roll_number: string;
  campus_name: string;
  new_campus?: string;
  new_room?: string;
}

/** Batch room reassignment */
export interface RoomReassignRequest {
  campus_name: string;
  roll_numbers: string[];
  new_room: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
