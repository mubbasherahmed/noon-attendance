import { EnrollmentRow } from "./database.types";

// =============================================
// Domain Models (Mapped to new Schema)
// =============================================

export type Student = EnrollmentRow;

// Derived summaries used in dashboard/navigation
export interface CampusSummary {
  campus_name: string;
  studentCount: number;
}

export interface RoomSummary {
  room: string;
  studentCount: number;
}

// =============================================
// API Payloads
// =============================================

export interface AttendanceUpdate {
  roll_number: string;
  status: "Present" | "Absent" | "Leave" | "Late" | "No class";
}

export interface BatchSaveRequest {
  date: string;
  campus_name: string;
  room: string;
  updates: AttendanceUpdate[];
}

export interface BatchSaveResponse {
  success: boolean;
  message: string;
  errors?: string[];
  updatedCount?: number;
}
