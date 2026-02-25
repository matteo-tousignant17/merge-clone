import { NextResponse } from "next/server";
import { getValidStravaToken, notConnectedResponse } from "@/lib/strava-auth";

export async function GET() {
  try {
    const { accessToken, athleteId } = await getValidStravaToken();

    if (!athleteId) {
      return NextResponse.json({ error: "Athlete ID not found" }, { status: 400 });
    }

    const res = await fetch(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Strava API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message === "NOT_CONNECTED") return notConnectedResponse();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
