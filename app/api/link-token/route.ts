import { NextRequest, NextResponse } from "next/server";

// Simulated link token generation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { end_user_origin_id, end_user_organization_name, end_user_email_address, categories } = body;

    if (!end_user_origin_id || !end_user_organization_name) {
      return NextResponse.json(
        { error: "end_user_origin_id and end_user_organization_name are required" },
        { status: 400 }
      );
    }

    // Generate simulated link token
    const linkToken = `lt_${Math.random().toString(36).substring(2, 18)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    return NextResponse.json({
      link_token: linkToken,
      integration_name: null,
      magic_link_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/link?token=${linkToken}`,
      expires_at: expiresAt,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
