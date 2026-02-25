import { NextResponse } from "next/server";
import { getValidStravaToken, notConnectedResponse } from "@/lib/strava-auth";

export interface LogEntry {
  id: string;
  timestamp: string;
  method: "GET";
  endpoint: string;
  label: string;
  status: number;
  latency: number;
  recordCount: number | null;
}

export interface RateLimit {
  usage15m: number;
  limit15m: number;
  usageDay: number;
  limitDay: number;
}

export interface DiagnoseResult {
  logs: LogEntry[];
  rateLimit: RateLimit | null;
}

export async function GET() {
  let accessToken: string;
  try {
    ({ accessToken } = await getValidStravaToken());
  } catch (err: any) {
    if (err.message === "NOT_CONNECTED") return notConnectedResponse();
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }

  const logs: LogEntry[] = [];
  let rateLimit: RateLimit | null = null;
  let athleteId: number | null = null;

  async function callStrava(endpoint: string, label: string): Promise<LogEntry> {
    const start = Date.now();
    const res = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const latency = Date.now() - start;

    // Strava returns "X-RateLimit-Limit: 200,2000" and "X-RateLimit-Usage: 15,420"
    const rlUsage = res.headers.get("X-RateLimit-Usage");
    const rlLimit = res.headers.get("X-RateLimit-Limit");
    if (rlUsage && rlLimit) {
      const [u15, uDay] = rlUsage.split(",").map(Number);
      const [l15, lDay] = rlLimit.split(",").map(Number);
      rateLimit = { usage15m: u15, limit15m: l15, usageDay: uDay, limitDay: lDay };
    }

    let recordCount: number | null = null;
    if (res.ok) {
      try {
        const data = await res.json();
        if (Array.isArray(data)) {
          recordCount = data.length;
        } else if (data && typeof data === "object") {
          recordCount = 1;
          if (endpoint === "/athlete" && data.id) athleteId = data.id;
        }
      } catch {}
    }

    return {
      id: Math.random().toString(36).slice(2, 10),
      timestamp: new Date().toISOString(),
      method: "GET",
      endpoint: endpoint.split("?")[0],
      label,
      status: res.status,
      latency,
      recordCount,
    };
  }

  // Run sequentially — rate limit headers reflect cumulative usage
  logs.push(await callStrava("/athlete", "Fetch athlete profile"));
  logs.push(await callStrava("/athlete/activities?per_page=10", "Fetch recent activities"));
  if (athleteId) {
    logs.push(await callStrava(`/athletes/${athleteId}/stats`, "Fetch athlete stats"));
  }

  return NextResponse.json({ logs, rateLimit } satisfies DiagnoseResult);
}
