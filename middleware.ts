import { NextRequest, NextResponse } from "next/server";

async function verifySession(
  cookie: string | undefined,
  secret: string
): Promise<boolean> {
  if (!cookie) return false;
  const dotIdx = cookie.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const payload = cookie.slice(0, dotIdx);
  const sig = cookie.slice(dotIdx + 1);
  const enc = new TextEncoder();
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch {
    return false;
  }
  const hexPairs = sig.match(/.{1,2}/g);
  if (!hexPairs) return false;
  const sigBytes = Uint8Array.from(hexPairs.map((b) => parseInt(b, 16)));
  try {
    return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.AUTH_SECRET;
  const session = req.cookies.get("session")?.value;
  const authenticated = secret ? await verifySession(session, secret) : false;

  if (authenticated) return NextResponse.next();

  if (pathname === "/login") return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api/auth|api/strava/callback|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
