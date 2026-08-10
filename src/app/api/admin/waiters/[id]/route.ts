import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const { name, mobile, username, branchId, restaurantId, status } = await request.json();

    if (!name || !mobile || !username) {
      return NextResponse.json(
        { error: "Name, mobile number, and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const waiterEmail = username.toLowerCase().trim();

    if (!emailRegex.test(waiterEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required for waiter credentials." },
        { status: 400 }
      );
    }

    const cleanedMobile = mobile.trim();

    // Uniqueness checks (excluding current waiter)
    const existingUser = await User.findOne({
      $or: [
        { username: waiterEmail },
        { email: waiterEmail }
      ],
      _id: { $ne: id },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email/Username is already taken." }, { status: 400 });
    }

    const existingMobile = await User.findOne({
      mobile: cleanedMobile,
      _id: { $ne: id },
    });
    if (existingMobile) {
      return NextResponse.json({ error: "Mobile number is already registered." }, { status: 400 });
    }

    const updatedWaiter = await User.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        mobile: cleanedMobile,
        email: waiterEmail,
        username: waiterEmail,
        branchId: branchId || "default-branch",
        restaurantId: restaurantId || "default-restaurant",
        status: status || "active",
      },
      { new: true }
    );

    if (!updatedWaiter) {
      return NextResponse.json({ error: "Waiter not found." }, { status: 404 });
    }

    return NextResponse.json(updatedWaiter);
  } catch (error: any) {
    console.error("Update waiter API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const deletedWaiter = await User.findByIdAndDelete(id);

    if (!deletedWaiter) {
      return NextResponse.json({ error: "Waiter not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Waiter deleted successfully." });
  } catch (error: any) {
    console.error("Delete waiter API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
