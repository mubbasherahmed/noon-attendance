"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import AttendancePanel from "@/components/attendance/AttendancePanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  Menu,
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = decodeURIComponent(params.roomId as string);
  const {
    rooms,
    loadingRooms,
    hasPendingChanges,
    pendingCount,
    selectedCampus,
    setSelectedRoom,
    refreshStudents,
  } = useApp();

  const [confirmLeave, setConfirmLeave] = useState(false);

  const room = rooms.find((r) => r.room === roomName);

  useEffect(() => {
    if (roomName && selectedCampus) {
      setSelectedRoom(roomName);
      refreshStudents(roomName);
    }
  }, [roomName, selectedCampus, setSelectedRoom, refreshStudents]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasPendingChanges) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasPendingChanges]);

  useEffect(() => {
    return () => setSelectedRoom("");
  }, [setSelectedRoom]);

  function handleBack() {
    if (hasPendingChanges) {
      setConfirmLeave(true);
    } else {
      router.push("/");
    }
  }

  if (loadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size={40} className="text-secondary mb-4 mx-auto" />
          <p className="text-on-surface-variant font-medium">Loading room data...</p>
        </div>
      </div>
    );
  }

  if (!room && !loadingRooms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center bg-surface-container-lowest border border-outline-variant rounded-xl p-10 max-w-sm shadow-sm">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-lg font-bold text-on-surface mb-2">
            Room Not Found
          </h2>
          <p className="text-sm text-on-surface-variant mb-6 font-medium">
            Room "{roomName}" doesn't exist or is not assigned to the current campus.
          </p>
          <button onClick={() => router.push("/")} className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant px-4 py-3 flex flex-wrap items-center justify-between sticky top-0 z-50 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight text-on-surface flex items-center gap-1">
              <span className="bg-primary text-on-primary px-1.5 rounded-sm inline-block leading-none pb-0.5">n</span>
              oon
            </div>
            <div className="h-6 w-px bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="flex flex-col">
              <h1 className="text-on-surface font-bold text-lg leading-tight">{roomName}</h1>
              <div className="text-xs text-primary flex items-center gap-1 font-medium">
                <Users size={10} />
                {room?.student_count || 0} students
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center ml-auto">
          {hasPendingChanges && (
            <div className="bg-amber-100 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              {pendingCount} unsaved
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative max-w-[1440px] mx-auto w-full px-4 sm:px-6">
        <AttendancePanel roomName={roomName} />
      </main>

      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full p-4 shadow-lg border border-transparent transition-colors flex items-center justify-center">
          <Menu size={24} />
        </button>
      </div>

      {/* Confirm Leave Modal */}
      {confirmLeave && (
        <div className="modal-overlay" onClick={() => setConfirmLeave(false)}>
          <div
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  You have {pendingCount} unsaved attendance change{pendingCount !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 font-medium">
              If you leave now, your changes will be lost. Do you want to continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLeave(false)}
                className="flex-1 py-2 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors border border-outline-variant"
              >
                Stay
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-2 px-4 bg-error hover:bg-error/90 text-on-error font-semibold rounded-lg transition-colors shadow-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
