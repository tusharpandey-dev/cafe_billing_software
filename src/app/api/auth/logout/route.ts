import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete("token");
    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 });
  }
}
