"use client";

import React, { useState, useCallback } from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { Plus, Minus, User } from "lucide-react";

interface StudentRowProps {
  student: Student;
}

export default function StudentRow({ student }: StudentRowProps) {
  const { getDisplayCounter, incrementCounter, decrementCounter, pendingChanges } =
    useApp();
  const [bumping, setBumping] = useState(false);

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
    </div>
  );
}
