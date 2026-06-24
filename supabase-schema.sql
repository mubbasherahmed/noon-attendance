-- =============================================
-- Noon Attendance — master_attendance Table
-- Single flat table: no joins, no relations.
-- =============================================

CREATE TABLE IF NOT EXISTS master_attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    
    -- Student Profile Metrics
    campus_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    guardian_name TEXT,
    gender TEXT,
    shift TEXT,
    grade TEXT,
    room TEXT NOT NULL,
    online_teacher TEXT,
    facilitator TEXT,
    pic TEXT, -- URL to student image (Google Drive link)
    
    -- Aggregate Analytics
    sessions_present INTEGER DEFAULT 0,
    sessions_absent INTEGER DEFAULT 0,
    sessions_on_leave INTEGER DEFAULT 0,
    days_attended INTEGER DEFAULT 0,
    current_month_attendance_pct TEXT,
    attended_at_least_4_sessions TEXT,
    on_latest_sis_booklet TEXT,
    verification_status TEXT,
    bonus_eligibility TEXT,
    dropped_out TEXT,
    status_30d TEXT,
    
    -- Timeline Milestones
    first_attended TEXT,
    last_attended TEXT,
    last_attended_mo TEXT,
    absent_since TEXT,
    
    -- Rolling Daily History Windows
    present_status_day_minus_6 TEXT,
    present_status_day_minus_5 TEXT,
    present_status_day_minus_4 TEXT,
    present_status_day_minus_3 TEXT,
    present_status_day_minus_2 TEXT,
    present_status_day_minus_1 TEXT,
    present_status_current_date TEXT,
    daily_retention TEXT,
    
    -- Rolling Weekly History Windows
    present_status_current_week TEXT,
    present_status_week_minus_1 TEXT,
    present_status_week_minus_2 TEXT,
    present_status_week_minus_3 TEXT,
    present_status_week_minus_4 TEXT,
    wow_retention TEXT,
    
    -- Rolling Monthly History Windows
    present_status_month_minus_2 TEXT,
    present_status_month_minus_1 TEXT,
    present_status_month TEXT,
    mom_retention TEXT,

    -- Enforces row uniqueness per student, room, and campus
    UNIQUE (campus_name, room, roll_number)
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_master_attendance_campus ON master_attendance (campus_name);
CREATE INDEX IF NOT EXISTS idx_master_attendance_room ON master_attendance (campus_name, room);
CREATE INDEX IF NOT EXISTS idx_master_attendance_roll ON master_attendance (roll_number);
CREATE INDEX IF NOT EXISTS idx_master_attendance_composite ON master_attendance (campus_name, room, roll_number);
