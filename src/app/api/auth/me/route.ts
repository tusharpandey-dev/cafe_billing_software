import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. No token provided." }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        name: string;
        email: string;
        role: string;
      };

      await connectToDatabase();
      const user = await User.findById(decoded.id);

      if (!user) {
        return NextResponse.json({ error: "Unauthorized. User not found." }, { status: 401 });
      }

      if (user.status === "inactive") {
        return NextResponse.json({ error: "Unauthorized. Your account is inactive." }, { status: 403 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email || "",
          username: user.username || "",
          employeeId: user.employeeId || "",
          branchId: user.branchId || "default-branch",
          restaurantId: user.restaurantId || "default-restaurant",
          mustChangePassword: user.mustChangePassword || false,
        },
      });
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized. Invalid token." }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Get user details API error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
