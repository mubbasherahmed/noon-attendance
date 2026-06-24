"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const FIELDS = [
  { id: "rollNumber", label: "Roll Number", required: true, placeholder: "e.g. N-001" },
  { id: "studentName", label: "Student Name", required: true, placeholder: "Full name" },
  { id: "campusName", label: "Campus Name", required: true, placeholder: "Campus" },
  { id: "roomNumber", label: "Room", required: true, placeholder: "Room name" },
  { id: "fatherName", label: "Guardian Name", required: false, placeholder: "Father / Guardian" },
  { id: "gender", label: "Gender", required: false, placeholder: "Male / Female" },
  { id: "shift", label: "Shift", required: false, placeholder: "Morning / Evening" },
  { id: "grade", label: "Grade", required: false, placeholder: "Grade level" },
  { id: "facilitator", label: "Facilitator", required: false, placeholder: "Assigned facilitator" },
];

export default function EnrollmentPage() {
  const { isAdmin, loading } = useAuth();
  const { campuses } = useApp();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Student enrolled successfully!");
        setFormData({});
        window.scrollTo(0, 0);
      } else {
        toast.error(data.error || "Failed to enroll student");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 border-b border-border bg-deep-navy/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <UserPlus size={18} className="text-accent" />
            </div>
            <h1 className="text-base font-bold text-text-primary">Enroll New Student</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-5">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    {field.label} {field.required && <span className="text-rose">*</span>}
                  </label>
                  {field.id === "campusName" && campuses.length > 0 ? (
                    <select
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="select-glass"
                    >
                      <option value="">Select campus...</option>
                      {campuses.map((c) => (
                        <option key={c.campus_name} value={c.campus_name}>
                          {c.campus_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-glass"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end sticky bottom-6 z-10">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-3"
            >
              {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
              <span className="font-semibold">
                {saving ? "Saving..." : "Enroll Student"}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
