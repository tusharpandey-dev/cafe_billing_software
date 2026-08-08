import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access protected paths
  if (pathname.startsWith("/admin") || pathname.startsWith("/waiter") || pathname.startsWith("/kitchen")) {
    if (pathname === "/waiter/setup") {
      if (token) {
        const payload = parseJwt(token);
        if (payload && payload.role === "waiter") {
          return NextResponse.redirect(new URL("/waiter", request.url));
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = parseJwt(token);
    if (!payload) {
      // Clear invalid token cookie and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    // Role-based authorization check
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/waiter")) {
      if (payload.role !== "waiter") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (payload.mustChangePassword && pathname !== "/waiter/change-password") {
        return NextResponse.redirect(new URL("/waiter/change-password", request.url));
      }
      if (!payload.mustChangePassword && pathname === "/waiter/change-password") {
        return NextResponse.redirect(new URL("/waiter", request.url));
      }
    }

    if (pathname.startsWith("/kitchen") && payload.role !== "kitchen" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. If trying to access login page while already authenticated
  if (pathname.startsWith("/login") && token) {
    const payload = parseJwt(token);
    if (payload) {
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (payload.role === "waiter") {
        return NextResponse.redirect(new URL("/waiter", request.url));
      } else if (payload.role === "kitchen") {
        return NextResponse.redirect(new URL("/kitchen", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/waiter/:path*", "/kitchen/:path*", "/login"],
};
