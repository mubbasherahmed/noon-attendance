"use client";

import React, { useState, useCallback } from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { Plus, Minus, User, Edit2, Trash2 } from "lucide-react";
import { StudentFormModal } from "./StudentFormModal";
import { toast } from "sonner";

interface StudentRowProps {
  student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
  const { getDisplayCounter, incrementCounter, decrementCounter, pendingChanges, updateStudent, deleteStudent } =
    useApp();
  const [bumping, setBumping] = useState(false);
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

  const displayCounter = getDisplayCounter(
    student.studentId,
    student.attendanceCounter
  );
  const pending = pendingChanges.get(student.studentId);
  const hasPending = pending && pending.incrementBy > 0;

  const handleIncrement = useCallback(() => {
    incrementCounter(student.studentId);
    setBumping(true);
    setTimeout(() => setBumping(false), 200);
  }, [incrementCounter, student.studentId]);

  const handleDecrement = useCallback(() => {
    decrementCounter(student.studentId);
  }, [decrementCounter, student.studentId]);

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

      {/* Counter Display */}
      <div className="flex flex-col items-center shrink-0 min-w-[52px]">
        <span
          className={`text-xl font-bold tabular-nums ${
            hasPending ? "text-emerald" : "text-text-primary"
          } ${bumping ? "animate-counter-bump" : ""}`}
        >
          {displayCounter}
        </span>
        {hasPending && (
          <span className="text-[10px] font-medium text-emerald/70">
            +{pending.incrementBy}
          </span>
        )}
      </div>

      {/* Decrement Button */}
      <button
        onClick={handleDecrement}
        disabled={!hasPending}
        className="w-9 h-9 rounded-lg flex items-center justify-center border border-border bg-surface text-text-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-rose hover:text-rose hover:bg-rose/10 active:scale-95 shrink-0"
        aria-label={`Decrement attendance for ${student.studentName}`}
      >
        <Minus size={16} />
      </button>

      {/* Increment Button */}
      <button
        onClick={handleIncrement}
        className="btn-increment shrink-0"
        aria-label={`Increment attendance for ${student.studentName}`}
      >
        <Plus size={22} />
      </button>

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
