"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({
  size = 24,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-20"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-80"
        />
      </svg>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card-static p-5">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-3 w-32 mb-4" />
      <div className="skeleton h-8 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <div className="flex-1">
        <div className="skeleton h-4 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
      <div className="skeleton h-8 w-16 rounded-lg" />
      <div className="skeleton h-12 w-12 rounded-xl" />
    </div>
  );
}
