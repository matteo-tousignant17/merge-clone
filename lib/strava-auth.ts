import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface StravaTokens {
  accessToken: string;
  athleteId: string;
}

/** Returns a valid access token, refreshing if expired. Throws on failure. */
export async function getValidStravaToken(): Promise<StravaTokens> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("strava_access_token")?.value;
  const refreshToken = cookieStore.get("strava_refresh_token")?.value;
  const expiresAt = parseInt(cookieStore.get("strava_expires_at")?.value ?? "0");
  const athleteId = cookieStore.get("strava_athlete_id")?.value ?? "";

  if (!accessToken || !refreshToken) {
    throw new Error("NOT_CONNECTED");
  }

  // Still valid (with 5 min buffer)
  if (Date.now() / 1000 < expiresAt - 300) {
    return { accessToken, athleteId };
  }

  // Refresh
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("REFRESH_FAILED");

  const data = await res.json();

  // Note: cookies() in route handlers is read-only after response starts,
  // but we can set-cookie via the response headers in the proxy routes.
  return { accessToken: data.access_token, athleteId };
}

export function notConnectedResponse() {
  return NextResponse.json({ error: "Strava not connected" }, { status: 401 });
}
