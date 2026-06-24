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

  // Summary stats
  const presentCount = students.filter((s) => s.present_status_current_date === "Present").length;
  const absentCount = students.filter((s) => s.present_status_current_date === "Absent").length;
  const unmarkedCount = students.length - presentCount - absentCount;

  async function handleSave() {
    const result = await saveSession();
    if (result.success) {
      toast.success("Attendance saved!", {
        description: `${pendingCount} student(s) updated successfully.`,
      });
    } else {
      toast.error("Failed to save attendance", {
        description: result.error || "Please try again.",
      });
    }
  }

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
            <p className="text-xs text-text-muted mt-0.5">
              {students.length} student{students.length !== 1 ? "s" : ""} •{" "}
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
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
