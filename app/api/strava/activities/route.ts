import { NextRequest, NextResponse } from "next/server";
import { getValidStravaToken, notConnectedResponse } from "@/lib/strava-auth";

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await getValidStravaToken();
    const { searchParams } = new URL(req.url);
    const perPage = searchParams.get("per_page") ?? "50";
    const page = searchParams.get("page") ?? "1";
    const before = searchParams.get("before");
    const after = searchParams.get("after");

    const params = new URLSearchParams({ per_page: perPage, page });
    if (before) params.set("before", before);
    if (after) params.set("after", after);

    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 60 },
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
