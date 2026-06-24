// /api/rooms — Room queries and batch reassignment
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

// GET /api/rooms?campus=X — Get distinct rooms with student counts for a campus
export async function GET(request: NextRequest) {
  try {
    const campus = request.nextUrl.searchParams.get("campus");
    if (!campus) {
      return NextResponse.json(
        { error: "campus query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select("room")
      .eq("campus_name", campus);

    if (error) throw error;

    // Aggregate room counts
    const roomMap = new Map<string, number>();
    (data || []).forEach((row) => {
      if (row.room) {
        roomMap.set(row.room, (roomMap.get(row.room) || 0) + 1);
      }
    });

    const rooms = Array.from(roomMap.entries())
      .map(([room, student_count]) => ({ room, student_count }))
      .sort((a, b) => a.room.localeCompare(b.room));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/rooms — Batch reassign students to a new room
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campus_name, roll_numbers, new_room } = body;

    if (!campus_name || !roll_numbers?.length || !new_room) {
      return NextResponse.json(
        { error: "campus_name, roll_numbers[], and new_room are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error, count } = await supabase
      .from("enrollments")
      .update({ room: new_room })
      .eq("campus_name", campus_name)
      .in("roll_number", roll_numbers);

    if (error) throw error;

    return NextResponse.json({ success: true, updatedCount: count || roll_numbers.length });
  } catch (error) {
    console.error("Failed to reassign rooms:", error);
    return NextResponse.json(
      { error: "Failed to reassign rooms", details: String(error) },
      { status: 500 }
    );
  }
}
