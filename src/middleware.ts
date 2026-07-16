import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAdminSession } from "@/lib/admin/session";

const BASE_SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
};

const HSTS_HEADER = "max-age=31536000; includeSubDomains";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_CLEANUP_INTERVAL = 120_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function cleanupRateLimitMap(now: number) {
  if (now - lastCleanup < RATE_LIMIT_CLEANUP_INTERVAL && rateLimitMap.size < RATE_LIMIT_MAX_ENTRIES) {
    return;
  }
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  cleanupRateLimitMap(now);
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  for (const [key, value] of Object.entries(BASE_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", HSTS_HEADER);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !(await hasAdminSession(request))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      const redirectResponse = NextResponse.redirect(url);
      applySecurityHeaders(redirectResponse, request);
      return redirectResponse;
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, request);

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" },
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
