// /api/students — CRUD operations on master_attendance
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

// GET /api/students?campus=X&room=Y&search=Z
export async function GET(request: NextRequest) {
  try {
    const campus = request.nextUrl.searchParams.get("campus") || undefined;
    const room = request.nextUrl.searchParams.get("room") || undefined;
    const search = request.nextUrl.searchParams.get("search") || undefined;

    const supabase = createServerClient();

    let query = supabase.from("master_attendance").select("*");

    if (campus) {
      query = query.eq("campus_name", campus);
    }
    if (room) {
      query = query.eq("room", room);
    }
    if (search) {
      query = query.or(
        `student_name.ilike.%${search}%,roll_number.ilike.%${search}%,guardian_name.ilike.%${search}%`
      );
    }

    query = query.order("roll_number", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ students: data || [] });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/students — Insert a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campus_name, roll_number, student_name, room } = body;

    if (!campus_name || !roll_number || !student_name || !room) {
      return NextResponse.json(
        { error: "campus_name, roll_number, student_name, and room are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("master_attendance")
      .insert({
        campus_name,
        roll_number,
        student_name,
        room,
        guardian_name: body.guardian_name || null,
        gender: body.gender || null,
        shift: body.shift || null,
        grade: body.grade || null,
        online_teacher: body.online_teacher || null,
        facilitator: body.facilitator || null,
        pic: body.pic || null,
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
    console.error("Failed to create student:", error);
    return NextResponse.json(
      { error: "Failed to create student", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/students — Update a student row (campus transfer, room change, field edits)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required for updates" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("master_attendance")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, student: data });
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json(
      { error: "Failed to update student", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/students?id=X — Delete a student by id
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("master_attendance")
      .delete()
      .eq("id", parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete student:", error);
    return NextResponse.json(
      { error: "Failed to delete student", details: String(error) },
      { status: 500 }
    );
  }
}
