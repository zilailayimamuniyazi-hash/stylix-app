import type { DbOrder } from "@/lib/types/database";

export interface OrderHistoryItem {
  order_id: string;
  email: string;
  items_json: Array<{ id: string; name: string; price: number; qty: number }>;
  total_cents: number;
  placed_at: string;
  status: string;
  first_name?: string;
  last_name?: string;
  shipping_address1?: string;
  shipping_address2?: string | null;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country?: string;
  subtotal_cents?: number;
  tax_cents?: number;
  shipping_free?: boolean;
}

const STORAGE_KEY = "stylix-order-history";

export type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered";

export function normalizeOrderStatus(status: string): OrderStatus {
  const s = status.toLowerCase();
  if (s === "paid") return "confirmed";
  if (s === "confirmed" || s === "processing" || s === "shipped" || s === "delivered") {
    return s;
  }
  return "confirmed";
}

export function statusBadgeClass(status: string): string {
  switch (normalizeOrderStatus(status)) {
    case "confirmed":
    case "delivered":
      return "text-emerald-400";
    case "processing":
      return "text-gold";
    case "shipped":
      return "text-blue-400";
    default:
      return "text-emerald-400";
  }
}

export function timelineStepIndex(status: string): number {
  switch (normalizeOrderStatus(status)) {
    case "confirmed":
      return 1;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 1;
  }
}

function loadAllFromStorage(): OrderHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OrderHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function loadOrdersFromStorage(email: string): OrderHistoryItem[] {
  const normalized = email.trim().toLowerCase();
  return loadAllFromStorage()
    .filter((o) => o.email?.trim().toLowerCase() === normalized)
    .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());
}

export function saveOrderToStorage(order: OrderHistoryItem): void {
  try {
    const all = loadAllFromStorage();
    if (all.some((o) => o.order_id === order.order_id)) return;
    all.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function dbOrderToHistoryItem(order: DbOrder): OrderHistoryItem {
  return {
    order_id: order.order_id,
    email: order.email,
    items_json: order.items_json,
    total_cents: order.total_cents,
    placed_at: order.placed_at,
    status: order.status,
    first_name: order.first_name,
    last_name: order.last_name,
    shipping_address1: order.shipping_address1,
    shipping_address2: order.shipping_address2,
    shipping_city: order.shipping_city,
    shipping_state: order.shipping_state,
    shipping_zip: order.shipping_zip,
    shipping_country: order.shipping_country,
    subtotal_cents: order.subtotal_cents,
    tax_cents: order.tax_cents,
    shipping_free: order.shipping_free,
  };
}

export function mergeOrderLists(
  remote: OrderHistoryItem[],
  local: OrderHistoryItem[]
): OrderHistoryItem[] {
  const seen = new Set<string>();
  const merged: OrderHistoryItem[] = [];

  for (const order of [...remote, ...local]) {
    if (seen.has(order.order_id)) continue;
    seen.add(order.order_id);
    merged.push(order);
  }

  return merged.sort(
    (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()
  );
}
