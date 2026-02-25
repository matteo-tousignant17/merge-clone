import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function verifySession(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const dotIdx = cookie.lastIndexOf(".");
  if (dotIdx === -1) return false;

  const payload = cookie.slice(0, dotIdx);
  const sig = cookie.slice(dotIdx + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If AUTH_PASSWORD is not configured, only allow /login through
  const passwordSet = !!process.env.AUTH_PASSWORD;

  const session = req.cookies.get("session")?.value;
  const authenticated = verifySession(session);

  if (authenticated) return NextResponse.next();

  // Allow /login page always (so user can set up or sign in)
  if (pathname === "/login") return NextResponse.next();

  // API routes return 401 JSON instead of redirect
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Everything else → redirect to /login
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api/auth|api/strava/callback|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
