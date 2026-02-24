import { NextRequest, NextResponse } from "next/server";

// Simulated public_token → account_token exchange
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { public_token } = body;

    if (!public_token) {
      return NextResponse.json({ error: "public_token is required" }, { status: 400 });
    }

    // Generate simulated account token
    const accountToken = `at_${Math.random().toString(36).substring(2, 30)}`;

    return NextResponse.json({
      account_token: accountToken,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
