import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret (Security)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    // 2. Fetch all records to process the shift
    // Note: Since Supabase SDK doesn't natively support "column = other_column" in standard updates,
    // we need to fetch the current values and update them manually.
    // To handle large tables, we'd normally use an RPC (Postgres Function), but we can do it in batches here.
    
    // For optimal performance, let's use an RPC call if it exists, or fallback to an RPC-style query
    // Actually, creating a Postgres function is much safer for atomic shifting. Let's do it via RPC.
    
    // Instead of doing it in JS, we can just execute a raw SQL command via Supabase if possible,
    // but the `supabase-js` library doesn't support raw SQL natively without a Postgres function.
    // To bypass creating a Postgres function right now, we will fetch and batch update,
    // but since this is a test environment, we'll fetch all.
    
    const { data: students, error: fetchError } = await supabase
      .from("master_attendance")
      .select("id, present_status_day_minus_5, present_status_day_minus_4, present_status_day_minus_3, present_status_day_minus_2, present_status_day_minus_1, present_status_current_date");

    if (fetchError) throw fetchError;

    if (!students || students.length === 0) {
      return NextResponse.json({ success: true, message: "No students to update." });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Batch update (process 50 at a time)
    const BATCH_SIZE = 50;
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      
      const updatePromises = batch.map((student) => {
        return supabase
          .from("master_attendance")
          .update({
            present_status_day_minus_6: student.present_status_day_minus_5,
            present_status_day_minus_5: student.present_status_day_minus_4,
            present_status_day_minus_4: student.present_status_day_minus_3,
            present_status_day_minus_3: student.present_status_day_minus_2,
            present_status_day_minus_2: student.present_status_day_minus_1,
            present_status_day_minus_1: student.present_status_current_date,
            present_status_current_date: null,
          })
          .eq("id", student.id);
      });

      const results = await Promise.all(updatePromises);
      
      results.forEach((result) => {
        if (result.error) {
          errors.push(result.error.message);
        } else {
          updatedCount++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Shifted daily columns for ${updatedCount} students.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
