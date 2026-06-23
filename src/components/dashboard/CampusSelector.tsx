"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Building2, ChevronDown } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CampusSelector() {
  const { campuses, selectedCampus, setSelectedCampus, loadingCampuses } =
    useApp();

  if (loadingCampuses) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border">
        <LoadingSpinner size={18} />
        <span className="text-sm text-text-secondary">Loading campuses...</span>
      </div>
    );
  }

  if (campuses.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border">
        <Building2 size={18} className="text-text-muted" />
        <span className="text-sm text-text-secondary">No campuses found</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      <div className="absolute left-3 pointer-events-none text-accent z-10">
        <Building2 size={18} />
      </div>
      <select
        id="campus-selector"
        value={selectedCampus}
        onChange={(e) => setSelectedCampus(e.target.value)}
        className="select-glass pl-10 pr-10 py-2.5 min-w-[200px]"
      >
        {campuses.map((campus) => (
          <option key={campus} value={campus}>
            {campus}
          </option>
        ))}
      </select>
    </div>
  );
}
