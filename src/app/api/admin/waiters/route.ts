import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";
import bcryptjs from "bcryptjs";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const waiters = await User.find({ role: "waiter" }).sort({ createdAt: -1 });
    return NextResponse.json(waiters);
  } catch (error: any) {
    console.error("Fetch waiters API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const { name, mobile, username, password, branchId, restaurantId, status } = await request.json();

    if (!name || !mobile || !username || !password) {
      return NextResponse.json(
        { error: "Name, mobile number, username, and password are required." },
        { status: 400 }
      );
    }

    // Uniqueness checks
    const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUsername) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
    }

    const existingMobile = await User.findOne({ mobile: mobile.trim() });
    if (existingMobile) {
      return NextResponse.json({ error: "Mobile number is already registered." }, { status: 400 });
    }

    // Auto-generate employeeId (e.g., WT-1001)
    const waiterCount = await User.countDocuments({ role: "waiter" });
    const nextNumber = 1000 + waiterCount + 1;
    let employeeId = `WT-${nextNumber}`;

    // Verify uniqueness of generated employeeId
    let isIdUnique = false;
    let attempts = 0;
    while (!isIdUnique && attempts < 10) {
      const existingId = await User.findOne({ employeeId });
      if (!existingId) {
        isIdUnique = true;
      } else {
        attempts++;
        employeeId = `WT-${nextNumber + attempts}`;
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newWaiter = await User.create({
      name: name.trim(),
      mobile: mobile.trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      role: "waiter",
      employeeId,
      branchId: branchId || "default-branch",
      restaurantId: restaurantId || "default-restaurant",
      status: status || "active",
      mustChangePassword: true,
    });

    // Return the response with the generated employeeId and the plain-text password for sharing
    return NextResponse.json({
      success: true,
      waiter: {
        id: newWaiter._id,
        name: newWaiter.name,
        username: newWaiter.username,
        mobile: newWaiter.mobile,
        employeeId: newWaiter.employeeId,
        role: newWaiter.role,
        status: newWaiter.status,
        branchId: newWaiter.branchId,
        restaurantId: newWaiter.restaurantId,
        mustChangePassword: newWaiter.mustChangePassword,
      },
      plainPassword: password, // only returned on creation
    });
  } catch (error: any) {
    console.error("Create waiter API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
