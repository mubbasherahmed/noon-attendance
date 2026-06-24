// GET /api/campuses — Derive distinct campus names from master_attendance
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerClient();

    // Group by campus_name to get counts
    const { data, error } = await supabase
      .from("enrollments")
      .select("campus_name");

    if (error) throw error;

    // Aggregate in JS since Supabase doesn't support GROUP BY directly via select
    const campusMap = new Map<string, number>();
    (data || []).forEach((row) => {
      const name = row.campus_name;
      if (name) {
        campusMap.set(name, (campusMap.get(name) || 0) + 1);
      }
    });

    const campuses = Array.from(campusMap.entries())
      .map(([campus_name, student_count]) => ({ campus_name, student_count }))
      .sort((a, b) => a.campus_name.localeCompare(b.campus_name));

    return NextResponse.json({ campuses });
  } catch (error) {
    console.error("Failed to fetch campuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch campuses", details: String(error) },
      { status: 500 }
    );
  }
}
