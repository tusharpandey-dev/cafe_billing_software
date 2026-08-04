import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

      return NextResponse.json({
        authenticated: true,
        user: {
          role: decoded.role,
          name: decoded.name,
          email: decoded.email,
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
