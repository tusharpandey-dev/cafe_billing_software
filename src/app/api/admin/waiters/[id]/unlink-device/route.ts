import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";

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

    const updatedWaiter = await User.findByIdAndUpdate(
      id,
      {
        deviceId: "",
        deviceName: "",
      },
      { new: true }
    );

    if (!updatedWaiter) {
      return NextResponse.json({ error: "Waiter not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, waiter: updatedWaiter });
  } catch (error: any) {
    console.error("Unlink waiter device API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
