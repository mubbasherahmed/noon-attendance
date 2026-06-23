"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import StudentRow from "./StudentRow";
import { SkeletonRow } from "@/components/ui/LoadingSpinner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Save, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AttendancePanelProps {
  sheetName: string;
}

export default function AttendancePanel({ sheetName }: AttendancePanelProps) {
  const {
    students,
    loadingStudents,
    refreshStudents,
    hasPendingChanges,
    pendingCount,
    saveSession,
    savingSession,
  } = useApp();


  useEffect(() => {
    refreshStudents(sheetName);
  }, [sheetName, refreshStudents]);

  async function handleSave() {
    const result = await saveSession();
    if (result.success) {
      toast.success("Attendance saved to Google Sheets!", {
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-accent" />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Student Roster
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {students.length} student{students.length !== 1 ? "s" : ""} •{" "}
              Date: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Add Student button removed - handled in Admin view */}
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
              {savingSession ? "Saving..." : "Save Session"}
            </span>
            {hasPendingChanges && !savingSession && (
              <span className="badge badge-emerald ml-1">{pendingCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasPendingChanges && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber/5 border-b border-amber/15">
          <AlertCircle size={14} className="text-amber" />
          <span className="text-xs text-amber font-medium">
            {pendingCount} unsaved change{pendingCount !== 1 ? "s" : ""}. Click
            &quot;Save Session&quot; to sync with Google Sheets.
          </span>
        </div>
      )}

      {/* Student List */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {loadingStudents ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary font-medium">
              No students found
            </p>
            <p className="text-sm text-text-muted mt-1">
              No students are assigned to sheet &quot;{sheetName}&quot;.
            </p>
          </div>
        ) : (
          students.map((student) => (
            <StudentRow key={student.rollNumber} student={student} />
          ))
        )}
      </div>

    </div>
  );
}
