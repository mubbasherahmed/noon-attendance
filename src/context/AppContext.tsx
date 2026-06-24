"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Student, CampusSummary, RoomSummary, AttendanceUpdate } from "@/lib/types";

// =============================================
// App Context — Supabase-backed state management
// Campus → Rooms → Students → Attendance
// =============================================

interface PendingChange {
  roll_number: string;
  status: "Present" | "Absent" | "Leave" | null;
}

interface AppContextType {
  // Campus
  campuses: CampusSummary[];
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  loadingCampuses: boolean;

  // Rooms
  rooms: RoomSummary[];
  loadingRooms: boolean;
  refreshRooms: () => Promise<void>;

  // Students
  students: Student[];
  loadingStudents: boolean;
  refreshStudents: (room?: string) => Promise<void>;
  selectedRoom: string;
  setSelectedRoom: (room: string) => void;

  // Attendance (optimistic)
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  pendingChanges: Map<string, PendingChange>;
  getStudentStatus: (rollNumber: string) => "Present" | "Absent" | "Leave" | "Late" | "No class" | null;
  setStudentStatus: (rollNumber: string, status: "Present" | "Absent" | "Leave" | "Late" | "No class" | null) => void;
  hasPendingChanges: boolean;
  pendingCount: number;
  saveSession: () => Promise<{ success: boolean; error?: string }>;
  savingSession: boolean;
  resetPending: () => void;

  // CRUD
  updateStudent: (id: number, updates: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Room management
  reassignRooms: (rollNumbers: string[], newRoom: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Campus State ──
  const [campuses, setCampuses] = useState<CampusSummary[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [loadingCampuses, setLoadingCampuses] = useState(true);

  // ── Rooms State ──
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // ── Date State ──
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    // Format: DD-MMM-YYYY
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  });

  // ── Students State ──
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  // ── Daily Attendance State ──
  const [dailyAttendance, setDailyAttendance] = useState<Map<string, string>>(new Map());

  // ── Pending Attendance Changes ──
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(
    new Map()
  );
  const [savingSession, setSavingSession] = useState(false);

  // ── Fetch Campuses ──
  useEffect(() => {
    async function fetchCampuses() {
      try {
        setLoadingCampuses(true);
        const res = await fetch("/api/campuses");
        const data = await res.json();
        if (data.campuses?.length > 0) {
          setCampuses(data.campuses);
          setSelectedCampus(data.campuses[0].campus_name);
        }
      } catch (error) {
        console.error("Failed to fetch campuses:", error);
      } finally {
        setLoadingCampuses(false);
      }
    }
    fetchCampuses();
  }, []);

  // ── Fetch Rooms when campus changes ──
  const refreshRooms = useCallback(async () => {
    if (!selectedCampus) return;
    try {
      setLoadingRooms(true);
      const res = await fetch(
        `/api/rooms?campus=${encodeURIComponent(selectedCampus)}`
      );
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [selectedCampus]);

  useEffect(() => {
    if (selectedCampus) {
      refreshRooms();
      setSelectedRoom("");
    }
  }, [selectedCampus, refreshRooms]);

  // ── Fetch Students & Daily Attendance ──
  const refreshStudents = useCallback(
    async (room?: string) => {
      if (!selectedCampus) return;
      try {
        setLoadingStudents(true);
        
        // 1. Fetch Students (Enrollments)
        let url = `/api/students?campus=${encodeURIComponent(selectedCampus)}&limit=1000`;
        const roomFilter = room || selectedRoom;
        if (roomFilter) {
          url += `&room=${encodeURIComponent(roomFilter)}`;
        }
        
        const [studentRes, attendanceRes] = await Promise.all([
          fetch(url),
          roomFilter ? fetch(`/api/attendance?campus=${encodeURIComponent(selectedCampus)}&room=${encodeURIComponent(roomFilter)}&date=${encodeURIComponent(attendanceDate)}`) : Promise.resolve(null)
        ]);

        const studentData = await studentRes.json();
        setStudents(studentData.data || []);

        // 2. Fetch Attendance for Date
        if (attendanceRes) {
          const attData = await attendanceRes.json();
          const attMap = new Map();
          if (Array.isArray(attData)) {
            attData.forEach((record: any) => {
              attMap.set(record.roll_number, record.status);
            });
          }
          setDailyAttendance(attMap);
        } else {
          setDailyAttendance(new Map());
        }

      } catch (error) {
        console.error("Failed to fetch students/attendance:", error);
      } finally {
        setLoadingStudents(false);
      }
    },
    [selectedCampus, selectedRoom, attendanceDate]
  );

  // ── Optimistic Status Helpers ──
  const getStudentStatus = useCallback(
    (rollNumber: string): "Present" | "Absent" | "Leave" | "Late" | "No class" | null => {
      const pending = pendingChanges.get(rollNumber);
      if (pending) return pending.status as any;
      const dbStatus = dailyAttendance.get(rollNumber);
      return (dbStatus as any) || null;
    },
    [pendingChanges, dailyAttendance]
  );

  const setStudentStatus = useCallback(
    (rollNumber: string, status: "Present" | "Absent" | "Leave" | "Late" | "No class" | null) => {
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const currentDbStatus = dailyAttendance.get(rollNumber) || null;

        if (currentDbStatus === status) {
          next.delete(rollNumber);
        } else {
          next.set(rollNumber, { roll_number: rollNumber, status: status as any });
        }
        return next;
      });
    },
    [dailyAttendance]
  );

  const resetPending = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  const hasPendingChanges = pendingChanges.size > 0;
  const pendingCount = pendingChanges.size;

  // ── Save Session (Batch Write) ──
  const saveSession = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (pendingChanges.size === 0) {
      return { success: true };
    }

    const updates: AttendanceUpdate[] = Array.from(pendingChanges.values()).map(
      (change) => ({
        roll_number: change.roll_number,
        status: change.status as any,
      })
    );

    try {
      setSavingSession(true);
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          campus_name: selectedCampus,
          room: selectedRoom,
          updates,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Failed to save" };
      }

      // Clear pending changes and refresh data
      setPendingChanges(new Map());
      await refreshStudents(selectedRoom);

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    } finally {
      setSavingSession(false);
    }
  }, [pendingChanges, selectedCampus, selectedRoom, attendanceDate, refreshStudents]);

  // ── CRUD Operations ──
  const updateStudent = useCallback(
    async (id: number, updates: Partial<Student>) => {
      try {
        const res = await fetch("/api/students", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });
        const data = await res.json();
        if (res.ok) {
          await refreshStudents(selectedRoom);
          await refreshRooms();
        }
        return { success: res.ok, error: data.error };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    },
    [refreshStudents, selectedRoom, refreshRooms]
  );

  const deleteStudent = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          await refreshStudents(selectedRoom);
          await refreshRooms();
        }
        return { success: res.ok, error: data.error };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    },
    [refreshStudents, selectedRoom, refreshRooms]
  );

  // ── Room Management ──
  const reassignRooms = useCallback(
    async (rollNumbers: string[], newRoom: string) => {
      try {
        const res = await fetch("/api/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campus_name: selectedCampus,
            roll_numbers: rollNumbers,
            new_room: newRoom,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          await refreshStudents(selectedRoom);
          await refreshRooms();
        }
        return { success: res.ok, error: data.error };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    },
    [selectedCampus, refreshStudents, selectedRoom, refreshRooms]
  );

  return (
    <AppContext.Provider
      value={{
        campuses,
        selectedCampus,
        setSelectedCampus,
        loadingCampuses,
        rooms,
        loadingRooms,
        refreshRooms,
        students,
        loadingStudents,
        refreshStudents,
        selectedRoom,
        setSelectedRoom,
        attendanceDate,
        setAttendanceDate,
        pendingChanges,
        getStudentStatus,
        setStudentStatus,
        hasPendingChanges,
        pendingCount,
        saveSession,
        savingSession,
        resetPending,
        updateStudent,
        deleteStudent,
        reassignRooms,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
