"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { getProductBySlug } from "@/lib/data/products";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { PairingRecommendations } from "@/components/product/PairingRecommendations";
import { useI18n } from "@/lib/i18n/context";

function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function WishlistClient() {
  const { locale } = useI18n();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);

  const wishlistProducts = useMemo(
    () =>
      items
        .map((item) => getProductBySlug(item.slug))
        .filter((p): p is NonNullable<typeof p> => p != null),
    [items]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const header = (
    <div className="border-b border-ivory/10 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-gold/40" />
          <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">Saved Pieces</p>
        </div>
        <h1 className="font-serif text-4xl text-ivory sm:text-5xl">Wishlist</h1>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="ui-page">
        {header}
        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-10 text-center">
          <p className="font-serif text-2xl text-ivory/30">Loading…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ui-page">
        {header}
        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-10 text-center">
          <p className="font-serif text-2xl text-ivory/30">Your wishlist is empty</p>
          <p className="mt-4 text-sm text-ivory/40">
            Save pieces you love and come back when you&apos;re ready.
          </p>
          <Link
            href="/shop"
            className="mt-10 inline-flex items-center justify-center border border-gold/30 px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium text-gold transition-colors hover:border-gold"
          >
            Explore Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page">
      {header}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col border border-ivory/10 bg-ink-soft/25 transition-colors hover:border-gold/30"
            >
              <button
                type="button"
                aria-label="Remove from wishlist"
                onClick={() => removeItem(item.id)}
                className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full bg-ink-deep/60 p-2 text-rosegold transition-colors hover:bg-gold/10 hover:text-rosegold"
              >
                <HeartIcon filled />
              </button>

              <Link href={`/product/${item.slug}`} className="relative aspect-[4/5] overflow-hidden bg-ink-soft">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <Link href={`/product/${item.slug}`}>
                  <h3 className="font-serif text-xl text-ivory transition-colors hover:text-gold">
                    {item.name}
                  </h3>
                </Link>
                <p className="mt-2 font-serif text-lg text-gold">${item.price.toLocaleString()}</p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      const product = getProductBySlug(item.slug);
                      if (product) addItem(product);
                    }}
                    className="w-full border border-gold/35 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <PairingRecommendations
          ownedProducts={wishlistProducts}
          title={locale === "zh" ? "为你推荐" : "For You"}
          eyebrow={locale === "zh" ? "搭配灵感" : "Pairing Inspiration"}
          className="mt-20"
        />
      </div>
    </div>
  );
}
