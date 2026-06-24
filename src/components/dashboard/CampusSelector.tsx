"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Building2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CampusSelector() {
  const { campuses, selectedCampus, setSelectedCampus, loadingCampuses } =
    useApp();

  if (loadingCampuses) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant">
        <LoadingSpinner size={16} />
        <span className="text-sm text-on-surface-variant font-medium">Loading...</span>
      </div>
    );
  }

  if (campuses.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant">
        <Building2 size={16} className="text-on-surface-variant" />
        <span className="text-sm text-on-surface-variant font-medium">No campuses</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 bg-secondary-container text-on-secondary-container p-1 rounded">
        <Building2 size={12} />
      </div>
      <select
        id="campus-selector"
        value={selectedCampus}
        onChange={(e) => setSelectedCampus(e.target.value)}
        className="appearance-none flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-sm font-medium py-2 pl-10 pr-8 rounded-lg border border-outline-variant transition-colors min-w-[160px] cursor-pointer focus:outline-none focus:border-secondary"
      >
        {campuses.map((campus) => (
          <option key={campus.campus_name} value={campus.campus_name}>
            {campus.campus_name} ({campus.student_count})
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}
