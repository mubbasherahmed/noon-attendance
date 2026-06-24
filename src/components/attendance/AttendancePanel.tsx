"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import StudentRow from "./StudentRow";
import { SkeletonRow } from "@/components/ui/LoadingSpinner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Save, Users, AlertCircle, Search, UserCheck, UserX, Clock } from "lucide-react";
import { toast } from "sonner";

interface AttendancePanelProps {
  roomName: string;
}

export default function AttendancePanel({ roomName }: AttendancePanelProps) {
  const {
    students,
    loadingStudents,
    hasPendingChanges,
    pendingCount,
    saveSession,
    savingSession,
    attendanceDate,
    setAttendanceDate,
    getStudentStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.student_name?.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Summary stats based on the selected date
  const presentCount = students.filter((s) => getStudentStatus(s.roll_number) === "Present").length;
  const absentCount = students.filter((s) => getStudentStatus(s.roll_number) === "Absent").length;
  const leaveCount = students.filter((s) => getStudentStatus(s.roll_number) === "Leave").length;
  const unmarkedCount = students.length - presentCount - absentCount - leaveCount;

  async function handleSave() {
    const result = await saveSession();
    if (result.success) {
      toast.success("Attendance saved!", {
        description: `${pendingCount} student(s) updated successfully for ${attendanceDate}.`,
      });
    } else {
      toast.error("Failed to save attendance", {
        description: result.error || "Please try again.",
      });
    }
  }

  // Handle Date Change
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Input format is YYYY-MM-DD
    const val = e.target.value;
    if (!val) return;
    const [year, month, day] = val.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthStr = d.toLocaleString('en-GB', { month: 'short' });
    const formattedDate = `${dayStr}-${monthStr}-${year}`;
    setAttendanceDate(formattedDate);
  }

  // Convert "DD-MMM-YYYY" to "YYYY-MM-DD" for the input
  const isoDate = useMemo(() => {
    try {
      const parts = attendanceDate.split('-');
      if (parts.length === 3) {
        const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      // fallback
    }
    return new Date().toISOString().split('T')[0];
  }, [attendanceDate]);

  return (
    <div className="glass-card-static overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-border gap-3">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-accent" />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Student Roster
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-muted">
                {students.length} student{students.length !== 1 ? "s" : ""}
              </span>
              <span className="text-border text-xs">•</span>
              <input
                type="date"
                value={isoDate}
                onChange={handleDateChange}
                className="bg-surface/50 border border-border rounded text-xs px-2 py-0.5 text-text-secondary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!hasPendingChanges || savingSession}
            className="btn-primary relative"
          >
            {savingSession ? (
              <LoadingSpinner size={16} />
            ) : (
              <Save size={16} />
            )}
            <span className="hidden sm:inline">
              {savingSession ? "Saving..." : "Save Attendance Session"}
            </span>
            {hasPendingChanges && !savingSession && (
              <span className="badge badge-emerald ml-1">{pendingCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-surface-light/20">
        <div className="flex items-center gap-1.5">
          <UserCheck size={14} className="text-emerald" />
          <span className="text-xs font-medium text-emerald">{presentCount} Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserX size={14} className="text-rose" />
          <span className="text-xs font-medium text-rose">{absentCount} Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-text-muted" />
          <span className="text-xs font-medium text-text-muted">{unmarkedCount} Unmarked</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input !max-w-none"
          />
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasPendingChanges && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber/5 border-b border-amber/15">
          <AlertCircle size={14} className="text-amber" />
          <span className="text-xs text-amber font-medium">
            {pendingCount} unsaved change{pendingCount !== 1 ? "s" : ""}. Click
            &quot;Save Attendance Session&quot; to sync.
          </span>
        </div>
      )}

      {/* Student List */}
      <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
        {loadingStudents ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">
              {searchQuery ? "No matching students" : "No students found"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {searchQuery
                ? "Try a different search term"
                : `No students are assigned to room "${roomName}".`}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))
        )}
      </div>
    </div>
  );
}
