"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";
import { useI18n } from "@/lib/i18n/context";

const SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING = 15;

export function BagClient() {
  const { t } = useI18n();
  const { items, subtotal, removeItem, setQuantity } = useCart();

  useEffect(() => {
    track({ event_name: EVENTS.CART_VIEW });
  }, []);

  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = shippingFree ? 0 : STANDARD_SHIPPING;
  const estimatedTotal = subtotal + shippingCost;

  const header = (
    <div className="border-b border-ivory/10 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold/40" />
          <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">
            {t.bag.pageEyebrow}
          </p>
        </div>
        <h1 className="font-serif text-4xl text-ivory sm:text-5xl">{t.bag.pageTitle}</h1>
      </div>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="ui-page">
        {header}
        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-10 text-center">
        <p className="font-serif text-2xl text-ivory/30">{t.bag.emptyTitle}</p>
        <p className="mt-4 text-sm text-ivory/40">
          {t.bag.emptyBody}
        </p>
        <Link
          href="/collection"
          className="mt-10 inline-flex items-center justify-center px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium border border-gold/30 text-gold hover:border-gold transition-colors"
        >
          {t.bag.exploreCta}
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page">
      {header}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">

        {/* ── Items ──────────────────────────────────────────────────── */}
        <div>
          <div className="space-y-0 divide-y divide-ivory/8">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-6 py-8">
                {/* Image */}
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <div className="relative h-28 w-28 overflow-hidden border border-ivory/10 bg-ink-soft">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60 mb-1">
                          {product.tags.collectionCategory === "designer-capsule"
                            ? product.collaboratorName ?? t.bag.designerCapsule
                            : product.tags.collectionName}
                        </p>
                        <Link href={`/product/${product.slug}`}>
                          <p className="font-serif text-lg text-ivory hover:text-gold transition-colors">
                            {product.name}
                          </p>
                        </Link>
                        <p className="mt-0.5 text-sm text-ivory/40">{product.subtitle}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-ivory/30">
                          {product.material}
                        </p>
                      </div>
                      <p className="shrink-0 font-serif text-lg text-ivory">
                        ${(product.price * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity + remove */}
                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex items-center border border-ivory/15">
                      <button
                        type="button"
                        aria-label={t.bag.decreaseQty}
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-ivory/50 hover:text-ivory transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-ivory">{quantity}</span>
                      <button
                        type="button"
                        aria-label={t.bag.increaseQty}
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-ivory/50 hover:text-ivory transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-[10px] uppercase tracking-[0.2em] text-ivory/40 hover:text-ivory/60 transition-colors"
                    >
                      {t.bag.remove}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping */}
          <div className="mt-8 border-t border-ivory/8 pt-8">
            <Link
              href="/collection"
              className="text-[10px] uppercase tracking-[0.3em] text-gold/60 hover:text-gold transition-colors"
            >
              {t.bag.continueShopping}
            </Link>
          </div>
        </div>

        {/* ── Order summary ───────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-ivory/10 bg-ink-soft/30 backdrop-blur-sm px-8 py-8 shadow-card">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-8">
              {t.bag.orderSummary}
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ivory/60">{t.bag.subtotal}</span>
                <span className="text-ivory">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory/60">{t.bag.shipping}</span>
                <span className={shippingFree ? "text-gold/80" : "text-ivory/60"}>
                  {shippingFree ? t.bag.complimentary : `$${STANDARD_SHIPPING.toFixed(2)}`}
                </span>
              </div>
              {!shippingFree && (
                <p className="text-[10px] text-ivory/40">
                  {t.bag.freeShippingNote}
                </p>
              )}
              <div className="flex justify-between">
                <span className="text-ivory/60">{t.bag.estimatedTax}</span>
                <span className="text-ivory/60">{t.bag.calculatedAtCheckout}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-ivory/10 pt-6 flex justify-between">
              <span className="font-serif text-base text-ivory">{t.bag.estimatedTotal}</span>
              <span className="font-serif text-base text-ivory">${estimatedTotal.toFixed(2)}</span>
            </div>

            <p className="mt-2 text-[9px] text-ivory/40">
              {t.bag.taxNote}
            </p>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="mt-8 flex w-full items-center justify-center px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-medium bg-gold/90 text-ink-deep hover:bg-gold transition-colors"
            >
              {t.bag.proceedToCheckout}
            </Link>

            {/* Apple Pay hint */}
            <div className="mt-4 flex items-center justify-center gap-2 border border-ivory/8 py-3">
              <svg width="30" height="14" viewBox="0 0 30 14" fill="currentColor" className="text-ivory/50" aria-hidden="true">
                <text x="0" y="11" fontSize="11" fontFamily="system-ui" fontWeight="600">Apple Pay</text>
              </svg>
              <span className="text-[9px] uppercase tracking-[0.2em] text-ivory/30">{t.bag.availableAtCheckout}</span>
            </div>

            {/* PayPal hint */}
            <div className="mt-2 flex items-center justify-center gap-2 border border-ivory/8 py-3">
              <span className="text-[10px] font-medium text-[#003087]/60" style={{ fontStyle: "italic" }}>Pay</span>
              <span className="text-[10px] font-medium text-[#009cde]/60" style={{ fontStyle: "italic" }}>Pal</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-ivory/30">{t.bag.availableAtCheckout}</span>
            </div>

            {/* Trust signals */}
            <div className="mt-6 space-y-2.5">
              {t.bag.trustSignals.map((line) => (
                <p key={line} className="flex items-center gap-2.5 text-[9px] text-ivory/40">
                  <svg className="w-3 h-3 text-gold/40 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                    <path d="M8 1.5l5 2.5v4c0 3.5-2.5 5.5-5 6.5-2.5-1-5-3-5-6.5v-4l5-2.5z" />
                  </svg>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
