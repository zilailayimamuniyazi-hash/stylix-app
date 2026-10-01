import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const QUEUE_FILE = path.resolve(process.cwd(), "../production-dashboard/queue.json");
const SNAPSHOT_ID = "stylix-3d-production";

function noStore(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    try {
      return noStore(JSON.parse(await fs.promises.readFile(QUEUE_FILE, "utf8")));
    } catch (error) {
      console.error("[3d-production] unable to read local queue", error);
      return noStore({ error: "Local production queue unavailable." }, 500);
    }
  }
  if (!(await hasAdminSession(request))) return noStore({ error: "Unauthorized" }, 401);
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.schema("public").from("production_queue_snapshots")
      .select("payload,updated_at,workstation_heartbeat_at").eq("id", SNAPSHOT_ID).maybeSingle();
    if (error) throw error;
    if (!data) return noStore({ error: "No production snapshot has been synced yet." }, 404);
    return noStore(data.payload);
  } catch (error) {
    console.error("[3d-production] cloud queue unavailable", error);
    return noStore({ error: "Cloud production queue unavailable." }, 500);
  }
}

export async function POST(request: NextRequest) {
  const expected = process.env.PRODUCTION_SYNC_TOKEN;
  const supplied = request.headers.get("x-production-sync-token");
  if (!expected || !supplied || supplied !== expected) return noStore({ error: "Unauthorized" }, 401);
  try {
    const payload = await request.json();
    if (!payload || !Array.isArray(payload.products) || !payload.monitor) return noStore({ error: "Invalid queue snapshot." }, 400);
    const db = getSupabaseAdmin();
    const { error } = await db.schema("public").from("production_queue_snapshots").upsert({
      id: SNAPSHOT_ID,
      payload,
      updated_at: new Date().toISOString(),
      workstation_heartbeat_at: payload.monitor.heartbeatAt ?? null,
    });
    if (error) throw error;
    return noStore({ ok: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[3d-production] cloud sync failed", error);
    return noStore({ error: "Cloud sync failed." }, 500);
  }
}
