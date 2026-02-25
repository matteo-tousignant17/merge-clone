import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { timingSafeEqual } from "crypto";

// HEAD — used by the login page to detect setup mode
export async function HEAD() {
  if (!process.env.AUTH_PASSWORD || !process.env.AUTH_SECRET) {
    return new NextResponse(null, { status: 503 });
  }
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  const authPassword = process.env.AUTH_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;

  if (!authPassword || !authSecret) {
    return NextResponse.json(
      { error: "AUTH_PASSWORD and AUTH_SECRET environment variables are not set" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const submitted = body.password ?? "";

  // Timing-safe comparison
  let match = false;
  try {
    const a = Buffer.from(submitted);
    const b = Buffer.from(authPassword);
    if (a.length === b.length) {
      match = timingSafeEqual(a, b);
    }
  } catch {
    match = false;
  }

  if (!match) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Build signed session cookie
  const payload = Buffer.from(JSON.stringify({ iat: Date.now() })).toString("base64");
  const sig = createHmac("sha256", authSecret).update(payload).digest("hex");
  const sessionValue = `${payload}.${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return res;
}
