import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "STRAVA_CLIENT_ID is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${appUrl}/api/strava/callback`,
    approval_prompt: "force",
    scope: "activity:read_all,profile:read_all",
  });

  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?${params}`;
  return NextResponse.redirect(stravaAuthUrl);
}
