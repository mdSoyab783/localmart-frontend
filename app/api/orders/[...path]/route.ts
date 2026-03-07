import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxy(request: NextRequest, params: { path?: string[] }, method: string) {
  const path = (params?.path || []).join("/");
  const search = request.nextUrl.search || "";
  const url = `${BACKEND}/api/orders/${path}${search}`;
  const token = request.headers.get("authorization");

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
  };

  if (method !== "GET") {
    options.body = await request.text();
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ message: "Proxy error", error: String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params, "GET");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params, "PUT");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params, "POST");
}
