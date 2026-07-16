import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/data/products";

const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST_CENTS = 1500;
const MAX_QUANTITY_PER_ITEM = 10;
const MAX_ITEMS = 20;

interface CartItem {
  productId: string;
  quantity: number;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface ShippingInfo {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CheckoutRequest {
  items: CartItem[];
  contact: ContactInfo;
  shipping: ShippingInfo;
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STX-${ts}-${rand}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function normalizeQuantity(quantity: unknown): number {
  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    return 1;
  }
  return Math.min(quantity, MAX_QUANTITY_PER_ITEM);
}

function itemsJsonMetadata(itemsJson: string): Record<string, string> {
  const maxLen = 500;
  if (itemsJson.length <= maxLen) {
    return { items_json: itemsJson };
  }
  const result: Record<string, string> = {};
  const partCount = Math.ceil(itemsJson.length / maxLen);
  for (let i = 0; i < partCount; i++) {
    result[`items_json_${i}`] = itemsJson.slice(i * maxLen, (i + 1) * maxLen);
  }
  result.items_json_parts = String(partCount);
  return result;
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("[checkout] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Checkout unavailable." }, { status: 503 });
  }

  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { items, contact, shipping } = body;

  if (!items?.length || items.length > MAX_ITEMS) {
    return NextResponse.json({ error: "Invalid items." }, { status: 400 });
  }
  if (!contact?.email || !isValidEmail(contact.email) || !contact.firstName || !contact.lastName) {
    return NextResponse.json({ error: "Contact information incomplete." }, { status: 400 });
  }
  if (!shipping?.address1 || !shipping.city || !shipping.state || !shipping.zip) {
    return NextResponse.json({ error: "Shipping address incomplete." }, { status: 400 });
  }

  const resolvedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const qty = normalizeQuantity(item.quantity);
    return { product, quantity: qty };
  });

  if (resolvedItems.some((r) => r === null)) {
    return NextResponse.json({ error: "One or more products not found." }, { status: 400 });
  }

  const validItems = resolvedItems as { product: (typeof products)[number]; quantity: number }[];

  const subtotal = validItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const subtotalCents = Math.round(subtotal * 100);
  const orderId = generateOrderId();

  const siteUrl = getSiteUrl();

  const itemsJson = JSON.stringify(
    validItems.map((i) => ({ id: i.product.id, name: i.product.name, price: i.product.price, qty: i.quantity }))
  );

  const metadata: Record<string, string> = {
    order_id: orderId,
    contact_email: contact.email,
    contact_first: contact.firstName.slice(0, 100),
    contact_last: contact.lastName.slice(0, 100),
    contact_phone: (contact.phone ?? "").slice(0, 20),
    shipping_address1: shipping.address1.slice(0, 200),
    shipping_address2: (shipping.address2 ?? "").slice(0, 200),
    shipping_city: shipping.city.slice(0, 100),
    shipping_state: shipping.state.slice(0, 50),
    shipping_zip: shipping.zip.slice(0, 20),
    shipping_country: (shipping.country ?? "US").slice(0, 5),
    shipping_free: String(shippingFree),
    subtotal_cents: String(subtotalCents),
    tax_cents: "0",
    ...itemsJsonMetadata(itemsJson),
  };

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"],
      line_items: validItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            ...(item.product.coverImage ? { images: [`${siteUrl}${item.product.coverImage}`] } : {}),
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      customer_email: contact.email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingFree ? 0 : SHIPPING_COST_CENTS, currency: "usd" },
            display_name: shippingFree ? "Complimentary Shipping" : "Standard Shipping",
          },
        },
      ],
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });

    if (!session.url) {
      console.error("[checkout] Stripe session created but url is null", session.id);
      return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe session creation failed", err);
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });
  }
}
