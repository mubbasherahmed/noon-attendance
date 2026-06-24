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
    <div className="glass-card p-5 flex flex-col gap-4 animate-fade-in">
      {/* Room Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <DoorOpen size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              {room.room}
            </h3>
          </div>
        </div>
      </div>

      {/* Student Count */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan/10 border border-cyan/20">
        <Users size={14} className="text-cyan" />
        <span className="text-xs font-medium text-cyan">
          {room.student_count} student{room.student_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/room/${encodeURIComponent(room.room)}`}
          className="btn-primary flex-1 text-center text-sm no-underline"
        >
          Take Attendance
        </Link>
      </div>
    </div>
  );
}
