// GET /api/campuses — Return unique campus names
import { NextResponse } from "next/server";
import { getCampuses } from "@/lib/google-sheets";

export async function GET() {
  try {
    const campuses = await getCampuses();
    return NextResponse.json({ campuses });
  } catch (error) {
    console.error("Failed to fetch campuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch campuses", details: String(error) },
      { status: 500 }
    );
  }
}
