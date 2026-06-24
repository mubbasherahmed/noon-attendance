-- =============================================
-- Noon Attendance — Two-Table Relational Schema
-- =============================================

-- Drop the old flat table if it exists
DROP TABLE IF EXISTS master_attendance;

-- 1. Enrollments Table (Student Profiles)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campus_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    gaurdian_name TEXT,
    gender TEXT,
    shift TEXT,
    grade TEXT,
    room TEXT NOT NULL,
    online_teacher TEXT,
    facilitator TEXT,
    enrollment_date TEXT,
    age TEXT,
    contact_number TEXT,
    student_b_form_number TEXT,
    student_status TEXT DEFAULT 'Active',
    
    -- Enforce unique roll number per campus
    UNIQUE (campus_name, roll_number)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_campus ON enrollments (campus_name);
CREATE INDEX IF NOT EXISTS idx_enrollments_room ON enrollments (campus_name, room);

-- 2. Attendance Table (Row-wise date logging)
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date TEXT NOT NULL, -- DD-MMM-YYYY or YYYY-MM-DD
    campus_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    gaurdian_name TEXT,
    shift TEXT,
    grade TEXT,
    room TEXT NOT NULL,
    online_teacher TEXT,
    facilitator TEXT,
    status TEXT NOT NULL, -- 'Present', 'Absent', 'Leave', 'Late', 'No class'
    
    -- Enforce one attendance record per student per day
    UNIQUE (date, campus_name, roll_number)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance (campus_name, roll_number);
CREATE INDEX IF NOT EXISTS idx_attendance_room ON attendance (date, campus_name, room);

-- 3. RPC Function for Admin Dashboard Heatmaps
-- Calculates the last 7 days of attendance for a given room up to a target date
CREATE OR REPLACE FUNCTION get_room_attendance_heatmap(
  p_campus_name TEXT,
  p_room TEXT,
  p_target_date TEXT, -- E.g. '2024-11-20'
  p_days_back INT DEFAULT 7
)
RETURNS TABLE (
  roll_number TEXT,
  date TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.roll_number, a.date, a.status
  FROM attendance a
  WHERE a.campus_name = p_campus_name
    AND a.room = p_room
    AND a.date <= p_target_date
  ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql;
