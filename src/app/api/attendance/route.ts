import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const campus = searchParams.get("campus");
    const room = searchParams.get("room");

    if (!date || !campus || !room) {
      return NextResponse.json(
        { error: "date, campus, and room are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // Fetch attendance for the specific date and room
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", date)
      .eq("campus_name", campus)
      .eq("room", room);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, campus_name, room, updates } = body;

    if (!date || !campus_name || !room || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "date, campus_name, room, and an array of updates are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // First, fetch the students' enrollment data so we can duplicate it into the attendance table
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("campus_name", campus_name)
      .eq("room", room)
      .in(
        "roll_number",
        updates.map((u) => u.roll_number)
      );

    if (enrollError) throw enrollError;

    const enrollmentMap = new Map();
    enrollments.forEach((e) => enrollmentMap.set(e.roll_number, e));

    const attendanceRecords = updates.map((update: any) => {
      const student = enrollmentMap.get(update.roll_number);
      if (!student) {
        throw new Error(`Student ${update.roll_number} not found in enrollments`);
      }

      return {
        date,
        campus_name,
        roll_number: student.roll_number,
        student_name: student.student_name,
        gaurdian_name: student.gaurdian_name,
        shift: student.shift,
        grade: student.grade,
        room: student.room,
        online_teacher: student.online_teacher,
        facilitator: student.facilitator,
        status: update.status,
      };
    });

    // Upsert the attendance records (unique constraint is date, campus_name, roll_number)
    const { data, error } = await supabase
      .from("attendance")
      .upsert(attendanceRecords, { onConflict: 'date,campus_name,roll_number' })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Batch updated ${attendanceRecords.length} records for ${date}`,
      updatedCount: attendanceRecords.length,
    });
  } catch (error) {
    console.error("Attendance save failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
