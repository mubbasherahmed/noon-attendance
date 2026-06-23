// GET /api/rooms?campus=X — Fetch rooms filtered by campus
// PATCH /api/rooms — Swap the Current_Sheet_Name for a room
import { NextRequest, NextResponse } from "next/server";
import { getRooms, updateCell, getSheetNames } from "@/lib/google-sheets";
import { RoomSwapRequest } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const campus = request.nextUrl.searchParams.get("campus") || undefined;
    const rooms = await getRooms(campus);

    // Also fetch available sheet names for the campus
    const sheetNames = await getSheetNames(campus);

    return NextResponse.json({ rooms, sheetNames });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: RoomSwapRequest = await request.json();
    const { roomId, newSheetName } = body;

    if (!roomId || !newSheetName) {
      return NextResponse.json(
        { error: "roomId and newSheetName are required" },
        { status: 400 }
      );
    }

    // Find the room's row to update
    const allRooms = await getRooms();
    const room = allRooms.find((r) => r.roomId === roomId);

    if (!room) {
      return NextResponse.json(
        { error: `Room with ID "${roomId}" not found` },
        { status: 404 }
      );
    }

    // Update column C (Current_Sheet_Name) for this room's row
    const range = `Rooms!C${room.rowIndex}`;
    await updateCell(range, newSheetName);

    return NextResponse.json({
      success: true,
      message: `Room "${room.roomName}" now linked to sheet "${newSheetName}"`,
    });
  } catch (error) {
    console.error("Failed to swap room sheet:", error);
    return NextResponse.json(
      { error: "Failed to swap room sheet", details: String(error) },
      { status: 500 }
    );
  }
}
