import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "aarogyaai_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/_next") || pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const { r } = JSON.parse(decodeURIComponent(cookie)) as { u?: string; r?: "doctor" | "patient" };
    if (!r) throw new Error("missing role");

    if (pathname.startsWith("/doctor") && r !== "doctor") {
      const url = req.nextUrl.clone();
      url.pathname = "/patient";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/patient") && r !== "patient") {
      const url = req.nextUrl.clone();
      url.pathname = "/doctor";
      return NextResponse.redirect(url);
    }
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(doctor|patient)(/.*)?", "/login"],
};


