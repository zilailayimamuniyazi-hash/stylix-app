import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getSupabaseAdmin();
    const authorization = req.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { data: auth, error: authError } = await db.auth.getUser(token);
    const email = auth.user?.email?.trim().toLowerCase();
    if (authError || !email) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    const { data, error } = await db
      .schema("public")
      .from("orders")
      .select(
        "order_id, email, items_json, total_cents, placed_at, status, first_name, last_name, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_zip, shipping_country, subtotal_cents, tax_cents, shipping_free"
      )
      .ilike("email", email)
      .order("placed_at", { ascending: false });

    if (error) {
      console.error("[orders/history] lookup failed", { code: error.code });
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    console.error("[orders/history] supabase unavailable", err);
    return NextResponse.json({ orders: [] });
  }
}
