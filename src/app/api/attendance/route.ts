// POST /api/attendance — Batch save attendance for a room session
// Receives { campus_name, room, updates: [{ roll_number, status }] }
// Updates present_status_current_date and increments session counters
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";
import { BatchSaveRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: BatchSaveRequest = await request.json();
    const { campus_name, room, updates } = body;

    if (!campus_name || !room || !updates?.length) {
      return NextResponse.json(
        { error: "campus_name, room, and updates[] are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const errors: string[] = [];
    let updatedCount = 0;

    // Process each update individually to handle session counter increments
    for (const update of updates) {
      if (!update.roll_number || !update.status) continue;

      // Build the update payload
      const updatePayload: Record<string, unknown> = {
        present_status_current_date: update.status,
      };

      // Fetch current row to determine if we need to adjust counters
      const { data: current, error: fetchError } = await supabase
        .from("master_attendance")
        .select("*")
        .eq("campus_name", campus_name)
        .eq("room", room)
        .eq("roll_number", update.roll_number)
        .single();

      if (fetchError || !current) {
        errors.push(`Student "${update.roll_number}" not found`);
        continue;
      }

      const previousStatus = current.present_status_current_date;
      const today = new Date().toISOString().split("T")[0];

      // Decrement previous status counter if changing
      if (previousStatus && previousStatus !== update.status) {
        if (previousStatus === "Present") {
          updatePayload.sessions_present = Math.max(0, (current.sessions_present || 0) - 1);
        } else if (previousStatus === "Absent") {
          updatePayload.sessions_absent = Math.max(0, (current.sessions_absent || 0) - 1);
        } else if (previousStatus === "Leave") {
          updatePayload.sessions_on_leave = Math.max(0, (current.sessions_on_leave || 0) - 1);
        }
      }

      // Increment new status counter
      if (previousStatus !== update.status) {
        if (update.status === "Present") {
          updatePayload.sessions_present = ((updatePayload.sessions_present as number) ?? current.sessions_present ?? 0) + 1;
          updatePayload.last_attended = today;
          if (!current.first_attended) {
            updatePayload.first_attended = today;
          }
        } else if (update.status === "Absent") {
          updatePayload.sessions_absent = ((updatePayload.sessions_absent as number) ?? current.sessions_absent ?? 0) + 1;
        } else if (update.status === "Leave") {
          updatePayload.sessions_on_leave = ((updatePayload.sessions_on_leave as number) ?? current.sessions_on_leave ?? 0) + 1;
        }
      }

      const { error } = await supabase
        .from("master_attendance")
        .update(updatePayload)
        .eq("campus_name", campus_name)
        .eq("room", room)
        .eq("roll_number", update.roll_number);

      if (error) {
        errors.push(`Failed to update "${update.roll_number}": ${error.message}`);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Failed to batch save attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance data", details: String(error) },
      { status: 500 }
    );
  }
}
