import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const { status } = await request.json();

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const updatedWaiter = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedWaiter) {
      return NextResponse.json({ error: "Waiter not found." }, { status: 404 });
    }

    return NextResponse.json(updatedWaiter);
  } catch (error: any) {
    console.error("Toggle waiter status API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
