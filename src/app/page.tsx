"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import CampusSelector from "@/components/dashboard/CampusSelector";
import RoomGrid from "@/components/dashboard/RoomGrid";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import {
  DoorOpen,
  Users,
  BarChart3,
  ArrowRightLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const {
    rooms,
    selectedCampus,
    loadingRooms,
    refreshRooms,
    sheetNames,
  } = useApp();

  const { isAdmin, isUser, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAdmin && !isUser) {
      router.push("/login");
    }
  }, [loading, isAdmin, isUser, router]);

  if (loading || (!isAdmin && !isUser)) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-text-muted">Loading...</div>;
  }


  // Stats
  const totalRooms = rooms.length;
  const totalSheets = sheetNames.length;
  const assignedRooms = rooms.filter((r) => r.currentSheetName).length;

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b-[3px] border-accent bg-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full px-3 py-1 flex items-center justify-center">
                <span className="text-black font-bold text-xl tracking-tighter leading-none pb-0.5">noon</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Attendance
                </h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Management System
                </p>
              </div>
            </div>

            {/* Campus Selector + Actions */}
            <div className="flex items-center gap-3">
              <CampusSelector />
              {isAdmin && (
                <Link href="/enrollment" className="btn-secondary hidden sm:flex border-accent/50 text-accent hover:bg-accent/10">
                  <Sparkles size={16} />
                  Manage Enrollments
                </Link>
              )}
              <button onClick={logout} className="btn-secondary hidden sm:flex text-rose hover:bg-rose/10 border-rose/20">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <DoorOpen size={16} className="text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{totalRooms}</p>
            <p className="text-xs text-text-muted mt-0.5">Total Rooms</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald/15 flex items-center justify-center">
                <BarChart3 size={16} className="text-emerald" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {assignedRooms}
              <span className="text-sm font-normal text-text-muted">
                /{totalRooms}
              </span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">Assigned Rooms</p>
          </div>

          <div className="stat-card col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan/15 flex items-center justify-center">
                <Users size={16} className="text-cyan" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{totalSheets}</p>
            <p className="text-xs text-text-muted mt-0.5">Active Sheets</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Rooms
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {selectedCampus
                ? `Showing rooms for ${selectedCampus}`
                : "Select a campus to view rooms"}
            </p>
          </div>
          <div className="flex items-center gap-2">

            <button
              onClick={refreshRooms}
              disabled={loadingRooms}
              className="btn-icon"
              title="Refresh rooms"
            >
              <RefreshCw
                size={16}
                className={loadingRooms ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <RoomGrid />

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs text-text-muted">
            Noon Attendance Management • Powered by Google Sheets
          </p>
        </footer>
      </main>


    </div>
  );
}
