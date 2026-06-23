"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import AttendancePanel from "@/components/attendance/AttendancePanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  DoorOpen,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = decodeURIComponent(params.roomId as string);
  const { rooms, loadingRooms, hasPendingChanges, pendingCount } = useApp();

  const [confirmLeave, setConfirmLeave] = useState(false);

  const room = rooms.find((r) => r.roomId === roomId);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasPendingChanges) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasPendingChanges]);

  function handleBack() {
    if (hasPendingChanges) {
      setConfirmLeave(true);
    } else {
      router.push("/");
    }
  }

  if (loadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={40} className="text-accent mb-4" />
          <p className="text-text-secondary">Loading room data...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card-static p-10 max-w-sm">
          <AlertCircle size={48} className="text-rose mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Room Not Found
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Room &quot;{roomId}&quot; doesn&apos;t exist or is not assigned to the
            current campus.
          </p>
          <Link href="/" className="btn-primary no-underline">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-midnight/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="btn-icon"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-text-primary">
                    {room.roomName}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FileSpreadsheet size={10} className="text-emerald" />
                    <span className="text-[11px] text-emerald font-medium">
                      {room.currentSheetName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {hasPendingChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber"></span>
                </span>
                <span className="text-xs font-medium text-amber">
                  {pendingCount} unsaved
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {room.currentSheetName ? (
          <AttendancePanel sheetName={room.currentSheetName} />
        ) : (
          <div className="glass-card-static p-12 text-center">
            <FileSpreadsheet
              size={48}
              className="text-text-muted mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-text-secondary mb-2">
              No Sheet Assigned
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
              This room doesn&apos;t have an attendance sheet assigned yet. Go back
              to the dashboard and use the swap button to assign one.
            </p>
            <Link href="/" className="btn-primary no-underline">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* Confirm Leave Modal */}
      {confirmLeave && (
        <div className="modal-overlay" onClick={() => setConfirmLeave(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber/15 flex items-center justify-center">
                <AlertCircle size={20} className="text-amber" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-text-muted">
                  You have {pendingCount} unsaved attendance change
                  {pendingCount !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-5">
              If you leave now, your changes will be lost. Do you want to
              continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLeave(false)}
                className="btn-secondary flex-1"
              >
                Stay
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-danger flex-1"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
