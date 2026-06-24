"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CampusSelector from "@/components/dashboard/CampusSelector";
import RoomGrid from "@/components/dashboard/RoomGrid";
import StudentDetailModal from "@/components/dashboard/StudentDetailModal";
import RoomManagementModal from "@/components/dashboard/RoomManagementModal";
import { Student } from "@/lib/types";
import {
  Users,
  BarChart3,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Sparkles,
  DoorOpen,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Settings2,
  LogOut,
} from "lucide-react";
import Link from "next/link";

type SortKey = "roll_number" | "student_name" | "grade" | "room" | "age" | "student_status";
type SortDir = "asc" | "desc";
type ViewMode = "rooms" | "table";

export default function HomePage() {
  const {
    rooms,
    students,
    selectedCampus,
    loadingRooms,
    loadingStudents,
    refreshRooms,
    refreshStudents,
    campuses,
  } = useApp();

  const { isAdmin, isUser, loading, logout } = useAuth();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("rooms");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("roll_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!loading && !isAdmin && !isUser) {
      router.push("/login");
    }
  }, [loading, isAdmin, isUser, router]);

  // Fetch all students when switching to table view
  useEffect(() => {
    if (viewMode === "table" && selectedCampus) {
      refreshStudents();
    }
  }, [viewMode, selectedCampus, refreshStudents]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
        s.student_name?.toLowerCase().includes(q) ||
        s.roll_number?.toLowerCase().includes(q) ||
        s.gaurdian_name?.toLowerCase().includes(q)
    );
  }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((s) => s.student_status === "Active" || s.student_status === "Regular");
      } else if (statusFilter === "dropped") {
        result = result.filter((s) => s.student_status === "Dropped Out");
      }
    }

    result.sort((a, b) => {
      const aVal = a[sortKey as keyof Student] ?? "";
      const bVal = b[sortKey as keyof Student] ?? "";
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [students, searchQuery, statusFilter, sortKey, sortDir]);

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.student_status === "Active" || s.student_status === "Regular").length;
  const droppedStudents = students.filter((s) => s.student_status === "Dropped Out").length;
  // NOTE: Attendance rates are now calculated dynamically per date, so we leave this blank for the main dashboard 
  // or fetch them from the new API. For now, we will show active vs dropped stats.
  const attendancePct = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="opacity-30 ml-1" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-accent ml-1" />
      : <ChevronDown size={12} className="text-accent ml-1" />;
  };

  const toggleSelectStudent = (id: number) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  if (loading || (!isAdmin && !isUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status30d: string | null) => {
    if (!status30d) return <span className="badge badge-muted">—</span>;
    const s = status30d.toLowerCase();
    if (s.includes("active") || s.includes("regular")) return <span className="badge badge-status-active">{status30d}</span>;
    if (s.includes("drop") || s.includes("inactive")) return <span className="badge badge-status-dropped">{status30d}</span>;
    if (s.includes("leave")) return <span className="badge badge-status-on-leave">{status30d}</span>;
    return <span className="badge badge-muted">{status30d}</span>;
  };

  const getTodayBadge = (status: string | null) => {
    if (!status) return <span className="badge badge-muted">—</span>;
    if (status === "Present") return <span className="badge badge-emerald">Present</span>;
    if (status === "Absent") return <span className="badge badge-rose">Absent</span>;
    if (status === "Leave") return <span className="badge badge-amber">Leave</span>;
    return <span className="badge badge-muted">{status}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-deep-navy/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full px-3 py-1 flex items-center justify-center">
                <span className="text-black font-bold text-xl tracking-tighter leading-none pb-0.5">noon</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-text-primary tracking-tight">
                  Attendance
                </h1>
                <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                  Management System
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CampusSelector />
              {isAdmin && (
                <Link href="/enrollment" className="btn-secondary hidden sm:flex text-sm">
                  <Sparkles size={14} />
                  <span className="hidden lg:inline">Enroll Student</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="btn-icon text-text-muted hover:text-rose hover:border-rose/30"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="stat-card stat-card-accent">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Users size={16} className="text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{totalStudents}</p>
            <p className="text-xs text-text-muted mt-0.5">Total Students</p>
          </div>

          <div className="stat-card stat-card-emerald">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald/15 flex items-center justify-center">
                <UserCheck size={16} className="text-emerald" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{activeStudents}</p>
            <p className="text-xs text-text-muted mt-0.5">Active Students</p>
          </div>

          <div className="stat-card stat-card-rose">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose/15 flex items-center justify-center">
                <UserX size={16} className="text-rose" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{droppedStudents}</p>
            <p className="text-xs text-text-muted mt-0.5">Dropped Out</p>
          </div>

          <div className="stat-card stat-card-amber">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber/15 flex items-center justify-center">
                <BarChart3 size={16} className="text-amber" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {attendancePct}<span className="text-sm font-normal text-text-muted">%</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">Active Rate</p>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {selectedCampus || "Select a campus"}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} • {totalStudents} student{totalStudents !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("rooms")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  viewMode === "rooms"
                    ? "bg-accent/15 text-accent"
                    : "bg-surface text-text-muted hover:text-text-primary"
                }`}
              >
                <DoorOpen size={14} className="inline mr-1.5" />
                Rooms
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-accent/15 text-accent"
                    : "bg-surface text-text-muted hover:text-text-primary"
                }`}
              >
                <BarChart3 size={14} className="inline mr-1.5" />
                Data Table
              </button>
            </div>

            {isAdmin && viewMode === "table" && (
              <button
                onClick={() => setShowRoomManagement(true)}
                className="btn-secondary text-xs"
                disabled={selectedStudentIds.size === 0}
              >
                <Settings2 size={14} />
                Manage Rooms
              </button>
            )}

            <button
              onClick={() => viewMode === "rooms" ? refreshRooms() : refreshStudents()}
              disabled={loadingRooms || loadingStudents}
              className="btn-icon"
              title="Refresh"
            >
              <RefreshCw size={16} className={loadingRooms || loadingStudents ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Rooms View ── */}
        {viewMode === "rooms" && <RoomGrid />}

        {/* ── Data Table View ── */}
        {viewMode === "table" && (
          <div className="animate-fade-in">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "present", label: "Present" },
                  { key: "absent", label: "Absent" },
                  { key: "dropped", label: "Dropped" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`pill-filter ${statusFilter === f.key ? "active" : ""}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedStudentIds.size > 0 && (
              <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl bg-accent/5 border border-accent/20 animate-slide-up">
                <span className="text-sm font-medium text-accent">
                  {selectedStudentIds.size} selected
                </span>
                <button
                  onClick={() => setShowRoomManagement(true)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Move to Room
                </button>
                <button
                  onClick={() => setSelectedStudentIds(new Set())}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors ml-auto"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* Data Table */}
            {loadingStudents ? (
              <div className="data-table-wrapper">
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-text-muted">Loading students...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="data-table-wrapper p-12 text-center">
                <Users size={40} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary font-medium">No students found</p>
                <p className="text-sm text-text-muted mt-1">
                  {searchQuery ? "Try a different search term" : "No students in this campus yet"}
                </p>
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      {isAdmin && (
                        <th style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0}
                            onChange={selectAllVisible}
                            className="accent-accent"
                          />
                        </th>
                      )}
                      <th onClick={() => toggleSort("roll_number")} className={sortKey === "roll_number" ? "sorted" : ""}>
                        Roll # <SortIcon col="roll_number" />
                      </th>
                      <th onClick={() => toggleSort("student_name")} className={sortKey === "student_name" ? "sorted" : ""}>
                        Student <SortIcon col="student_name" />
                      </th>
                      <th>Guardian</th>
                      <th onClick={() => toggleSort("grade")} className={sortKey === "grade" ? "sorted" : ""}>
                        Grade <SortIcon col="grade" />
                      </th>
                      <th onClick={() => toggleSort("room")} className={sortKey === "room" ? "sorted" : ""}>
                        Room <SortIcon col="room" />
                      </th>
                      <th>Shift</th>
                      <th onClick={() => toggleSort("age" as SortKey)} className={sortKey === "age" ? "sorted" : ""}>
                        Age <SortIcon col={"age" as SortKey} />
                      </th>
                      <th>Contact Number</th>
                      <th onClick={() => toggleSort("student_status" as SortKey)} className={sortKey === "student_status" ? "sorted" : ""}>
                        Status <SortIcon col={"student_status" as SortKey} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className={`cursor-pointer ${selectedStudentIds.has(student.id) ? "selected" : ""}`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        {isAdmin && (
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.has(student.id)}
                              onChange={() => toggleSelectStudent(student.id)}
                              className="accent-accent"
                            />
                          </td>
                        )}
                        <td className="font-mono text-xs text-text-muted">{student.roll_number}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                              {student.student_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-medium text-text-primary">{student.student_name}</span>
                          </div>
                        </td>
                        <td>{student.gaurdian_name || "—"}</td>
                        <td>{student.grade || "—"}</td>
                        <td>
                          <span className="badge badge-cyan">{student.room}</span>
                        </td>
                        <td>{student.shift || "—"}</td>
                        <td>{student.age || "—"}</td>
                        <td>{student.contact_number || "—"}</td>
                        <td>{getStatusBadge(student.student_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 text-xs text-text-muted text-right">
              Showing {filteredStudents.length} of {totalStudents} students
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs text-text-muted">
            Noon Attendance Management • Powered by Supabase
          </p>
        </footer>
      </main>

      {/* ── Modals ── */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {showRoomManagement && (
        <RoomManagementModal
          selectedIds={selectedStudentIds}
          onClose={() => {
            setShowRoomManagement(false);
            setSelectedStudentIds(new Set());
          }}
        />
      )}
    </div>
  );
}
