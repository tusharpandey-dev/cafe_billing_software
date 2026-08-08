import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";
import bcryptjs from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const { password } = await request.json();

    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long." }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const updatedWaiter = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        mustChangePassword: true,
      },
      { new: true }
    );

    if (!updatedWaiter) {
      return NextResponse.json({ error: "Waiter not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      employeeId: updatedWaiter.employeeId,
      username: updatedWaiter.username,
      plainPassword: password, // Show temporary password immediately after reset
    });
  } catch (error: any) {
    console.error("Reset waiter password API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
