import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function seedDefaultUsers() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@cafemilano.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const waiterEmail = process.env.WAITER_EMAIL || "waiter@cafemilano.com";
      const waiterPassword = process.env.WAITER_PASSWORD || "waiter123";

      const hashedAdminPassword = await bcryptjs.hash(adminPassword, 10);
      const hashedWaiterPassword = await bcryptjs.hash(waiterPassword, 10);

      await User.create([
        {
          name: "Admin User",
          email: adminEmail.toLowerCase().trim(),
          password: hashedAdminPassword,
          role: "admin",
        },
        {
          name: "Waiter User",
          email: waiterEmail.toLowerCase().trim(),
          password: hashedWaiterPassword,
          role: "waiter",
        },
      ]);
      console.log("Database seeded with default Admin and Waiter users.");
    }
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("Users already seeded (duplicate key error handled).");
    } else {
      console.error("Error seeding default users:", error);
    }
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    await seedDefaultUsers();

    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (user.role !== role) {
      return NextResponse.json({ error: "Role mismatch." }, { status: 401 });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      role: user.role,
      name: user.name,
      email: user.email,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
