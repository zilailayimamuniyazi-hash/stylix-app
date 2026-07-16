import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface AnalyticsEvent {
  event_name: string;
  page_url?: string;
  product_id?: string;
  tool_name?: string;
  anonymous_user_id?: string;
  session_id?: string;
  device_type?: string;
  browser?: string;
  traffic_source?: string;
  referrer?: string;
  country?: string;
  region?: string;
}

// Hostnames that should never appear in production analytics.
// Events whose page_url or referrer matches are silently discarded.
const BLOCKED_HOSTNAMES = ["localhost", "127.0.0.1", "0.0.0.0"];

function isBlockedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    if (BLOCKED_HOSTNAMES.includes(hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

const MAX_BATCH_SIZE = 25;
const MAX_EVENT_NAME_LENGTH = 64;
const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_]{1,63}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEvents: AnalyticsEvent[] = Array.isArray(body) ? body : [body];

    if (!rawEvents.length) {
      return NextResponse.json({ ok: true });
    }

    if (rawEvents.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}.` },
        { status: 400 }
      );
    }

    for (const ev of rawEvents) {
      if (!ev.event_name || typeof ev.event_name !== "string") {
        return NextResponse.json({ error: "event_name required" }, { status: 400 });
      }
      if (ev.event_name.length > MAX_EVENT_NAME_LENGTH || !EVENT_NAME_PATTERN.test(ev.event_name)) {
        return NextResponse.json(
          { error: `Invalid event_name: "${ev.event_name.slice(0, 30)}"` },
          { status: 400 }
        );
      }
    }

    // Read Vercel geo headers — populated automatically on every Vercel deployment.
    // Falls back to null in local dev (which is fine — those events are blocked by tracker.ts).
    const geoCountry = req.headers.get("x-vercel-ip-country") ?? null;

    const now = new Date().toISOString();

    const rows = rawEvents
      // Drop events originating from localhost/dev environments
      .filter((ev) => !isBlockedUrl(ev.page_url))
      .map((ev) => {
        // Strip localhost referrers from stored data
        const cleanReferrer = isBlockedUrl(ev.referrer) ? null : (ev.referrer ?? null);

        return {
          event_name:        ev.event_name,
          page_url:          ev.page_url          ?? null,
          product_id:        ev.product_id         ?? null,
          tool_name:         ev.tool_name          ?? null,
          anonymous_user_id: ev.anonymous_user_id  ?? null,
          session_id:        ev.session_id          ?? null,
          device_type:       ev.device_type         ?? null,
          referrer:          cleanReferrer,
          country:           geoCountry,
          timestamp:         now,
        };
      });

    if (!rows.length) {
      return NextResponse.json({ ok: true, stored: false, reason: "filtered" });
    }

    const db = getSupabaseAdmin();
    const { error: insertError } = await db.schema("public").from("analytics_events").insert(rows);

    if (insertError) {
      console.error("[analytics] Supabase insert failed", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        eventCount: rows.length,
        firstEvent: rows[0],
      });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[analytics] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
