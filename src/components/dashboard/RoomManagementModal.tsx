"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Settings2, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface RoomManagementModalProps {
  selectedIds: Set<number>;
  onClose: () => void;
}

export default function RoomManagementModal({
  selectedIds,
  onClose,
}: RoomManagementModalProps) {
  const { students, rooms, reassignRooms } = useApp();
  const [newRoom, setNewRoom] = useState("");
  const [customRoom, setCustomRoom] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedStudents = students.filter((s) => selectedIds.has(s.id));
  const rollNumbers = selectedStudents.map((s) => s.roll_number);

  const handleSave = async () => {
    const targetRoom = newRoom === "__custom__" ? customRoom.trim() : newRoom;
    if (!targetRoom) {
      toast.error("Please select or enter a room name");
      return;
    }

    setSaving(true);
    const result = await reassignRooms(rollNumbers, targetRoom);
    if (result.success) {
      toast.success(`${selectedStudents.length} student(s) moved to "${targetRoom}"`);
      onClose();
    } else {
      toast.error(result.error || "Failed to reassign rooms");
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Settings2 size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Room Reassignment
              </h2>
              <p className="text-xs text-text-muted">
                Moving {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Selected Students Preview */}
        <div className="mb-5 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Selected Students
          </p>
          <div className="space-y-1">
            {selectedStudents.slice(0, 10).map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-light/30 border border-border"
              >
                <span className="text-sm text-text-primary">{student.student_name}</span>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="badge badge-cyan">{student.room}</span>
                  <ArrowRight size={12} />
                  <span className="text-accent font-medium">?</span>
                </div>
              </div>
            ))}
            {selectedStudents.length > 10 && (
              <p className="text-xs text-text-muted text-center py-1">
                ...and {selectedStudents.length - 10} more
              </p>
            )}
          </div>
        </div>

        {/* Target Room Selection */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Move to Room
          </label>
          <select
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="select-glass mb-3"
          >
            <option value="">Select a room...</option>
            {rooms.map((r) => (
              <option key={r.room} value={r.room}>
                {r.room} ({r.student_count} students)
              </option>
            ))}
            <option value="__custom__">✨ Create new room...</option>
          </select>

          {newRoom === "__custom__" && (
            <input
              type="text"
              placeholder="Enter new room name..."
              value={customRoom}
              onChange={(e) => setCustomRoom(e.target.value)}
              className="input-glass"
              autoFocus
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!newRoom && !customRoom)}
            className="btn-primary flex-1"
          >
            {saving ? "Moving..." : `Move ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
