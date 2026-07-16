"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function CheckoutCancelClient() {
  const { t } = useI18n();

  return (
    <div className="ui-page">
      <div className="border-b border-ivory/10 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">
              {t.checkout.secureCheckout}
            </p>
          </div>
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">{t.checkoutCancel.pageTitle}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="max-w-md">
          <p className="text-base text-ivory/60 leading-relaxed mb-2">
            {t.checkoutCancel.noCharge}
          </p>
          <p className="text-base text-ivory/60 leading-relaxed mb-12">
            {t.checkoutCancel.bagSaved}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium bg-gold/90 text-ink-deep hover:bg-gold transition-colors"
            >
              {t.checkoutCancel.backToCheckout}
            </Link>
            <Link
              href="/bag"
              className="inline-flex items-center justify-center px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium border border-ivory/20 text-ivory/60 hover:border-ivory/40 hover:text-ivory transition-colors"
            >
              {t.checkoutCancel.viewBag}
            </Link>
          </div>

          <div className="mt-14 space-y-2">
            {t.checkoutCancel.trustSignals.map((line) => (
              <p key={line} className="flex items-center gap-2 text-[10px] text-ivory/20">
                <span className="h-px w-4 bg-gold/30 shrink-0" />
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
