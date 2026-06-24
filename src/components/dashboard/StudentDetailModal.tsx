"use client";

import React, { useState } from "react";
import { Student } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  MapPin,
  Calendar,
  TrendingUp,
  Edit3,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export default function StudentDetailModal({
  student,
  onClose,
}: StudentDetailModalProps) {
  const { updateStudent, deleteStudent, rooms } = useApp();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    student_name: student.student_name,
    gaurdian_name: student.gaurdian_name || "",
    gender: student.gender || "",
    shift: student.shift || "",
    grade: student.grade || "",
    room: student.room,
    campus_name: student.campus_name,
    online_teacher: student.online_teacher || "",
    facilitator: student.facilitator || "",
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await updateStudent(student.id, formData);
    if (result.success) {
      toast.success("Student updated successfully");
      setEditing(false);
      onClose();
    } else {
      toast.error(result.error || "Failed to update");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;
    const result = await deleteStudent(student.id);
    if (result.success) {
      toast.success("Student deleted");
      onClose();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content !max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
              <User size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {student.student_name}
              </h2>
              <p className="text-xs text-text-muted">
                Roll: {student.roll_number} • {student.campus_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !editing && (
              <button onClick={() => setEditing(true)} className="btn-icon">
                <Edit3 size={16} />
              </button>
            )}
            <button onClick={onClose} className="btn-icon">
              <X size={18} />
            </button>
          </div>
        </div>

        {editing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "student_name", label: "Student Name" },
                { key: "gaurdian_name", label: "Guardian Name" },
                { key: "gender", label: "Gender" },
                { key: "age", label: "Age" },
                { key: "contact_number", label: "Contact Number" },
                { key: "shift", label: "Shift" },
                { key: "grade", label: "Grade" },
                { key: "room", label: "Room" },
                { key: "campus_name", label: "Campus" },
                { key: "online_teacher", label: "Online Teacher" },
                { key: "facilitator", label: "Facilitator" },
                { key: "student_status", label: "Status (Active/Drop)" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(formData as Record<string, string>)[field.key] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    className="input-glass text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              {isAdmin && (
                <button onClick={handleDelete} className="btn-danger">
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: MapPin, label: "Room", value: student.room },
                { icon: User, label: "Guardian", value: student.gaurdian_name },
                { icon: Calendar, label: "Grade", value: student.grade },
                { icon: TrendingUp, label: "Shift", value: student.shift },
                { icon: User, label: "Teacher", value: student.online_teacher },
                { icon: User, label: "Facilitator", value: student.facilitator },
                { icon: User, label: "Age", value: student.age },
                { icon: User, label: "Contact", value: student.contact_number },
                { icon: User, label: "Status", value: student.student_status },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-light/50 border border-border">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Note to admin regarding heatmaps */}
            {isAdmin && (
               <div className="p-4 rounded-xl bg-emerald/5 border border-emerald/15 text-center mt-6">
                 <p className="text-sm text-emerald">Detailed Attendance Heatmaps and analytics will be available in the dedicated Admin Dashboard.</p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
