// =============================================
// Supabase Database Types — master_attendance
// Auto-aligned with the supabase-schema.sql DDL
// =============================================

export interface MasterAttendanceRow {
  id: number;

  // Student Profile
  campus_name: string;
  roll_number: string;
  student_name: string;
  guardian_name: string | null;
  gender: string | null;
  shift: string | null;
  grade: string | null;
  room: string;
  online_teacher: string | null;
  facilitator: string | null;
  pic: string | null;

  // Aggregate Analytics
  sessions_present: number;
  sessions_absent: number;
  sessions_on_leave: number;
  days_attended: number;
  current_month_attendance_pct: string | null;
  attended_at_least_4_sessions: string | null;
  on_latest_sis_booklet: string | null;
  verification_status: string | null;
  bonus_eligibility: string | null;
  dropped_out: string | null;
  status_30d: string | null;

  // Timeline Milestones
  first_attended: string | null;
  last_attended: string | null;
  last_attended_mo: string | null;
  absent_since: string | null;

  // Rolling Daily Windows
  present_status_day_minus_6: string | null;
  present_status_day_minus_5: string | null;
  present_status_day_minus_4: string | null;
  present_status_day_minus_3: string | null;
  present_status_day_minus_2: string | null;
  present_status_day_minus_1: string | null;
  present_status_current_date: string | null;
  daily_retention: string | null;

  // Rolling Weekly Windows
  present_status_current_week: string | null;
  present_status_week_minus_1: string | null;
  present_status_week_minus_2: string | null;
  present_status_week_minus_3: string | null;
  present_status_week_minus_4: string | null;
  wow_retention: string | null;

  // Rolling Monthly Windows
  present_status_month_minus_2: string | null;
  present_status_month_minus_1: string | null;
  present_status_month: string | null;
  mom_retention: string | null;
}

/** Insert shape — omit auto-generated fields */
export type MasterAttendanceInsert = Omit<MasterAttendanceRow, "id"> & {
  id?: number;
};

/** Update shape — everything optional except the composite key */
export type MasterAttendanceUpdate = Partial<MasterAttendanceRow>;

/** Supabase generic database type */
export interface Database {
  public: {
    Tables: {
      master_attendance: {
        Row: MasterAttendanceRow;
        Insert: MasterAttendanceInsert;
        Update: MasterAttendanceUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
