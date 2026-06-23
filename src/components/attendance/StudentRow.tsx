"use client";

import React, { useState, useCallback } from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { User, Edit2, Trash2 } from "lucide-react";
import { StudentFormModal } from "./StudentFormModal";
import { toast } from "sonner";

interface StudentRowProps {
  student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
  const { getStudentStatus, setStudentStatus, updateStudent, deleteStudent } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete student ${student.studentName}?`)) return;
    setDeleting(true);
    const res = await deleteStudent(student.rowIndex);
    if (res.success) {
      toast.success("Student deleted");
    } else {
      toast.error(res.error || "Failed to delete student");
    }
    setDeleting(false);
  }

  async function handleEditSubmit(updatedStudent: Partial<Student> | Student) {
    const res = await updateStudent(updatedStudent as Student);
    if (res.success) {
      toast.success("Student updated");
    }
    return res;
  }

  const currentStatus = getStudentStatus(student.studentId);

  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-surface-hover/30 transition-colors">
      {/* Student Info */}
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <User size={16} className="text-accent-hover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {student.studentName}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          Roll: {student.rollNumber}
        </p>
      </div>

      {/* Attendance Radio Buttons */}
      <div className="flex items-center gap-4 shrink-0 ml-auto mr-2 sm:mr-4">
        <label className="flex items-center gap-1.5 cursor-pointer group select-none">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              currentStatus === "Present"
                ? "border-emerald bg-emerald/10"
                : "border-text-muted group-hover:border-emerald/50"
            }`}
          >
            {currentStatus === "Present" && (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald" />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              currentStatus === "Present" ? "text-emerald" : "text-text-secondary group-hover:text-text-primary"
            }`}
          >
            Present
          </span>
          <input
            type="radio"
            className="hidden"
            checked={currentStatus === "Present"}
            onChange={() =>
              setStudentStatus(
                student.studentId,
                currentStatus === "Present" ? null : "Present"
              )
            }
          />
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer group select-none">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              currentStatus === "Absent"
                ? "border-rose bg-rose/10"
                : "border-text-muted group-hover:border-rose/50"
            }`}
          >
            {currentStatus === "Absent" && (
              <div className="w-2.5 h-2.5 rounded-full bg-rose" />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              currentStatus === "Absent" ? "text-rose" : "text-text-secondary group-hover:text-text-primary"
            }`}
          >
            Absent
          </span>
          <input
            type="radio"
            className="hidden"
            checked={currentStatus === "Absent"}
            onChange={() =>
              setStudentStatus(
                student.studentId,
                currentStatus === "Absent" ? null : "Absent"
              )
            }
          />
        </label>
      </div>

      {/* Edit / Delete Actions */}
      <div className="flex flex-col gap-1 ml-2 shrink-0">
        <button
          onClick={() => setEditModalOpen(true)}
          className="p-1 text-text-muted hover:text-white transition-colors rounded hover:bg-white/5"
          title="Edit Student"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1 text-text-muted hover:text-red-400 transition-colors rounded hover:bg-red-400/10"
          title="Delete Student"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <StudentFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={student}
      />
    </div>
  );
}
