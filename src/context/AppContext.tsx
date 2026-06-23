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
  studentId: string;
  incrementBy: number;
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
  getDisplayCounter: (studentId: string, baseCounter: number) => number;
  incrementCounter: (studentId: string) => void;
  decrementCounter: (studentId: string) => void;
  hasPendingChanges: boolean;
  pendingCount: number;
  saveSession: () => Promise<{ success: boolean; error?: string }>;
  savingSession: boolean;
  resetPending: () => void;

  // CRUD
  addRoom: (room: Partial<Room>) => Promise<{ success: boolean; error?: string }>;
  updateRoom: (room: Room) => Promise<{ success: boolean; error?: string }>;
  deleteRoom: (rowIndex: number) => Promise<{ success: boolean; error?: string }>;
  
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
        let url = `/api/students?campus=${encodeURIComponent(selectedCampus)}`;
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

  // ── Optimistic Counter Helpers ──
  const getDisplayCounter = useCallback(
    (studentId: string, baseCounter: number): number => {
      const pending = pendingChanges.get(studentId);
      return baseCounter + (pending?.incrementBy || 0);
    },
    [pendingChanges]
  );

  const incrementCounter = useCallback((studentId: string) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId);
      next.set(studentId, {
        studentId,
        incrementBy: (existing?.incrementBy || 0) + 1,
      });
      return next;
    });
  }, []);

  const decrementCounter = useCallback((studentId: string) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId);
      const newVal = (existing?.incrementBy || 0) - 1;
      if (newVal <= 0) {
        next.delete(studentId);
      } else {
        next.set(studentId, { studentId, incrementBy: newVal });
      }
      return next;
    });
  }, []);

  const resetPending = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  const hasPendingChanges = pendingChanges.size > 0;
  const pendingCount = Array.from(pendingChanges.values()).reduce(
    (sum, c) => sum + c.incrementBy,
    0
  );

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
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
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
  const addRoom = useCallback(async (room: Partial<Room>) => {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (res.ok) {
        if (!selectedCampus) {
          window.location.reload();
        } else {
          await refreshRooms();
        }
      }
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshRooms, selectedCampus]);

  const updateRoom = useCallback(async (room: Room) => {
    try {
      const res = await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (res.ok) await refreshRooms();
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshRooms]);

  const deleteRoom = useCallback(async (rowIndex: number) => {
    try {
      const res = await fetch(`/api/rooms?rowIndex=${rowIndex}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) await refreshRooms();
      return { success: res.ok, error: data.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [refreshRooms]);

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
        getDisplayCounter,
        incrementCounter,
        decrementCounter,
        hasPendingChanges,
        pendingCount,
        saveSession,
        savingSession,
        resetPending,
        addRoom,
        updateRoom,
        deleteRoom,
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
