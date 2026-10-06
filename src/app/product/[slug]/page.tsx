import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/lib/data/products";
import { ProductPageTracker } from "@/components/product/ProductPageTracker";
import { ProductDetailClient } from "./ProductDetailClient";
import { isValidGlbUrl } from "@/lib/utils/model3d";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductPage({ params }: Props) {
  noStore();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const catalogModelUrl = product.model3dUrl ?? null;
  const modelUrl = isValidGlbUrl(catalogModelUrl) ? catalogModelUrl : null;

  return (
    <div className="ui-page pb-20">
      <ProductPageTracker productId={product.id} />
      <ProductDetailClient product={product} related={related} modelUrl={modelUrl} />
    </div>
  );
}
