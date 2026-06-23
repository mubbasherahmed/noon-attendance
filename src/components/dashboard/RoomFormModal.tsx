"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Room } from "@/lib/types";

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (room: Partial<Room> | Room) => Promise<{ success: boolean; error?: string }>;
  initialData?: Room;
  defaultCampus?: string;
}

export function RoomFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultCampus = "",
}: RoomFormModalProps) {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [currentSheetName, setCurrentSheetName] = useState("");
  const [campusName, setCampusName] = useState(defaultCampus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setRoomId(initialData.roomId);
      setRoomName(initialData.roomName);
      setCurrentSheetName(initialData.currentSheetName);
      setCampusName(initialData.campusName);
    } else {
      setRoomId("");
      setRoomName("");
      setCurrentSheetName("");
      setCampusName(defaultCampus);
    }
  }, [initialData, defaultCampus, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      roomId,
      roomName,
      currentSheetName,
      campusName,
      ...(initialData ? { rowIndex: initialData.rowIndex } : {}),
    };

    const result = await onSubmit(data as any);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to save room");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Room" : "Add Room"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Room ID</label>
          <input
            type="text"
            required
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. WXYC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Room Name / Number</label>
          <input
            type="text"
            required
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Assigned Sheet Name (Optional)</label>
          <input
            type="text"
            value={currentSheetName}
            onChange={(e) => setCurrentSheetName(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. SheetA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Campus Name</label>
          <input
            type="text"
            required
            value={campusName}
            onChange={(e) => setCampusName(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-medium"
          >
            {loading ? "Saving..." : "Save Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
