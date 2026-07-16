"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/data/products";
import { getPairingRecommendations } from "@/lib/engine/pairing";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useI18n } from "@/lib/i18n/context";
import type { Product } from "@/lib/types/product";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";

interface PairingRecommendationsProps {
  ownedProducts: Product[];
  title?: string;
  eyebrow?: string;
  emptyMessage?: string;
  className?: string;
}

export function PairingRecommendations({
  ownedProducts,
  title,
  eyebrow,
  emptyMessage,
  className = "",
}: PairingRecommendationsProps) {
  const { locale, t } = useI18n();
  const { addItem, items: cartItems } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const recommendations = useMemo(
    () => getPairingRecommendations(ownedProducts, products),
    [ownedProducts]
  );

  const sectionTitle =
    title ?? (locale === "zh" ? "搭配推荐" : "Recommended Pairings");
  const sectionEyebrow =
    eyebrow ?? (locale === "zh" ? "智能搭配" : "Curated Pairings");
  const emptyText =
    emptyMessage ??
    (locale === "zh"
      ? "暂无搭配推荐，浏览更多作品以获取灵感。"
      : "No pairings yet — explore more pieces to unlock recommendations.");

  if (recommendations.length === 0) {
    return (
      <section className={`border-t border-ivory/10 pt-16 ${className}`}>
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.55em] text-gold">{sectionEyebrow}</p>
          <h2 className="mt-3 font-serif text-2xl text-ivory md:text-3xl">{sectionTitle}</h2>
        </div>
        <div className="border border-dashed border-ivory/15 px-8 py-12 text-center">
          <p className="font-serif text-lg text-ivory/40">{emptyText}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`border-t border-ivory/10 pt-16 ${className}`}>
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.55em] text-gold">{sectionEyebrow}</p>
        <h2 className="mt-3 font-serif text-2xl text-ivory md:text-3xl">{sectionTitle}</h2>
      </div>

      <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {recommendations.map(({ product, reason, confidence }) => {
          const inCart = cartItems.some((i) => i.product.id === product.id);
          const justAdded = addedIds.has(product.id);

          return (
            <article
              key={product.id}
              className="group flex w-[72vw] shrink-0 snap-start flex-col border border-ivory/10 bg-ink-soft/20 transition-colors hover:border-gold/40 sm:w-auto"
            >
              <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-ink-soft">
                <Image
                  src={product.coverImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:640px) 72vw, 33vw"
                />
                <div className="absolute left-3 top-3">
                  <span className="bg-gold/10 px-2 py-1 text-[9px] uppercase tracking-widest text-gold backdrop-blur-sm">
                    {Math.round(confidence * 100)}% match
                  </span>
                </div>
                <div className="absolute right-3 top-3">
                  <WishlistHeartButton
                    product={product}
                    className="bg-ink-deep/60 backdrop-blur-sm"
                  />
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <span className="inline-block w-fit bg-gold/10 px-2 py-1 text-[9px] uppercase tracking-widest text-gold">
                  {reason}
                </span>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="mt-3 font-serif text-lg text-ivory transition-colors group-hover:text-gold">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 text-sm text-ivory-dim">{product.subtitle}</p>
                <p className="mt-2 text-sm text-ivory/70">
                  {product.priceLabel ?? `$${product.price.toLocaleString()}`}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product);
                      setAddedIds((prev) => new Set(prev).add(product.id));
                      track({ event_name: EVENTS.ADD_TO_CART, product_id: product.id });
                      setTimeout(() => {
                        setAddedIds((prev) => {
                          const next = new Set(prev);
                          next.delete(product.id);
                          return next;
                        });
                      }, 2000);
                    }}
                    className="flex-1 border border-gold/35 px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink-deep"
                  >
                    {justAdded
                      ? t.product.addedToBag
                      : inCart
                        ? t.product.addAnother
                        : t.product.addToBag}
                  </button>
                  <button
                    type="button"
                    aria-label={isInWishlist(product.id) ? "Saved" : "Save to wishlist"}
                    onClick={() => toggleItem(product)}
                    className={`border px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      isInWishlist(product.id)
                        ? "border-rosegold/40 text-rosegold"
                        : "border-ivory/15 text-ivory/50 hover:border-gold/30 hover:text-gold"
                    }`}
                  >
                    {isInWishlist(product.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
