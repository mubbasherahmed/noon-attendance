"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Student } from "@/lib/types";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ArrowRight, AlertTriangle, Merge, MoveRight } from "lucide-react";
import { toast } from "sonner";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  onComplete,
}: TransferModalProps) {
  const { selectedCampus, sheetNames } = useApp();

  const [sourceSheet, setSourceSheet] = useState("");
  const [targetSheet, setTargetSheet] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [willMerge, setWillMerge] = useState(false);
  const [targetStudentCounter, setTargetStudentCounter] = useState(0);

  // Fetch students when source sheet changes
  const fetchStudents = useCallback(async () => {
    if (!sourceSheet || !selectedCampus) {
      setStudents([]);
      return;
    }
    try {
      setLoadingStudents(true);
      const res = await fetch(
        `/api/students?campus=${encodeURIComponent(selectedCampus)}&sheet=${encodeURIComponent(sourceSheet)}`
      );
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [sourceSheet, selectedCampus]);

  useEffect(() => {
    fetchStudents();
    setSelectedStudentId("");
  }, [fetchStudents]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSourceSheet("");
      setTargetSheet("");
      setSelectedStudentId("");
      setConfirmOpen(false);
    }
  }, [isOpen]);

  // Check if target sheet has this student (for merge warning)
  async function checkMerge() {
    if (!selectedStudentId || !targetSheet || !selectedCampus) return;

    try {
      const res = await fetch(
        `/api/students?campus=${encodeURIComponent(selectedCampus)}&sheet=${encodeURIComponent(targetSheet)}`
      );
      const data = await res.json();
      const targetStudents: Student[] = data.students || [];
      const existing = targetStudents.find(
        (s) => s.studentId === selectedStudentId
      );
      setWillMerge(!!existing);
      setTargetStudentCounter(existing?.attendanceCounter || 0);
    } catch {
      setWillMerge(false);
    }
    setConfirmOpen(true);
  }

  async function handleTransfer() {
    const selectedStudent = students.find(
      (s) => s.studentId === selectedStudentId
    );
    if (!selectedStudent) return;

    try {
      setTransferring(true);
      const res = await fetch("/api/students/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          sourceSheet,
          targetSheet,
          campusName: selectedCampus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Transfer failed");
        return;
      }

      toast.success("Transfer Complete", {
        description: data.message,
      });

      setConfirmOpen(false);
      onComplete();
      onClose();
    } catch (error) {
      toast.error("Transfer failed", {
        description: String(error),
      });
    } finally {
      setTransferring(false);
    }
  }

  const selectedStudent = students.find(
    (s) => s.studentId === selectedStudentId
  );

  const canProceed =
    sourceSheet && targetSheet && selectedStudentId && sourceSheet !== targetSheet;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Transfer Student">
        <div className="flex flex-col gap-5">
          {/* Source Sheet */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Source Sheet
            </label>
            <select
              value={sourceSheet}
              onChange={(e) => setSourceSheet(e.target.value)}
              className="select-glass"
            >
              <option value="">Select source sheet...</option>
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Student
            </label>
            {loadingStudents ? (
              <div className="flex items-center gap-2 py-3">
                <LoadingSpinner size={16} />
                <span className="text-sm text-text-muted">
                  Loading students...
                </span>
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="select-glass"
                disabled={!sourceSheet || students.length === 0}
              >
                <option value="">
                  {students.length === 0
                    ? "No students on this sheet"
                    : "Select a student..."}
                </option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} (Roll: {s.rollNumber}) — Count:{" "}
                    {s.attendanceCounter}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Arrow */}
          {selectedStudentId && (
            <div className="flex justify-center">
              <ArrowRight size={24} className="text-accent" />
            </div>
          )}

          {/* Target Sheet */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Target Sheet
            </label>
            <select
              value={targetSheet}
              onChange={(e) => setTargetSheet(e.target.value)}
              className="select-glass"
              disabled={!selectedStudentId}
            >
              <option value="">Select target sheet...</option>
              {sheetNames
                .filter((name) => name !== sourceSheet)
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>

          {sourceSheet === targetSheet && sourceSheet && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose/10 border border-rose/20">
              <AlertTriangle size={14} className="text-rose" />
              <span className="text-xs text-rose">
                Source and target sheets must be different
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={checkMerge}
              disabled={!canProceed}
              className="btn-primary flex-1"
            >
              <MoveRight size={16} />
              Transfer
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Transfer"
      >
        <div className="flex flex-col gap-4">
          {willMerge ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber/10 border border-amber/20">
                <Merge size={16} className="text-amber" />
                <span className="text-sm text-amber font-medium">
                  Merge Required
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">
                  {selectedStudent?.studentName}
                </strong>{" "}
                already exists on &quot;{targetSheet}&quot;. Their attendance
                counters will be merged:
              </p>
              <div className="flex items-center gap-3 justify-center py-3 px-4 rounded-lg bg-surface border border-border">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Source</p>
                  <p className="text-lg font-bold text-text-primary">
                    {selectedStudent?.attendanceCounter || 0}
                  </p>
                </div>
                <span className="text-xl text-text-muted">+</span>
                <div className="text-center">
                  <p className="text-xs text-text-muted">Target</p>
                  <p className="text-lg font-bold text-text-primary">
                    {targetStudentCounter}
                  </p>
                </div>
                <span className="text-xl text-text-muted">=</span>
                <div className="text-center">
                  <p className="text-xs text-text-muted">Merged</p>
                  <p className="text-lg font-bold text-emerald">
                    {(selectedStudent?.attendanceCounter || 0) +
                      targetStudentCounter}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                The source row on &quot;{sourceSheet}&quot; will be deleted.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-secondary">
                Transfer{" "}
                <strong className="text-text-primary">
                  {selectedStudent?.studentName}
                </strong>{" "}
                from &quot;{sourceSheet}&quot; to &quot;{targetSheet}&quot;?
              </p>
              <p className="text-xs text-text-muted mt-2">
                Their attendance count of{" "}
                <strong>{selectedStudent?.attendanceCounter}</strong> will be
                preserved.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="btn-secondary flex-1"
              disabled={transferring}
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={transferring}
              className={`flex-1 ${willMerge ? "btn-danger" : "btn-primary"}`}
            >
              {transferring ? (
                <>
                  <LoadingSpinner size={16} />
                  Transferring...
                </>
              ) : willMerge ? (
                "Confirm Merge & Transfer"
              ) : (
                "Confirm Transfer"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
