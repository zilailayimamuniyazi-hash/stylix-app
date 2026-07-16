"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types/product";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import { useI18n } from "@/lib/i18n/context";

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { t } = useI18n();
  const isArchive = product.tags.collectionCategory === "ai-concept-archive";
  const isDesigner = product.tags.collectionCategory === "designer-capsule";

  return (
    <article className="group flex min-w-0 flex-col">
      <div className={`relative overflow-hidden rounded-lg bg-[#e6e3dc] ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
        <div className="absolute right-2 top-2 z-10">
          <WishlistHeartButton product={product} className="border border-black/10 bg-white/85 text-black/55 backdrop-blur-sm" />
        </div>
        <Link href={`/product/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025] ${
              isArchive ? "opacity-80" : ""
            }`}
            sizes="(max-width:768px) 100vw, 33vw"
          />
          {isArchive && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black/65 px-2.5 py-1 text-[8px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                {t.product.conceptArchive}
              </span>
            </div>
          )}
          {isDesigner && product.collaboratorName && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black/65 px-2.5 py-1 text-[8px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                {t.product.selectedByStylix}
              </span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-1 flex-col px-1 py-4">
        {isDesigner && product.collaboratorName ? (
          <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--ui-accent)]">
            {product.collaboratorName} · {t.product.designerCapsule}
          </p>
        ) : (
          <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--ui-text-3)]">{product.category}</p>
        )}
        <Link href={`/product/${product.slug}`} className="mt-2 font-serif text-xl leading-tight text-[var(--ui-text)] hover:text-[var(--ui-accent-hover)]">{product.name}</Link>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--ui-text-3)]">{product.subtitle}</p>
        {isArchive ? (
          <p className="mt-4 text-xs italic text-[var(--ui-text-3)]">{t.product.conceptPieceArchive}</p>
        ) : (
          <p className="mt-4 text-sm font-medium text-[var(--ui-text-2)]">
            {product.priceLabel ?? `$${product.price.toLocaleString()}`}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.styleTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="ui-badge"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/product/${product.slug}`} className="mt-5 inline-flex min-h-11 items-center justify-between border-t border-[var(--ui-line)] pt-3 text-[10px] font-medium uppercase tracking-[.12em] text-[var(--ui-text-2)] hover:text-[var(--ui-text)]"><span>{t.product.viewDetails}</span><span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
