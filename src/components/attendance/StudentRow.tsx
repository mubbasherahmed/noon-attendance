"use client";

import React from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { User } from "lucide-react";

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
    <li className="px-4 sm:px-5 py-3 hover:bg-surface-container transition-colors flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-secondary/30 bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <User size={14} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-on-surface text-sm truncate">
            {student.student_name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono truncate">
              {student.roll_number}
            </span>
            {student.student_status && (
              <span className={`text-[10px] font-medium px-1.5 rounded-full border ${
                student.student_status.toLowerCase().includes("active") ? "bg-secondary-container/20 border-secondary/20 text-secondary" :
                student.student_status.toLowerCase().includes("drop") ? "bg-error-container/20 border-error/20 text-error" :
                "bg-surface-container border-outline-variant text-on-surface-variant"
              }`}>
                {student.student_status}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => toggleStatus("Present")}
          className={`status-btn status-btn-present ${currentStatus === "Present" ? "active" : ""}`}
          aria-label="Mark present"
        >
          P
        </button>
        <button
          onClick={() => toggleStatus("Absent")}
          className={`status-btn status-btn-absent ${currentStatus === "Absent" ? "active" : ""}`}
          aria-label="Mark absent"
        >
          A
        </button>
        <button
          onClick={() => toggleStatus("Leave")}
          className={`status-btn status-btn-leave ${currentStatus === "Leave" ? "active" : ""}`}
          aria-label="Mark leave"
        >
          L
        </button>
      </div>
    </li>
  );
}
