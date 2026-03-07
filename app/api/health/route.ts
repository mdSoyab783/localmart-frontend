import { NextRequest, NextResponse } from "next/server";

// Health check endpoint to verify notifications API
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Notifications API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: "/api/notifications - Send email/SMS notifications",
    },
  });
}
