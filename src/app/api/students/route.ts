import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campus = searchParams.get("campus");
    const room = searchParams.get("room");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const supabase = createServerClient();

    let query = supabase.from("enrollments").select("*", { count: "exact" });

    if (campus) {
      query = query.eq("campus_name", campus);
    }
    if (room) {
      query = query.eq("room", room);
    }
    if (search) {
      query = query.or(
        `student_name.ilike.%${search}%,roll_number.ilike.%${search}%`
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order("roll_number", { ascending: true });

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campus_name, roll_number, student_name, room } = body;

    if (!campus_name || !roll_number || !student_name || !room) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        campus_name,
        roll_number,
        student_name,
        room,
        gaurdian_name: body.gaurdian_name || null,
        gender: body.gender || null,
        shift: body.shift || null,
        grade: body.grade || null,
        online_teacher: body.online_teacher || null,
        facilitator: body.facilitator || null,
        student_status: body.student_status || "Active",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Roll number ${roll_number} already exists in ${campus_name}` },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, campus_name, roll_number, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required for update" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("enrollments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Roll number ${roll_number} is already taken in ${campus_name}` },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required for deletion" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
