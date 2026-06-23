"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Student } from "@/lib/types";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Partial<Student> | Student) => Promise<{ success: boolean; error?: string }>;
  initialData?: Student;
  defaultCampus?: string;
  defaultSheet?: string;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCampus = "",
  defaultSheet = "",
}: StudentFormModalProps) {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [sheetName, setSheetName] = useState(defaultSheet);
  const [campusName, setCampusName] = useState(defaultCampus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setStudentId(initialData.studentId);
      setStudentName(initialData.studentName);
      setRollNumber(initialData.rollNumber);
      setSheetName(initialData.sheetName);
      setCampusName(initialData.campusName);
    } else {
      setStudentId("");
      setStudentName("");
      setRollNumber("");
      setSheetName(defaultSheet);
      setCampusName(defaultCampus);
    }
  }, [initialData, defaultCampus, defaultSheet, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      studentId,
      studentName,
      rollNumber,
      sheetName,
      campusName,
      ...(initialData ? { rowIndex: initialData.rowIndex } : {}),
    };

    const result = await onSubmit(data as any);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to save student");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Student" : "Add Student"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Student ID</label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Roll Number</label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Student Name</label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Sheet Name</label>
            <input
              type="text"
              required
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Campus Name</label>
            <input
              type="text"
              required
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Saving..." : "Save Student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
