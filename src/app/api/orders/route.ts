import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DbOrder } from "@/lib/types/database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not paid." }, { status: 403 });
    }

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .schema("public")
      .from("orders")
      .select(
        "order_id, placed_at, status, items_json, subtotal_cents, shipping_free, tax_cents, total_cents, first_name, last_name, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_zip, shipping_country, email"
      )
      .eq("stripe_session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[orders] lookup failed", { code: error.code });
      return NextResponse.json({ error: "Order lookup failed." }, { status: 500 });
    }

    return NextResponse.json({ order: data ?? null });
  } catch (err) {
    console.error("[orders] unexpected error", err);
    return NextResponse.json({ error: "Order lookup failed." }, { status: 500 });
  }
}
