"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import StudentRow from "./StudentRow";
import { SkeletonRow } from "@/components/ui/LoadingSpinner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Users, AlertCircle, Search, UserCheck, UserX, Clock, Calendar, ShieldCheck } from "lucide-react";
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

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!val) return;
    const [year, month, day] = val.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayStr = String(d.getDate()).padStart(2, '0');
    const monthStr = d.toLocaleString('en-GB', { month: 'short' });
    const formattedDate = `${dayStr}-${monthStr}-${year}`;
    setAttendanceDate(formattedDate);
  }

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
    <section className="max-w-4xl w-full mx-auto bg-surface-container-lowest rounded-xl border border-outline-variant mt-6 flex flex-col h-[calc(100vh-100px)] shadow-sm animate-slide-up overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-outline-variant flex flex-col gap-4 bg-surface-container-lowest">
        {/* Header Top Row: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Users className="text-on-surface-variant" size={20} />
              Student Roster
            </h2>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1.5 font-medium">
              <span>{students.length} Students</span>
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <input
                  type="date"
                  value={isoDate}
                  onChange={handleDateChange}
                  className="bg-transparent border-none text-sm text-primary font-bold focus:outline-none focus:ring-0 p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasPendingChanges || savingSession}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors ${
              hasPendingChanges && !savingSession
                ? "bg-secondary hover:bg-secondary/90 text-on-secondary"
                : "bg-surface-container-high text-on-surface-variant cursor-not-allowed border border-outline-variant"
            }`}
          >
            {savingSession ? (
              <LoadingSpinner size={16} />
            ) : (
              <ShieldCheck size={18} />
            )}
            {savingSession ? "Saving..." : "Save Attendance Session"}
            {hasPendingChanges && !savingSession && (
              <span className="bg-on-secondary text-secondary text-xs px-2 py-0.5 rounded-full ml-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Header Bottom Row: Stats & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex items-center gap-1.5 bg-secondary-container/20 px-2 py-1 rounded text-sm whitespace-nowrap border border-secondary/10">
              <UserCheck size={14} className="text-secondary" />
              <span className="font-semibold text-on-surface">{presentCount}</span> <span className="text-on-surface-variant text-xs font-medium">Present</span>
            </div>
            <div className="flex items-center gap-1.5 bg-error-container/20 px-2 py-1 rounded text-sm whitespace-nowrap border border-error/10">
              <UserX size={14} className="text-error" />
              <span className="font-semibold text-on-surface">{absentCount}</span> <span className="text-on-surface-variant text-xs font-medium">Absent</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded text-sm whitespace-nowrap border border-amber-100">
              <Clock size={14} className="text-amber-600" />
              <span className="font-semibold text-on-surface">{unmarkedCount}</span> <span className="text-on-surface-variant text-xs font-medium">Unmarked</span>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-surface border border-outline-variant rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
            />
          </div>
        </div>
      </div>

      {hasPendingChanges && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-200">
          <AlertCircle size={14} className="text-amber-600" />
          <span className="text-xs text-amber-800 font-bold">
            {pendingCount} unsaved change{pendingCount !== 1 ? "s" : ""}. Click
            "Save Attendance Session" to sync.
          </span>
        </div>
      )}

      {/* Student List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-lowest">
        <ul className="divide-y divide-outline-variant">
          {loadingStudents ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="text-outline mx-auto mb-3" />
              <p className="text-on-surface font-bold text-lg">
                {searchQuery ? "No matching students" : "No students found"}
              </p>
              <p className="text-sm font-medium text-on-surface-variant mt-1">
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
        </ul>
      </div>
    </section>
  );
}
