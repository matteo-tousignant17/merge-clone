import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/integrations/strava?error=access_denied`);
  }

  try {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("Strava token exchange failed:", body);
      return NextResponse.redirect(`${appUrl}/integrations/strava?error=token_exchange_failed`);
    }

    const data = await tokenRes.json();
    const { access_token, refresh_token, expires_at, athlete } = data;

    const response = NextResponse.redirect(
      `${appUrl}/integrations/strava?connected=true&athlete=${encodeURIComponent(athlete.firstname + " " + athlete.lastname)}`
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 days
    };

    response.cookies.set("strava_access_token", access_token, cookieOpts);
    response.cookies.set("strava_refresh_token", refresh_token, cookieOpts);
    response.cookies.set("strava_expires_at", String(expires_at), cookieOpts);
    response.cookies.set("strava_athlete_id", String(athlete.id), cookieOpts);
    // Public cookie for sidebar visibility check (not HttpOnly)
    response.cookies.set("strava_connected", "true", {
      ...cookieOpts,
      httpOnly: false,
    });

    return response;
  } catch (err) {
    console.error("Strava callback error:", err);
    return NextResponse.redirect(`${appUrl}/integrations/strava?error=server_error`);
  }
}
