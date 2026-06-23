"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const GROUPS = [
  {
    title: "Basic Info",
    fields: [
      { id: "rollNumber", label: "Roll Number *", required: true },
      { id: "studentName", label: "Student Name *", required: true },
      { id: "campusName", label: "Campus Name" },
      { id: "enrollmentDate", label: "Enrollment Date", type: "date" },
      { id: "shift", label: "Shift" },
      { id: "grade", label: "Grade" },
      { id: "roomNumber", label: "Room #" },
      { id: "facilitator", label: "Facilitator" },
    ],
  },
  {
    title: "Demographics",
    fields: [
      { id: "claimedAge", label: "Claimed Age", type: "number" },
      { id: "gender", label: "Gender" },
      { id: "isOrphan", label: "Is the child orphan?" },
      { id: "deceasedParents", label: "If orphan, which parent(s) are deceased?" },
      { id: "religion", label: "Religion" },
      { id: "nationality", label: "Nationality" },
    ],
  },
  {
    title: "Medical & Background",
    fields: [
      { id: "medicalConditionCategory", label: "Medical Condition Category" },
      { id: "specifyMedicalCondition", label: "Specify Medical Condition" },
      { id: "doesStudentWork", label: "Does the student work?" },
      { id: "studentWorkDetails", label: "What does the student work" },
      { id: "careerGoals", label: "Career Goals" },
      { id: "hobbies", label: "Hobbies" },
    ],
  },
  {
    title: "OOSC & Previous Schooling",
    fields: [
      { id: "ooscClassification", label: "OOSC Classification" },
      { id: "lastSchoolAttended", label: "Name of last school attended?" },
      { id: "lastGradeCompleted", label: "Last grade completed" },
      { id: "reasonForOos", label: "Reason for OOS" },
    ],
  },
  {
    title: "Father / Guardian",
    fields: [
      { id: "fatherName", label: "Father's/Guardian's Name" },
      { id: "relationship", label: "Relationship" },
      { id: "fatherEducation", label: "Education" },
      { id: "fatherProfession", label: "Profession" },
      { id: "fatherIncome", label: "Income", type: "number" },
      { id: "fatherCnic", label: "CNIC" },
      { id: "fatherCnicCheck", label: "CNIC Check" },
    ],
  },
  {
    title: "Mother",
    fields: [
      { id: "motherName", label: "Mother's Name" },
      { id: "motherEducation", label: "Education" },
      { id: "motherProfession", label: "Profession" },
      { id: "motherIncome", label: "Income", type: "number" },
      { id: "motherCnic", label: "CNIC" },
      { id: "motherCnicCheck", label: "CNIC Check" },
    ],
  },
  {
    title: "Contact & Location",
    fields: [
      { id: "numberOfSiblings", label: "Number of Siblings", type: "number" },
      { id: "parentContactNumber", label: "Parent's Contact Number" },
      { id: "parentContactNumberCheck", label: "Parent's Contact Number Check" },
      { id: "homeAddress", label: "Home Address" },
      { id: "distanceToLearningCentre", label: "Distance to learning centre" },
      { id: "emergencyContactName", label: "Emergency Contact Name" },
      { id: "emergencyContactNumber", label: "Emergency Contact Number" },
    ],
  },
  {
    title: "Documents",
    fields: [
      { id: "highestLevelDocument", label: "Highest-level document parents possess?" },
      { id: "documentSubmitted", label: "Which document has been submitted?" },
      { id: "bFormNumber", label: "Student's B.Form Number" },
      { id: "bFormNumberCheck", label: "B.Form Number Check" },
      { id: "dobOnBForm", label: "DOB on B.Form", type: "date" },
      { id: "currentAgeBForm", label: "Current age based on B.Form" },
      { id: "studentPictureUploaded", label: "Student picture uploaded?" },
      { id: "bFormUploaded", label: "B.Form uploaded?" },
    ],
  },
  {
    title: "Provided Materials",
    fields: [
      { id: "providedUniform", label: "Provided Uniform" },
      { id: "providedBooks", label: "Provided Books" },
      { id: "providedWorkbooks", label: "Provided Workbooks" },
    ],
  },
  {
    title: "System Data",
    fields: [
      { id: "studentProfileSorted", label: "Student profile sorted?" },
      { id: "studentStatus30Days", label: "Student status (30 days)" },
      { id: "enrollmentMonth", label: "Enrollment Month" },
      { id: "monthsSinceEnrollment", label: "Months since enrollment", type: "number" },
      { id: "enrollmentWeek", label: "Enrollment Week" },
      { id: "firstAttended", label: "First Attended", type: "date" },
      { id: "lastAttended", label: "Last Attended", type: "date" },
    ],
  },
];

export default function EnrollmentPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Initialize all fields as empty strings
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
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
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 border-b-[3px] border-accent bg-[#1e1e1e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-white">Enroll New Student</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {GROUPS.map((group, i) => (
            <div key={i} className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4 sticky bottom-6 z-10 bg-background/80 backdrop-blur p-4 rounded-2xl border border-border">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-3"
            >
              {saving ? <LoadingSpinner size={16} /> : <Save size={16} />}
              <span className="ml-2 font-semibold">
                {saving ? "Saving..." : "Save Enrollment Data"}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
