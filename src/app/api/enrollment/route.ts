// POST /api/enrollment — Enroll a new student into master_attendance
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rollNumber,
      studentName,
      campusName,
      shift,
      grade,
      roomNumber,
      facilitator,
      gender,
      fatherName,
    } = body;

    if (!rollNumber || !studentName) {
      return NextResponse.json(
        { error: "Roll number and Student name are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("master_attendance")
      .insert({
        campus_name: campusName || "Unassigned",
        roll_number: rollNumber,
        student_name: studentName,
        room: roomNumber || "Unassigned",
        guardian_name: fatherName || null,
        gender: gender || null,
        shift: shift || null,
        grade: grade || null,
        facilitator: facilitator || null,
        sessions_present: 0,
        sessions_absent: 0,
        sessions_on_leave: 0,
        days_attended: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A student with this roll number already exists in this campus/room" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, student: data });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment record", details: String(error) },
      { status: 500 }
    );
  }
}
