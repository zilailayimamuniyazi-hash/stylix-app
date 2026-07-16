import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/lib/data/products";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AddToBag } from "@/components/product/AddToBag";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import { ProductPageTracker } from "@/components/product/ProductPageTracker";
import { ProductPairingSection } from "@/components/product/ProductPairingSection";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/product";
import { isValidGlbUrl } from "@/lib/utils/model3d";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getStoredModel3dUrl(product: Product) {
  try {
    const db = getSupabaseAdmin();
    const { data: dbProduct, error: productError } = await db
      .schema("public")
      .from("products")
      .select("id")
      .eq("slug", product.slug)
      .maybeSingle();

    if (productError) {
      return null;
    }

    const productId = (dbProduct as { id?: string } | null)?.id;
    if (!productId) return null;

    const { data: asset, error: assetError } = await db
      .schema("public")
      .from("product_assets")
      .select("model_3d_url")
      .eq("product_id", productId)
      .not("model_3d_url", "is", null)
      .limit(1)
      .maybeSingle();

    if (assetError) {
      return null;
    }

    const model3dUrl = (asset as { model_3d_url?: string | null } | null)?.model_3d_url ?? null;
    return isValidGlbUrl(model3dUrl) ? model3dUrl : null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  noStore();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const catalogModelUrl = product.model3dUrl ?? product.modelUrl ?? product.model3D ?? null;
  const storedModelUrl = await Promise.race<string | null>([
    getStoredModel3dUrl(product),
    new Promise((resolve) => setTimeout(() => resolve(null), 900)),
  ]);
  const modelUrl = storedModelUrl ?? (isValidGlbUrl(catalogModelUrl) ? catalogModelUrl : null);

  return (
    <div className="ui-page pb-20">
      <ProductPageTracker productId={product.id} />
      <div className="ui-container py-10 lg:py-14">
        <div className="mb-8 flex items-center gap-3 text-[9px] uppercase tracking-[.24em] text-white/35"><Link href="/shop" className="hover:text-[#c8a96b]">商城</Link><span>/</span><span>{product.category}</span></div>
        <div className="grid gap-12 lg:grid-cols-[1.12fr_.88fr] xl:gap-20">

          {/* ── Left: imagery + 3D ─────────────────────────────────── */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#e4dfd6]">
              <Image
                src={product.coverImage}
                alt={product.name}
                fill
                className="object-cover object-center transition-transform duration-[1200ms] hover:scale-[1.02]"
                priority
                sizes="50vw"
              />
            </div>
            {modelUrl && (
              <div className="mt-10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60">3D Preview</p>
                <div className="mt-4 max-w-md">
                  <ErrorBoundary>
                    <Product3DViewer
                      modelUrl={modelUrl}
                      productName={product.name}
                      productId={product.id}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: identity + product detail ──────────────────── */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{product.tags.collectionName}</p>
              {product.zodiacAffinity && product.zodiacAffinity.length > 0 && (
                <>
                  <span className="text-ivory/20">·</span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60">
                    {product.zodiacAffinity.join(", ")}
                  </p>
                </>
              )}
            </div>

            <h1 className="ui-title mt-4">{product.name}</h1>
            <p className="mt-3 text-lg text-ivory-soft">{product.subtitle}</p>
            <p className="mt-7 border-b border-white/12 pb-7 font-serif text-2xl text-ivory">
              {product.priceLabel ?? `$${product.price.toLocaleString()}`}
            </p>

            <p className="mt-8 text-sm leading-relaxed text-ivory-dim">{product.description}</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory-soft">{product.narrative}</p>

            {/* ── Symbolism ──────────────────────────────────────── */}
            {product.symbolism && (
              <div className="mt-10 border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">设计寓意</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim italic">{product.symbolism}</p>
              </div>
            )}

            {/* ── Material energy ───────────────────────────────── */}
            {product.materialEnergy && (
              <div className="mt-8 border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">材质与质感</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-ivory/50">{product.material}</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{product.materialEnergy}</p>
              </div>
            )}

            {/* ── Styling notes ─────────────────────────────────── */}
            {product.stylingNotes && (
              <div className="mt-8 border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">搭配建议</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{product.stylingNotes}</p>
              </div>
            )}

            {/* ── Tags ──────────────────────────────────────────── */}
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="border border-ivory/12 px-3 py-1 text-[10px] uppercase tracking-wider text-ivory/50"
                >
                  {tag}
                </span>
              ))}
              {product.tags.occasionTags.map((tag) => (
                <span
                  key={tag}
                  className="border border-gold/20 px-3 py-1 text-[10px] uppercase tracking-wider text-gold/70"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* ── Customization options ─────────────────────────── */}
            {product.customizationOptions && product.customizationOptions.length > 0 && (
              <div className="mt-8 border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">高级定制选项</p>
                <ul className="mt-4 space-y-2">
                  {product.customizationOptions.map((opt) => (
                    <li key={opt} className="flex items-start gap-3 text-sm text-ivory-dim">
                      <span className="mt-1.5 h-px w-4 shrink-0 bg-gold/30" />
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Designer Note ──────────────────────────────────────── */}
            {product.collaboratorName && (
              <div className="mt-8 border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Designer Note</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-ivory/50">{product.collaboratorName}</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim italic">
                  {product.designerNote ?? `Designed in collaboration with ${product.collaboratorName}.`}
                </p>
              </div>
            )}

            {/* ── CTAs ──────────────────────────────────────────── */}
            <div className="mt-10 space-y-4 border-t border-white/12 pt-8">
              <div className="flex flex-wrap items-center gap-4">
                <AddToBag product={product} />
                <WishlistHeartButton product={product} size={24} className="border border-ivory/15" />
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <ButtonLink href={`/try-on?piece=${product.slug}`} variant="outline" className="!border-white/25 !text-white hover:!border-white hover:!bg-white hover:!text-black">
                  虚拟试戴
                </ButtonLink>
                <ButtonLink href="/advisor" variant="ghost" className="!px-0">
                  获取搭配建议
                </ButtonLink>
                <ButtonLink href="/vip" variant="ghost" className="!px-0">
                  高级定制
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        <ProductPairingSection currentProduct={product} />

        {/* ── Related pieces ────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-28 border-t border-ivory/10 pt-16">
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-2xl text-ivory">同系列作品</h2>
              <Link
                href="/collection"
                className="text-[10px] uppercase tracking-[0.3em] text-gold/70 transition-colors hover:text-gold"
              >
                查看系列 →
              </Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group border-0 transition-colors"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={p.coverImage}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="30vw"
                    />
                  </div>
                  <div className="p-6">
                    {p.zodiacAffinity && (
                      <p className="text-[9px] uppercase tracking-[0.3em] text-gold/50 mb-1">
                        {p.zodiacAffinity.slice(0, 2).join(" · ")}
                      </p>
                    )}
                    <p className="font-serif text-lg text-ivory">{p.name}</p>
                    <p className="mt-1 text-sm text-ivory-dim">{p.subtitle}</p>
                    <p className="mt-2 text-xs text-ivory/40">{p.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
