import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("[webhook] STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    console.log("[webhook] session completed but not paid, skipping:", session.id);
    return;
  }

  const meta = session.metadata ?? {};

  const itemsPayload = meta.items_json_parts
    ? Array.from({ length: Number(meta.items_json_parts) }, (_, index) => meta[`items_json_${index}`] ?? "").join("")
    : meta.items_json ?? "[]";
  const itemsJson: Array<{ id: string; name: string; price: number; qty: number }> = (() => {
    try {
      return JSON.parse(itemsPayload);
    } catch {
      return [];
    }
  })();

  const subtotalCents = parseInt(meta.subtotal_cents ?? "0", 10);
  const taxCents = session.total_details?.amount_tax ?? parseInt(meta.tax_cents ?? "0", 10);
  // Use Stripe's authoritative total (may differ if promo applied)
  const totalCents = session.amount_total ?? subtotalCents + taxCents;

  const row = {
    order_id: meta.order_id ?? `STX-UNKNOWN-${Date.now()}`,
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    status: "paid",
    email: meta.contact_email ?? session.customer_email ?? "",
    first_name: meta.contact_first ?? "",
    last_name: meta.contact_last ?? "",
    phone: meta.contact_phone || null,
    shipping_address1: meta.shipping_address1 ?? "",
    shipping_address2: meta.shipping_address2 || null,
    shipping_city: meta.shipping_city ?? "",
    shipping_state: meta.shipping_state ?? "",
    shipping_zip: meta.shipping_zip ?? "",
    shipping_country: meta.shipping_country ?? "US",
    subtotal_cents: subtotalCents,
    tax_cents: taxCents,
    total_cents: totalCents,
    shipping_free: meta.shipping_free === "true",
    currency: session.currency ?? "usd",
    items_json: itemsJson,
  };

  const db = getSupabaseAdmin();
  const { error } = await db.schema("public").from("orders").insert(row);

  if (error) {
    // 23505 = unique_violation — webhook fired twice, already stored
    if ((error as { code?: string }).code === "23505") {
      console.warn("[webhook] duplicate session — already stored:", session.id);
      return;
    }
    console.error("[webhook] order insert failed", {
      code: (error as { code?: string }).code,
      message: error.message,
      session_id: session.id,
    });
    throw new Error(error.message);
  }

  console.log("[webhook] order saved:", row.order_id, session.id);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await req.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read request body." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
