import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface TokenPayload {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: "admin" | "waiter" | "kitchen";
  branchId?: string;
  restaurantId?: string;
}

export async function getAuthPayload(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const payload = await getAuthPayload();
  return payload?.role === "admin";
}

export async function isWaiter(): Promise<boolean> {
  const payload = await getAuthPayload();
  return payload?.role === "waiter";
}
