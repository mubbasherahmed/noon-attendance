import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { role, password } = await request.json();

    if (role === "admin") {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (password === adminPassword) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Auth failed" }, { status: 500 });
  }
}
