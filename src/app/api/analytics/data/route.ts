import { NextRequest, NextResponse } from "next/server";
import { EVENTS } from "@/lib/analytics/events";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasAdminSession } from "@/lib/admin/session";

const PAGE_SIZE = 1000;
const ANALYTICS_SELECT =
  "id, event_name, page_url, product_id, tool_name, timestamp, anonymous_user_id, session_id, device_type, referrer, country";

type AnalyticsRange = "today" | "7d" | "30d" | "90d" | "6m" | "12m" | "all";

interface AnalyticsEventRow {
  id: string;
  event_name: string;
  page_url: string | null;
  product_id: string | null;
  tool_name: string | null;
  timestamp: string;
  anonymous_user_id: string | null;
  session_id: string | null;
  device_type: string | null;
  browser: string | null;
  traffic_source: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getRange(value: string | null): AnalyticsRange {
  if (
    value === "today" ||
    value === "7d" ||
    value === "30d" ||
    value === "90d" ||
    value === "6m" ||
    value === "12m" ||
    value === "all"
  ) {
    return value;
  }
  return "30d";
}

function getSinceIso(range: AnalyticsRange): string | null {
  const now = new Date();
  const since = new Date(now);

  if (range === "today") {
    since.setHours(0, 0, 0, 0);
    return since.toISOString();
  }
  if (range === "7d") {
    since.setDate(since.getDate() - 7);
    return since.toISOString();
  }
  if (range === "30d") {
    since.setDate(since.getDate() - 30);
    return since.toISOString();
  }
  if (range === "90d") {
    since.setDate(since.getDate() - 90);
    return since.toISOString();
  }
  if (range === "6m") {
    since.setMonth(since.getMonth() - 6);
    return since.toISOString();
  }
  if (range === "12m") {
    since.setMonth(since.getMonth() - 12);
    return since.toISOString();
  }
  return null;
}

function increment(counts: Record<string, number>, key: string | null | undefined) {
  if (!key) return;
  counts[key] = (counts[key] ?? 0) + 1;
}

function sortCounts(counts: Record<string, number>, limit: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function countEvents(rows: AnalyticsEventRow[], eventName: string) {
  return rows.filter((row) => row.event_name === eventName).length;
}

async function fetchAnalyticsEvents(
  db: ReturnType<typeof getSupabaseAdmin>,
  sinceIso: string | null
): Promise<AnalyticsEventRow[]> {
  const rows: AnalyticsEventRow[] = [];
  let from = 0;

  while (true) {
    let query = db
      .schema("public")
      .from("analytics_events")
      .select(ANALYTICS_SELECT)
      .order("timestamp", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (sinceIso) {
      query = query.gte("timestamp", sinceIso);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[analytics/data] analytics_events query failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        since: sinceIso,
        from,
        to: from + PAGE_SIZE - 1,
      });
      throw new Error(error.message);
    }

    const batch = (data ?? []) as AnalyticsEventRow[];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

export async function GET(req: NextRequest) {
  if (!(await hasAdminSession(req))) return unauthorized();

  const { searchParams } = new URL(req.url);
  const range = getRange(searchParams.get("range"));
  const sinceIso = getSinceIso(range);

  let rows: AnalyticsEventRow[];
  try {
    const db = getSupabaseAdmin();
    rows = await fetchAnalyticsEvents(db, sinceIso);
  } catch (err) {
    console.error("[analytics/data] failed to load analytics_events", err);
    return NextResponse.json({ error: "Analytics data unavailable" }, { status: 500 });
  }

  // Aggregate top pages
  const pageCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.event_name === EVENTS.PAGE_VIEW) {
      increment(pageCounts, row.page_url);
    }
  }
  const topPages = sortCounts(pageCounts, 10)
    .map(([url, count]) => ({ url, count }));
  const totalPageViews = Object.values(pageCounts).reduce((a, b) => a + b, 0);

  // Aggregate top products
  const productCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.event_name === EVENTS.PRODUCT_VIEW) {
      increment(productCounts, row.product_id);
    }
  }
  const topProducts = sortCounts(productCounts, 10)
    .map(([productId, count]) => ({ productId, count }));

  // Single pass: count all event names (used for both tool usage and funnel)
  const eventCounts: Record<string, number> = {};
  for (const row of rows) {
    increment(eventCounts, row.event_name);
  }

  // Aggregate traffic sources
  const sourceCounts: Record<string, number> = {};
  for (const row of rows) {
    increment(sourceCounts, row.traffic_source ?? "direct");
  }
  const trafficSources = sortCounts(sourceCounts, 10)
    .map(([source, count]) => ({ source, count }));

  // Aggregate browsers
  const browserCounts: Record<string, number> = {};
  for (const row of rows) {
    increment(browserCounts, row.browser ?? "other");
  }
  const browsers = sortCounts(browserCounts, 10)
    .map(([browser, count]) => ({ browser, count }));

  // Aggregate devices
  const deviceCounts: Record<string, number> = {};
  for (const row of rows) {
    increment(deviceCounts, row.device_type ?? "unknown");
  }
  const devices = sortCounts(deviceCounts, 5)
    .map(([device, count]) => ({ device, count }));

  // Aggregate countries
  const countryCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.country) increment(countryCounts, row.country);
  }
  const countries = sortCounts(countryCounts, 15)
    .map(([country, count]) => ({ country, count }));

  // Aggregate regions (top 10)
  const regionCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.region) increment(regionCounts, row.region);
  }
  const regions = sortCounts(regionCounts, 10)
    .map(([region, count]) => ({ region, count }));

  const uniqueVisitors = new Set(rows.map((row) => row.anonymous_user_id).filter(Boolean)).size;
  const uniqueSessions = new Set(rows.map((row) => row.session_id).filter(Boolean)).size;

  return NextResponse.json({
    demo: false,
    range,
    since: sinceIso,
    summary: {
      totalEvents: rows.length,
      uniqueVisitors,
      uniqueSessions,
      productViews: countEvents(rows, EVENTS.PRODUCT_VIEW),
      toolUses:
        countEvents(rows, EVENTS.VIEWER_3D_OPEN) +
        countEvents(rows, EVENTS.VIEW_3D_OPEN) +
        countEvents(rows, EVENTS.TRYON_START) +
        countEvents(rows, EVENTS.ADVISOR_SUBMIT),
      addToCart: countEvents(rows, EVENTS.ADD_TO_CART),
      checkoutStart: countEvents(rows, EVENTS.CHECKOUT_START),
      purchases: countEvents(rows, EVENTS.PURCHASE),
    },
    topPages,
    totalPageViews,
    topProducts,
    trafficSources,
    browsers,
    devices,
    countries,
    regions,
    toolUsage: {
      viewer3dOpen: (eventCounts[EVENTS.VIEWER_3D_OPEN] ?? 0) + (eventCounts[EVENTS.VIEW_3D_OPEN] ?? 0),
      viewer3dInteract: eventCounts[EVENTS.VIEWER_3D_INTERACT] ?? 0,
      tryonStart: eventCounts[EVENTS.TRYON_START] ?? 0,
      tryonComplete: eventCounts[EVENTS.TRYON_COMPLETE] ?? 0,
      advisorSubmit: eventCounts[EVENTS.ADVISOR_SUBMIT] ?? 0,
      advisorResultView: eventCounts[EVENTS.ADVISOR_RESULT_VIEW] ?? 0,
    },
    funnel: {
      pageView: eventCounts[EVENTS.PAGE_VIEW] ?? 0,
      productView: eventCounts[EVENTS.PRODUCT_VIEW] ?? 0,
      addToCart: eventCounts[EVENTS.ADD_TO_CART] ?? 0,
      cartView: eventCounts[EVENTS.CART_VIEW] ?? 0,
      checkoutStart: eventCounts[EVENTS.CHECKOUT_START] ?? 0,
      checkoutSubmit: eventCounts[EVENTS.CHECKOUT_SUBMIT] ?? 0,
      purchase: eventCounts[EVENTS.PURCHASE] ?? 0,
    },
    journey: rows.slice(0, 200),
  });
}
