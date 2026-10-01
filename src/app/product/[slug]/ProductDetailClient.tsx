"use client";

import Image from "next/image";
import Link from "next/link";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AddToBag } from "@/components/product/AddToBag";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import { ProductPairingSection } from "@/components/product/ProductPairingSection";
import { useI18n } from "@/lib/i18n/context";
import { productDisplay } from "@/lib/i18n/productCopy";
import { getPreorderCopy } from "@/lib/i18n/preorderCopy";
import type { Product } from "@/lib/types/product";

interface ProductDetailClientProps {
  product: Product;
  related: Product[];
  modelUrl: string | null;
}

export function ProductDetailClient({ product, related, modelUrl }: ProductDetailClientProps) {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const display = productDisplay(product, locale);
  const preorder = getPreorderCopy(locale);

  const copy = zh
    ? {
        jewelry: "珠宝",
        preview3D: "3D 预览",
        designMeaning: "设计寓意",
        material: "材质与工艺",
        styling: "佩戴建议",
        bespoke: "私人定制选项",
        designer: "设计师手记",
        tryOn: "虚拟试戴",
        advice: "获取搭配建议",
        atelier: "进入私人定制",
        related: "相关作品",
        viewCollection: "查看系列 →",
        designedWith: "联合设计：",
      }
    : {
        jewelry: "Jewelry",
        preview3D: "3D Preview",
        designMeaning: "Design Meaning",
        material: "Material & Finish",
        styling: "Styling Notes",
        bespoke: "Bespoke Options",
        designer: "Designer Note",
        tryOn: "Virtual Try-On",
        advice: "Get Styling Advice",
        atelier: "Private Atelier",
        related: "Related Pieces",
        viewCollection: "View Collection →",
        designedWith: "Designed in collaboration with ",
      };

  return (
    <div className="ui-container py-10 lg:py-14">
      <div className="mb-8 flex items-center gap-3 text-[9px] uppercase tracking-[.24em] text-[var(--ui-text-3)]">
        <Link href="/shop" className="hover:text-[var(--ui-text)]">
          {copy.jewelry}
        </Link>
        <span>/</span>
        <span>{display.category}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.12fr_.88fr] xl:gap-20">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#e4dfd6]">
            <Image
              src={product.coverImage}
              alt={display.name}
              fill
              className="object-cover object-center transition-transform duration-[1200ms] hover:scale-[1.02]"
              priority
              sizes="50vw"
            />
          </div>

          {modelUrl && (
            <div className="mt-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60">{copy.preview3D}</p>
              <div className="mt-4 max-w-md">
                <ErrorBoundary>
                  <Product3DViewer
                    modelUrl={modelUrl}
                    productName={display.name}
                    productId={product.id}
                  />
                </ErrorBoundary>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{display.collectionName}</p>
            {display.zodiacAffinity.length > 0 && (
              <>
                <span className="text-ivory/20">·</span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60">
                  {display.zodiacAffinity.join(zh ? "、" : ", ")}
                </p>
              </>
            )}
          </div>

          <h1 className="ui-title mt-4">{display.name}</h1>
          <div className="mt-4 inline-flex border border-gold/35 bg-gold/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            {preorder.badge}
          </div>
          <p className="mt-3 text-lg text-ivory-soft">{display.subtitle}</p>
          <p className="mt-7 border-b border-white/12 pb-7 font-serif text-2xl text-ivory">
            {display.priceLabel}
          </p>

          <p className="mt-8 text-sm leading-relaxed text-ivory-dim">{display.description}</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory-soft">{display.narrative}</p>

          <div className="mt-8 border border-gold/20 bg-gold/[0.06] px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">{preorder.title}</p>
            <p className="mt-2 text-sm leading-6 text-ivory-dim">{preorder.description}</p>
          </div>

          {display.symbolism && (
            <div className="mt-10 border-t border-ivory/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{copy.designMeaning}</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim italic">{display.symbolism}</p>
            </div>
          )}

          {display.materialEnergy && (
            <div className="mt-8 border-t border-ivory/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{copy.material}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ivory/50">{display.material}</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{display.materialEnergy}</p>
            </div>
          )}

          {display.stylingNotes && (
            <div className="mt-8 border-t border-ivory/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{copy.styling}</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{display.stylingNotes}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {display.tags.map((tag) => (
              <span
                key={tag}
                className="border border-ivory/12 px-3 py-1 text-[10px] uppercase tracking-wider text-ivory/50"
              >
                {tag}
              </span>
            ))}
            {display.occasions.map((tag) => (
              <span
                key={tag}
                className="border border-gold/20 px-3 py-1 text-[10px] uppercase tracking-wider text-gold/70"
              >
                {tag}
              </span>
            ))}
          </div>

          {display.customizationOptions.length > 0 && (
            <div className="mt-8 border-t border-ivory/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{copy.bespoke}</p>
              <ul className="mt-4 space-y-2">
                {display.customizationOptions.map((opt) => (
                  <li key={opt} className="flex items-start gap-3 text-sm text-ivory-dim">
                    <span className="mt-1.5 h-px w-4 shrink-0 bg-gold/30" />
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.collaboratorName && (
            <div className="mt-8 border-t border-ivory/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{copy.designer}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-ivory/50">{product.collaboratorName}</p>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim italic">
                {zh ? "这件作品由 Stylix 与设计师共同筛选，后续可进入私人定制流程继续调整材质、比例与符号细节。" : product.designerNote ?? `${copy.designedWith}${product.collaboratorName}.`}
              </p>
            </div>
          )}

          <div className="mt-10 space-y-4 border-t border-white/12 pt-8">
            <div className="flex flex-wrap items-center gap-4">
              <AddToBag product={product} />
              <WishlistHeartButton product={product} size={24} className="border border-ivory/15" />
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <ButtonLink href={`/try-on?piece=${product.slug}`} variant="outline">
                {copy.tryOn}
              </ButtonLink>
              <ButtonLink href="/advisor" variant="ghost" className="!px-0">
                {copy.advice}
              </ButtonLink>
              <ButtonLink href="/vip" variant="ghost" className="!px-0">
                {copy.atelier}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <ProductPairingSection currentProduct={product} />

      {related.length > 0 && (
        <section className="mt-28 border-t border-ivory/10 pt-16">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl text-ivory">{copy.related}</h2>
            <Link
              href="/collection"
              className="text-[10px] uppercase tracking-[0.3em] text-gold/70 transition-colors hover:text-gold"
            >
              {copy.viewCollection}
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => {
              const relatedDisplay = productDisplay(p, locale);

              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group border-0 transition-colors"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={p.coverImage}
                      alt={relatedDisplay.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="30vw"
                    />
                  </div>
                  <div className="p-6">
                    {relatedDisplay.zodiacAffinity.length > 0 && (
                      <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-gold/50">
                        {relatedDisplay.zodiacAffinity.slice(0, 2).join(zh ? " · " : " · ")}
                      </p>
                    )}
                    <p className="font-serif text-lg text-ivory">{relatedDisplay.name}</p>
                    <p className="mt-1 text-sm text-ivory-dim">{relatedDisplay.subtitle}</p>
                    <p className="mt-2 text-xs text-ivory/40">{relatedDisplay.priceLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
