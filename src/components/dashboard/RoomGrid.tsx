"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import RoomCard from "./RoomCard";
import { SkeletonCard } from "@/components/ui/LoadingSpinner";
import { DoorOpen } from "lucide-react";
import { Room } from "@/lib/types";

export default function RoomGrid() {
  const { rooms, loadingRooms, selectedCampus } = useApp();
  const { isAdmin } = useAuth();



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
      <>
        <div className="glass-card-static p-12 text-center animate-fade-in flex flex-col items-center justify-center">
          <DoorOpen size={48} className="text-text-muted mb-4" />
          <h3 className="text-lg font-medium text-text-secondary mb-2">
            No Rooms Found
          </h3>
          <p className="text-sm text-text-muted max-w-md mb-6">
            {selectedCampus
              ? `No rooms configured for "${selectedCampus}". Add students to this campus to generate rooms.`
              : "No rooms configured yet."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.roomId} room={room} />
        ))}
      </div>
    </>
  );
}
