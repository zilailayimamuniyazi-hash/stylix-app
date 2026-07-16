"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";
import type { DbOrder } from "@/lib/types/database";
import { dbOrderToHistoryItem, saveOrderToStorage } from "@/lib/order/orderHistory";

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function OrderDetails({ order }: { order: DbOrder }) {
  const { locale, t } = useI18n();
  const countryLabels: Record<string, string> = {
    US: t.checkout.countryUS,
    CA: t.checkout.countryCA,
  };

  return (
    <div className="mt-14 w-full max-w-2xl mx-auto text-left space-y-10">
      {/* Order ID + date */}
      <div className="border border-ivory/10 bg-ink-soft/20 px-7 py-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold/50 mb-1">{t.checkoutSuccess.orderLabel}</p>
            <p className="font-serif text-sm text-ivory">{order.order_id}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold/50 mb-1">{t.checkoutSuccess.placedLabel}</p>
            <p className="text-sm text-ivory/70">{formatDate(order.placed_at, locale)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold/50 mb-1">{t.checkoutSuccess.paymentLabel}</p>
            <p className="text-sm text-ivory/70">{t.checkoutSuccess.stripeCheckout}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mb-5">{t.checkoutSuccess.yourPieces}</p>
        <div className="space-y-4">
          {order.items_json.map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex gap-5 border border-ivory/8 p-4">
              <div className="flex flex-1 items-start justify-between gap-4 min-w-0">
                <div className="min-w-0">
                  <p className="font-serif text-base text-ivory">{item.name}</p>
                  {item.qty > 1 && (
                    <p className="text-[9px] text-ivory/30 mt-1">{t.checkoutSuccess.qty} {item.qty}</p>
                  )}
                </div>
                <p className="shrink-0 font-serif text-base text-ivory">
                  ${(item.price * item.qty).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border border-ivory/10 bg-ink-soft/20 px-7 py-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-ivory/50">{t.bag.subtotal}</span>
          <span className="text-ivory">${formatCents(order.subtotal_cents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ivory/50">{t.bag.shipping}</span>
          <span className={order.shipping_free ? "text-gold/70" : "text-ivory/50"}>
            {order.shipping_free ? t.bag.complimentary : t.bag.calculatedAtCheckout}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-ivory/50">{t.bag.estimatedTax}</span>
          <span className="text-ivory/50">${formatCents(order.tax_cents)}</span>
        </div>
        <div className="flex justify-between border-t border-ivory/10 pt-3">
          <span className="font-serif text-base text-ivory">{t.bag.estimatedTotal}</span>
          <span className="font-serif text-base text-ivory">${formatCents(order.total_cents)}</span>
        </div>
      </div>

      {/* Shipping + contact */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mb-3">{t.checkoutSuccess.shippingTo}</p>
          <div className="text-sm text-ivory/60 space-y-0.5">
            <p className="text-ivory">{order.first_name} {order.last_name}</p>
            <p>{order.shipping_address1}</p>
            {order.shipping_address2 && <p>{order.shipping_address2}</p>}
            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
            <p>{countryLabels[order.shipping_country] ?? order.shipping_country}</p>
          </div>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mb-3">{t.checkoutSuccess.confirmationSentTo}</p>
          <p className="text-sm text-ivory/60">{order.email}</p>
          <p className="mt-4 text-[9px] text-ivory/40 leading-relaxed">
            {t.checkoutSuccess.dispatchNote}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SuccessViewProps {
  order: DbOrder | null;
  sessionId: string | null;
}

export function SuccessView({ order: initialOrder, sessionId }: SuccessViewProps) {
  const { t } = useI18n();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<DbOrder | null>(initialOrder);
  const [polling, setPolling] = useState(!initialOrder && !!sessionId);
  const didTrack = useRef(false);
  const didClear = useRef(false);

  // Poll for order if webhook hasn't fired yet by the time the page loads
  useEffect(() => {
    if (!polling || !sessionId) return;

    let attempts = 0;
    const MAX = 4;

    async function poll() {
      attempts++;
      try {
        const res = await fetch(`/api/orders?session_id=${sessionId}`);
        if (res.ok) {
          const { order: fetched } = await res.json();
          if (fetched) {
            setOrder(fetched);
            setPolling(false);
            return;
          }
        }
      } catch { /* ignore */ }

      if (attempts < MAX) {
        setTimeout(poll, 3000);
      } else {
        setPolling(false);
      }
    }

    const timer = setTimeout(poll, 3000);
    return () => clearTimeout(timer);
  }, [polling, sessionId]);

  // Fire PURCHASE event once when order is confirmed
  useEffect(() => {
    if (order && !didTrack.current) {
      didTrack.current = true;
      track({ event_name: EVENTS.PURCHASE });
    }
  }, [order]);

  // Clear cart once when order is confirmed
  useEffect(() => {
    if (order && !didClear.current) {
      didClear.current = true;
      clearCart();
    }
  }, [order, clearCart]);

  // Keep a local receipt available if the account order service is temporarily unavailable.
  useEffect(() => {
    if (order) {
      saveOrderToStorage(dbOrderToHistoryItem(order));
    }
  }, [order]);

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">
              {t.checkoutSuccess.eyebrow}
            </p>
            <span className="h-px w-8 bg-gold/40" />
          </div>

          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">{t.checkoutSuccess.title}</h1>

          <p className="mt-6 text-sm leading-relaxed text-ivory/60 max-w-sm mx-auto">
            {order
              ? t.checkoutSuccess.orderReceived
              : polling
              ? t.checkoutSuccess.confirming
              : t.checkoutSuccess.checkEmail}
          </p>

          {polling && (
            <div className="mt-6 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-gold/60 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {t.checkoutSuccess.trustSignals.map((line) => (
              <p key={line} className="flex items-center gap-2 text-[10px] text-ivory/30">
                <span className="h-px w-4 bg-gold/30 shrink-0" />
                {line}
              </p>
            ))}
          </div>
        </div>

        {order && <OrderDetails order={order} />}

        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/collection"
            className="inline-flex items-center justify-center px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium border border-gold/30 text-gold hover:border-gold transition-colors"
          >
            {t.checkoutSuccess.continueShopping}
          </Link>
          <Link
            href="/advisor"
            className="text-[10px] uppercase tracking-[0.3em] text-ivory/30 hover:text-gold transition-colors"
          >
            {t.checkoutSuccess.startAIStyling}
          </Link>
        </div>
      </div>
    </div>
  );
}
