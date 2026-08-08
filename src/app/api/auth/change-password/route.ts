import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";


export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "Old password and new password (min 4 chars) are required." },
        { status: 400 }
      );
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.mustChangePassword = false;
    await user.save();

    // Re-sign token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email || "",
        username: user.username || "",
        role: user.role,
        branchId: user.branchId || "default-branch",
        restaurantId: user.restaurantId || "default-restaurant",
        mustChangePassword: false,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, message: "Password updated successfully." });
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Change password API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
