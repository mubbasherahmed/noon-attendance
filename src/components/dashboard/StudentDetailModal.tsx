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
    guardian_name: student.guardian_name || "",
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

  const dailyRetention = [
    { label: "D-6", value: student.present_status_day_minus_6 },
    { label: "D-5", value: student.present_status_day_minus_5 },
    { label: "D-4", value: student.present_status_day_minus_4 },
    { label: "D-3", value: student.present_status_day_minus_3 },
    { label: "D-2", value: student.present_status_day_minus_2 },
    { label: "D-1", value: student.present_status_day_minus_1 },
    { label: "Today", value: student.present_status_current_date },
  ];

  const weeklyRetention = [
    { label: "W-4", value: student.present_status_week_minus_4 },
    { label: "W-3", value: student.present_status_week_minus_3 },
    { label: "W-2", value: student.present_status_week_minus_2 },
    { label: "W-1", value: student.present_status_week_minus_1 },
    { label: "This Week", value: student.present_status_current_week },
  ];

  const monthlyRetention = [
    { label: "M-2", value: student.present_status_month_minus_2 },
    { label: "M-1", value: student.present_status_month_minus_1 },
    { label: "Current", value: student.present_status_month },
  ];

  const getRetentionColor = (val: string | null) => {
    if (!val) return "empty";
    const v = val.toLowerCase();
    if (v === "present" || v.includes("yes") || v.includes("active")) return "present";
    if (v === "absent" || v.includes("no") || v.includes("inactive")) return "absent";
    if (v === "leave") return "leave";
    return "empty";
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
            {student.pic ? (
              <img
                src={student.pic}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
                <User size={20} className="text-accent" />
              </div>
            )}
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
                { key: "guardian_name", label: "Guardian Name" },
                { key: "gender", label: "Gender" },
                { key: "shift", label: "Shift" },
                { key: "grade", label: "Grade" },
                { key: "room", label: "Room" },
                { key: "campus_name", label: "Campus" },
                { key: "online_teacher", label: "Online Teacher" },
                { key: "facilitator", label: "Facilitator" },
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
                { icon: User, label: "Guardian", value: student.guardian_name },
                { icon: Calendar, label: "Grade", value: student.grade },
                { icon: TrendingUp, label: "Shift", value: student.shift },
                { icon: User, label: "Teacher", value: student.online_teacher },
                { icon: User, label: "Facilitator", value: student.facilitator },
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

            {/* Aggregate Stats */}
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Attendance Summary
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-xl bg-emerald/5 border border-emerald/15">
                  <p className="text-xl font-bold text-emerald">{student.sessions_present}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Present</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-rose/5 border border-rose/15">
                  <p className="text-xl font-bold text-rose">{student.sessions_absent}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Absent</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber/5 border border-amber/15">
                  <p className="text-xl font-bold text-amber">{student.sessions_on_leave}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Leave</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-cyan/5 border border-cyan/15">
                  <p className="text-xl font-bold text-cyan">{student.days_attended}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Days</p>
                </div>
              </div>
            </div>

            {/* Daily Retention Heatmap */}
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Daily Retention (7 days)
              </h3>
              <div className="flex gap-2">
                {dailyRetention.map((day, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div
                      className={`w-full h-8 rounded-lg retention-dot-lg ${getRetentionColor(day.value)}`}
                      style={{
                        background:
                          getRetentionColor(day.value) === "present" ? "rgba(88, 214, 157, 0.2)" :
                          getRetentionColor(day.value) === "absent" ? "rgba(244, 63, 94, 0.2)" :
                          getRetentionColor(day.value) === "leave" ? "rgba(245, 158, 11, 0.2)" :
                          "rgba(100, 116, 139, 0.1)",
                        border: `1px solid ${
                          getRetentionColor(day.value) === "present" ? "rgba(88, 214, 157, 0.3)" :
                          getRetentionColor(day.value) === "absent" ? "rgba(244, 63, 94, 0.3)" :
                          getRetentionColor(day.value) === "leave" ? "rgba(245, 158, 11, 0.3)" :
                          "rgba(100, 116, 139, 0.15)"
                        }`,
                      }}
                    />
                    <p className="text-[9px] text-text-muted mt-1">{day.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly & Monthly */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Weekly ({student.wow_retention || "—"})
                </h3>
                <div className="flex gap-1.5">
                  {weeklyRetention.map((week, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div
                        className="w-full h-6 rounded"
                        style={{
                          background:
                            getRetentionColor(week.value) === "present" ? "rgba(88, 214, 157, 0.25)" :
                            getRetentionColor(week.value) === "absent" ? "rgba(244, 63, 94, 0.25)" :
                            "rgba(100, 116, 139, 0.1)",
                        }}
                      />
                      <p className="text-[8px] text-text-muted mt-0.5">{week.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Monthly ({student.mom_retention || "—"})
                </h3>
                <div className="flex gap-1.5">
                  {monthlyRetention.map((month, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div
                        className="w-full h-6 rounded"
                        style={{
                          background:
                            getRetentionColor(month.value) === "present" ? "rgba(88, 214, 157, 0.25)" :
                            getRetentionColor(month.value) === "absent" ? "rgba(244, 63, 94, 0.25)" :
                            "rgba(100, 116, 139, 0.1)",
                        }}
                      />
                      <p className="text-[8px] text-text-muted mt-0.5">{month.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "First Attended", value: student.first_attended },
                { label: "Last Attended", value: student.last_attended },
                { label: "Absent Since", value: student.absent_since },
                { label: "Status (30D)", value: student.status_30d },
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-surface-light/30">
                  <p className="text-[9px] uppercase tracking-wider text-text-muted">{item.label}</p>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
