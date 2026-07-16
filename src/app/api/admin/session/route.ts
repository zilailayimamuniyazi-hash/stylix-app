import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getExpectedAdminSession } from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return NextResponse.json({ error: "Admin access is unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const actual = Buffer.from(password);
  const expected = Buffer.from(configured);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const token = await getExpectedAdminSession();
  if (!token) return NextResponse.json({ error: "Admin session is unavailable." }, { status: 503 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
