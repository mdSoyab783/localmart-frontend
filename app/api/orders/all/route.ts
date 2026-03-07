import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const token = request.headers.get("authorization");
  
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/all${status ? `?status=${status}` : ""}`;
  
  const res = await fetch(url, {
    headers: { Authorization: token || "" },
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
