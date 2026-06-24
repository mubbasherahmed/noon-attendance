"use client";

import React from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { User, Check, X, Clock } from "lucide-react";

interface StudentRowProps {
  student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
  const { getStudentStatus, setStudentStatus } = useApp();
  const currentStatus = getStudentStatus(student.roll_number);

  const toggleStatus = (status: "Present" | "Absent" | "Leave") => {
    setStudentStatus(
      student.roll_number,
      currentStatus === status ? null : status
    );
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-surface-hover/50 transition-colors">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <User size={18} className="text-accent" />
        </div>
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {student.student_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">
            Roll: {student.roll_number}
          </span>
          {student.student_status && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              student.student_status.toLowerCase().includes("active") ? "bg-emerald/10 text-emerald" :
              student.student_status.toLowerCase().includes("drop") ? "bg-rose/10 text-rose" :
              "bg-surface-light text-text-muted"
            }`}>
              {student.student_status}
            </span>
          )}
        </div>
      </div>

      {/* Attendance Toggles — Large touch targets */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Present */}
        <button
          onClick={() => toggleStatus("Present")}
          className={`attendance-toggle ${currentStatus === "Present" ? "present" : "unmarked"}`}
          aria-label="Mark present"
        >
          <Check size={16} strokeWidth={currentStatus === "Present" ? 3 : 2} />
          <span className="text-xs font-medium hidden sm:inline">P</span>
        </button>

        {/* Absent */}
        <button
          onClick={() => toggleStatus("Absent")}
          className={`attendance-toggle ${currentStatus === "Absent" ? "absent" : "unmarked"}`}
          aria-label="Mark absent"
        >
          <X size={16} strokeWidth={currentStatus === "Absent" ? 3 : 2} />
          <span className="text-xs font-medium hidden sm:inline">A</span>
        </button>

        {/* Leave */}
        <button
          onClick={() => toggleStatus("Leave")}
          className={`attendance-toggle ${currentStatus === "Leave" ? "leave" : "unmarked"}`}
          aria-label="Mark leave"
        >
          <Clock size={16} strokeWidth={currentStatus === "Leave" ? 3 : 2} />
          <span className="text-xs font-medium hidden sm:inline">L</span>
        </button>
      </div>
    </div>
  );
}
