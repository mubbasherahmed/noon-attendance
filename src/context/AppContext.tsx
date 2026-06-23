"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Room, Student, AttendanceUpdate, Campus } from "@/lib/types";

// =============================================
// App Context — Campus, Rooms, Students, and
// Optimistic Attendance State
// =============================================

interface PendingChange {
  rollNumber: string;
  status: "Present" | "Absent" | null;
}

interface AppContextType {
  // Campus
  campuses: Campus[];
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  loadingCampuses: boolean;

  // Rooms
  rooms: Room[];
  sheetNames: string[];
  loadingRooms: boolean;
  refreshRooms: () => Promise<void>;

  // Students
  students: Student[];
  loadingStudents: boolean;
  refreshStudents: (sheetFilter?: string) => Promise<void>;

  // Attendance (optimistic)
  pendingChanges: Map<string, PendingChange>;
  getStudentStatus: (rollNumber: string) => "Present" | "Absent" | null;
  setStudentStatus: (rollNumber: string, status: "Present" | "Absent" | null) => void;
  hasPendingChanges: boolean;
  pendingCount: number;
  saveSession: () => Promise<{ success: boolean; error?: string }>;
  savingSession: boolean;
  resetPending: () => void;

  // CRUD
  addStudent: (student: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  updateStudent: (student: Student) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (rowIndex: number) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Campus State ──
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("");
  const [loadingCampuses, setLoadingCampuses] = useState(true);

  // ── Rooms State ──
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // ── Students State ──
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [currentSheetFilter, setCurrentSheetFilter] = useState<string | undefined>();

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
        if (data.campuses && data.campuses.length > 0) {
          setCampuses(data.campuses);
          setSelectedCampus(data.campuses[0].campusName);
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
      setSheetNames(data.sheetNames || []);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [selectedCampus]);

  useEffect(() => {
    if (selectedCampus) {
      refreshRooms();
    }
  }, [selectedCampus, refreshRooms]);

  // ── Fetch Students ──
  const refreshStudents = useCallback(
    async (sheetFilter?: string) => {
      if (!selectedCampus) return;
      setCurrentSheetFilter(sheetFilter);
      try {
        setLoadingStudents(true);
        const today = new Date().toISOString().split('T')[0];
        let url = `/api/students?campus=${encodeURIComponent(selectedCampus)}&date=${today}`;
        if (sheetFilter) {
          url += `&sheet=${encodeURIComponent(sheetFilter)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setStudents(data.students || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoadingStudents(false);
      }
    },
    [selectedCampus]
  );

  // ── Optimistic Status Helpers ──
  const getStudentStatus = useCallback(
    (rollNumber: string): "Present" | "Absent" | null => {
      const pending = pendingChanges.get(rollNumber);
      if (pending) return pending.status;
      const student = students.find((s) => s.rollNumber === rollNumber);
      return student?.todayStatus || null;
    },
    [pendingChanges, students]
  );

  const setStudentStatus = useCallback(
    (rollNumber: string, status: "Present" | "Absent" | null) => {
      setPendingChanges((prev) => {
        const next = new Map(prev);
        const student = students.find((s) => s.rollNumber === rollNumber);
        
        if (student?.todayStatus === status) {
          next.delete(rollNumber);
        } else {
          next.set(rollNumber, { rollNumber, status });
        }
        return next;
      });
    },
    [students]
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

    const updates: AttendanceUpdate[] = Array.from(pendingChanges.values());

    try {
      setSavingSession(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, date: today }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Failed to save" };
      }

      // Clear pending changes and refresh students
      setPendingChanges(new Map());
      await refreshStudents(currentSheetFilter);

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    } finally {
      setSavingSession(false);
    }
  }, [pendingChanges, refreshStudents, currentSheetFilter]);

  // ── CRUD Operations ──
  const addStudent = useCallback(async (student: Partial<Student>) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await res.json();
      if (res.ok) await refreshStudents(currentSheetFilter);
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshStudents, currentSheetFilter]);

  const updateStudent = useCallback(async (student: Student) => {
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await res.json();
      if (res.ok) await refreshStudents(currentSheetFilter);
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshStudents, currentSheetFilter]);

  const deleteStudent = useCallback(async (rowIndex: number) => {
    try {
      const res = await fetch(`/api/students?rowIndex=${rowIndex}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) await refreshStudents(currentSheetFilter);
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshStudents, currentSheetFilter]);

  return (
    <AppContext.Provider
      value={{
        campuses,
        selectedCampus,
        setSelectedCampus,
        loadingCampuses,
        rooms,
        sheetNames,
        loadingRooms,
        refreshRooms,
        students,
        loadingStudents,
        refreshStudents,
        pendingChanges,
        getStudentStatus,
        setStudentStatus,
        hasPendingChanges,
        pendingCount,
        saveSession,
        savingSession,
        resetPending,
        addStudent,
        updateStudent,
        deleteStudent,
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
