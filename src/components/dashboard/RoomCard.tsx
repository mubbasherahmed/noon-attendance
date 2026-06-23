"use client";

import React, { useState } from "react";
import { Room } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { DoorOpen, FileSpreadsheet, ArrowRightLeft, Edit2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { RoomFormModal } from "./RoomFormModal";
import { toast } from "sonner";
import Link from "next/link";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const { sheetNames, refreshRooms, updateRoom, deleteRoom } = useApp();
  const { isAdmin } = useAuth();
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newSheet, setNewSheet] = useState(room.currentSheetName);
  const [swapping, setSwapping] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete ${room.roomName}?`)) return;
    setDeleting(true);
    const res = await deleteRoom(room.rowIndex);
    if (res.success) {
      toast.success("Room deleted");
    } else {
      toast.error(res.error || "Failed to delete room");
    }
    setDeleting(false);
  }

  async function handleEditSubmit(updatedRoom: Partial<Room> | Room) {
    const res = await updateRoom(updatedRoom as Room);
    if (res.success) {
      toast.success("Room updated");
    }
    return res;
  }

  async function handleSwap() {
    if (newSheet === room.currentSheetName) {
      toast.info("Sheet is already assigned to this room");
      setSwapModalOpen(false);
      return;
    }

    try {
      setSwapping(true);
      const res = await fetch("/api/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.roomId, newSheetName: newSheet }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to swap sheet");
        return;
      }

      toast.success(data.message || "Sheet swapped successfully");
      setSwapModalOpen(false);
      await refreshRooms();
    } catch (error) {
      toast.error("Failed to swap sheet");
    } finally {
      setSwapping(false);
    }
  }

  return (
    <>
      <div className="glass-card p-5 flex flex-col gap-4 animate-fade-in">
        {/* Room Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <DoorOpen size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                {room.roomName}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">ID: {room.roomId}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-1.5 text-text-muted hover:text-white transition-colors rounded-md hover:bg-white/5"
                title="Edit Room"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
                title="Delete Room"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Current Sheet */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald/10 border border-emerald/20">
          <FileSpreadsheet size={14} className="text-emerald" />
          <span className="text-xs font-medium text-emerald">
            {room.currentSheetName || "No sheet assigned"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/room/${encodeURIComponent(room.roomId)}`}
            className="btn-primary flex-1 text-center text-sm no-underline"
          >
            Take Attendance
          </Link>
          {isAdmin && (
            <button
              onClick={() => {
                setNewSheet(room.currentSheetName);
                setSwapModalOpen(true);
              }}
              className="btn-icon"
              title="Swap Sheet"
            >
              <ArrowRightLeft size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Swap Sheet Modal */}
      <Modal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        title="Swap Attendance Sheet"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-text-secondary mb-1">Room</p>
            <p className="text-text-primary font-medium">{room.roomName}</p>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-1">Current Sheet</p>
            <p className="text-amber font-medium">
              {room.currentSheetName || "None"}
            </p>
          </div>

          <div>
            <label
              htmlFor={`swap-sheet-${room.roomId}`}
              className="text-sm text-text-secondary mb-2 block"
            >
              New Sheet
            </label>
            <select
              id={`swap-sheet-${room.roomId}`}
              value={newSheet}
              onChange={(e) => setNewSheet(e.target.value)}
              className="select-glass"
            >
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setSwapModalOpen(false)}
              className="btn-secondary flex-1"
              disabled={swapping}
            >
              Cancel
            </button>
            <button
              onClick={handleSwap}
              className="btn-primary flex-1"
              disabled={swapping}
            >
              {swapping ? "Swapping..." : "Confirm Swap"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <RoomFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={room}
      />
    </>
  );
}
