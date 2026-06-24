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
  UserCheck,
  UserX,
  BarChart3,
  Search,
  RefreshCw,
  LogOut,
  UserPlus,
  LayoutGrid,
  List,
  Menu,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Settings2
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

  useEffect(() => {
    if (viewMode === "table" && selectedCampus) {
      refreshStudents();
    }
  }, [viewMode, selectedCampus, refreshStudents]);

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

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.student_status === "Active" || s.student_status === "Regular").length;
  const droppedStudents = students.filter((s) => s.student_status === "Dropped Out").length;
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
      ? <ChevronUp size={12} className="text-secondary ml-1" />
      : <ChevronDown size={12} className="text-secondary ml-1" />;
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status30d: string | null) => {
    if (!status30d) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">—</span>;
    const s = status30d.toLowerCase();
    if (s.includes("active") || s.includes("regular")) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/50 text-on-secondary-container">Active</span>;
    if (s.includes("drop") || s.includes("inactive")) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">Dropped Out</span>;
    if (s.includes("leave")) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Leave</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">{status30d}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-on-surface bg-background">
      {/* ── Top Navigation Bar ── */}
      <header className="glass-effect sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between shadow-sm gap-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-full p-1 h-10 w-10 flex items-center justify-center">
            <span className="text-on-primary font-bold text-xl leading-none">noon</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-primary">Attendance</h1>
            <p className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">Management System</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <CampusSelector />
          
          {isAdmin && (
            <Link href="/enrollment" className="hidden sm:flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-sm font-medium py-2 px-4 rounded-lg border border-outline-variant transition-colors">
              <UserPlus size={16} />
              <span>Enroll Student</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="bg-surface-container-lowest hover:bg-surface-container-low p-2 rounded-lg border border-outline-variant transition-colors text-on-surface-variant hover:text-on-surface"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow p-4 sm:p-6 space-y-8 max-w-[1440px] mx-auto w-full animate-fade-in">
        {/* ── KPI Dashboard ── */}
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between h-32 relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <Users size={64} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Users size={16} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">{totalStudents}</h2>
              <p className="text-sm text-on-surface-variant font-medium">Total Students</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between h-32 relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <UserCheck size={64} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-secondary-container/50 p-2 rounded-lg text-on-secondary-container">
                <UserCheck size={16} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">{activeStudents}</h2>
              <p className="text-sm text-on-surface-variant font-medium">Active Students</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between h-32 relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <UserX size={64} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-50 p-2 rounded-lg text-red-600">
                <UserX size={16} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">{droppedStudents}</h2>
              <p className="text-sm text-on-surface-variant font-medium">Dropped Out</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between h-32 relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <BarChart3 size={64} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                <BarChart3 size={16} />
              </div>
            </div>
            <div className="flex items-end gap-1">
              <h2 className="text-3xl font-bold text-primary">{attendancePct}</h2>
              <span className="text-xl font-semibold mb-1 text-on-surface-variant">%</span>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Active Rate</p>
          </div>
        </section>

        {/* ── Rooms Section / Data Table ── */}
        <section aria-label="Rooms Overview" className="space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">{selectedCampus || "Select a campus"}</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                {rooms.length} room{rooms.length !== 1 ? "s" : ""} • {totalStudents} student{totalStudents !== 1 ? "s" : ""}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-surface-container-lowest rounded-lg flex p-1 border border-outline-variant">
                <button
                  onClick={() => setViewMode("rooms")}
                  className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors ${
                    viewMode === "rooms"
                      ? "bg-surface-container text-secondary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <LayoutGrid size={14} /> Rooms
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1.5 transition-colors ${
                    viewMode === "table"
                      ? "bg-surface-container text-secondary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <List size={14} /> Data Table
                </button>
              </div>

              {isAdmin && viewMode === "table" && (
                <button
                  onClick={() => setShowRoomManagement(true)}
                  disabled={selectedStudentIds.size === 0}
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    selectedStudentIds.size > 0 
                      ? "bg-secondary text-on-secondary shadow-sm hover:bg-secondary/90" 
                      : "bg-surface-container-lowest text-outline border border-outline-variant cursor-not-allowed"
                  }`}
                >
                  <Settings2 size={14} /> Manage
                </button>
              )}

              <button
                onClick={() => viewMode === "rooms" ? refreshRooms() : refreshStudents()}
                disabled={loadingRooms || loadingStudents}
                className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} className={loadingRooms || loadingStudents ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* View Container */}
          {viewMode === "rooms" && <RoomGrid />}

          {viewMode === "table" && (
            <div className="animate-slide-up">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="relative flex-1 w-full max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-outline rounded-lg leading-5 bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary sm:text-sm transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "dropped", label: "Dropped" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap ${
                        statusFilter === f.key 
                          ? "bg-secondary-container/30 border-secondary text-secondary" 
                          : "bg-transparent border-outline text-on-surface-variant hover:border-outline-variant hover:text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                {loadingStudents ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-on-surface-variant">Loading students...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users size={40} className="text-outline mx-auto mb-3" />
                    <p className="text-on-surface font-bold text-lg">No students found</p>
                    <p className="text-sm font-medium text-on-surface-variant mt-1">
                      {searchQuery ? "Try a different search term" : "No students in this campus yet"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider font-semibold border-b border-outline-variant">
                        <tr>
                          {isAdmin && (
                            <th className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0}
                                onChange={selectAllVisible}
                                className="accent-secondary h-4 w-4 rounded border-outline"
                              />
                            </th>
                          )}
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("roll_number")}>
                            <div className="flex items-center">Roll # <SortIcon col="roll_number" /></div>
                          </th>
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("student_name")}>
                            <div className="flex items-center">Student <SortIcon col="student_name" /></div>
                          </th>
                          <th className="p-3 whitespace-nowrap">Guardian</th>
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("grade")}>
                            <div className="flex items-center">Grade <SortIcon col="grade" /></div>
                          </th>
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("room")}>
                            <div className="flex items-center">Room <SortIcon col="room" /></div>
                          </th>
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("age")}>
                            <div className="flex items-center">Age <SortIcon col="age" /></div>
                          </th>
                          <th className="p-3 cursor-pointer hover:text-on-surface transition-colors whitespace-nowrap" onClick={() => toggleSort("student_status")}>
                            <div className="flex items-center">Status <SortIcon col="student_status" /></div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${
                              selectedStudentIds.has(student.id) ? "bg-secondary-container/10" : ""
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            {isAdmin && (
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.has(student.id)}
                                  onChange={() => toggleSelectStudent(student.id)}
                                  className="accent-secondary h-4 w-4 rounded border-outline"
                                />
                              </td>
                            )}
                            <td className="p-3 text-on-surface-variant font-mono">{student.roll_number}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-xs font-bold text-primary group-hover:border-secondary transition-colors">
                                  {student.student_name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                                  {student.student_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-on-surface-variant">{student.gaurdian_name || "—"}</td>
                            <td className="p-3 text-on-surface-variant">{student.grade || "—"}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded bg-surface-container text-xs font-medium border border-outline-variant text-on-surface-variant">
                                {student.room}
                              </span>
                            </td>
                            <td className="p-3 text-on-surface-variant">{student.age || "—"}</td>
                            <td className="p-3">{getStatusBadge(student.student_status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-medium text-on-surface-variant text-right">
                Showing {filteredStudents.length} of {totalStudents} students
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-sm font-medium text-on-surface-variant border-t border-outline-variant mt-auto bg-surface-container-lowest">
        <p>Noon Attendance Management • Powered by Supabase</p>
      </footer>

      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full p-4 shadow-lg border border-outline-variant transition-colors flex items-center justify-center">
          <Menu size={24} />
        </button>
      </div>

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
