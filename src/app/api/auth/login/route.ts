import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

async function seedDefaultUsers() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@cafemilano.com").toLowerCase().trim();
    const waiterEmail = (process.env.WAITER_EMAIL || "waiter@cafemilano.com").toLowerCase().trim();
    const kitchenEmail = (process.env.KITCHEN_EMAIL || "kitchen@cafemilano.com").toLowerCase().trim();

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcryptjs.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
      await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "admin",
      });
      console.log("Seeded Admin user.");
    }

    const existingWaiter = await User.findOne({ email: waiterEmail });
    if (!existingWaiter) {
      const hashedWaiterPassword = await bcryptjs.hash(process.env.WAITER_PASSWORD || "waiter123", 10);
      await User.create({
        name: "Waiter User",
        email: waiterEmail,
        password: hashedWaiterPassword,
        role: "waiter",
      });
      console.log("Seeded Waiter user.");
    }

    const existingKitchen = await User.findOne({ email: kitchenEmail });
    if (!existingKitchen) {
      const hashedKitchenPassword = await bcryptjs.hash(process.env.KITCHEN_PASSWORD || "kitchen123", 10);
      await User.create({
        name: "Chef Mario",
        email: kitchenEmail,
        password: hashedKitchenPassword,
        role: "kitchen",
      });
      console.log("Seeded Kitchen user (Chef Mario).");
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
