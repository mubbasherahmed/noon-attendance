"use client";

import React from "react";
import { RoomSummary } from "@/lib/types";
import { DoorOpen, Users } from "lucide-react";
import Link from "next/link";

interface RoomCardProps {
  room: RoomSummary;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <article className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      {/* Room Header */}
      <div className="flex items-center gap-3">
        <div className="bg-secondary-container/50 p-2 rounded-lg text-on-secondary-container border border-secondary-container">
          <DoorOpen size={16} />
        </div>
        <h3 className="font-bold text-lg text-primary">
          {room.room}
        </h3>
      </div>

      {/* Student Count */}
      <div className="bg-surface-container rounded-lg p-2 flex items-center gap-2 text-sm text-blue-600 font-medium border border-outline-variant/50">
        <Users size={14} />
        <span>
          {room.student_count} student{room.student_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Actions */}
      <Link
        href={`/room/${encodeURIComponent(room.room)}`}
        className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-2 px-4 rounded-lg transition-colors mt-auto shadow-sm text-center block"
      >
        Take Attendance
      </Link>
    </article>
  );
}
