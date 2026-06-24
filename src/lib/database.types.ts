// =============================================
// Supabase Database Types — Relational Schema
// Auto-aligned with the supabase-schema.sql DDL
// =============================================

export interface EnrollmentRow {
  id: number;
  campus_name: string;
  roll_number: string;
  student_name: string;
  gaurdian_name: string | null;
  gender: string | null;
  shift: string | null;
  grade: string | null;
  room: string;
  online_teacher: string | null;
  facilitator: string | null;
  enrollment_date: string | null;
  age: string | null;
  contact_number: string | null;
  student_b_form_number: string | null;
  student_status: string | null;
}

export type EnrollmentInsert = Omit<EnrollmentRow, "id"> & { id?: number };
export type EnrollmentUpdate = Partial<EnrollmentRow>;

export interface AttendanceRow {
  id: number;
  date: string;
  campus_name: string;
  roll_number: string;
  student_name: string;
  gaurdian_name: string | null;
  shift: string | null;
  grade: string | null;
  room: string;
  online_teacher: string | null;
  facilitator: string | null;
  status: string;
}

export type AttendanceInsert = Omit<AttendanceRow, "id"> & { id?: number };
export type AttendanceUpdate = Partial<AttendanceRow>;

/** Supabase generic database type */
export interface Database {
  public: {
    Tables: {
      enrollments: {
        Row: EnrollmentRow;
        Insert: EnrollmentInsert;
        Update: EnrollmentUpdate;
        Relationships: [];
      };
      attendance: {
        Row: AttendanceRow;
        Insert: AttendanceInsert;
        Update: AttendanceUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_room_attendance_heatmap: {
        Args: {
          p_campus_name: string;
          p_room: string;
          p_target_date: string;
          p_days_back?: number;
        };
        Returns: {
          roll_number: string;
          date: string;
          status: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
