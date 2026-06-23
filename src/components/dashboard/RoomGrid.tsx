"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import RoomCard from "./RoomCard";
import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { DoorOpen, Plus } from "lucide-react";
import { RoomFormModal } from "./RoomFormModal";
import { toast } from "sonner";
import { Room } from "@/lib/types";

export default function RoomGrid() {
  const { rooms, loadingRooms, selectedCampus, addRoom } = useApp();
  const [addModalOpen, setAddModalOpen] = useState(false);

  async function handleAddSubmit(room: Partial<Room> | Room) {
    const res = await addRoom(room);
    if (res.success) {
      toast.success("Room added successfully");
    }
    return res;
  }

  if (loadingRooms) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="glass-card-static p-12 text-center animate-fade-in">
        <DoorOpen size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-secondary mb-2">
          No Rooms Found
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          {selectedCampus
            ? `No rooms configured for "${selectedCampus}". Add rooms to the "Rooms" tab in your Google Sheet.`
            : "Select a campus to view rooms."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.roomId} room={room} />
        ))}
        {/* Add Room Card */}
        {selectedCampus && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="glass-card flex flex-col items-center justify-center p-6 min-h-[160px] border-dashed hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <Plus size={24} className="text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              Add New Room
            </span>
          </button>
        )}
      </div>

      <RoomFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        defaultCampus={selectedCampus}
      />
    </>
  );
}
