import Image from "next/image";
import type { Metadata } from "next";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "设计师合作 - Stylix",
};

const designerProducts = products.filter((product) => product.tags.collectionCategory === "designer-capsule");
const designerName = designerProducts[0]?.collaboratorName ?? "KK WANG Jewelry";
const designerBio = designerProducts[0]?.collaboratorBio ?? "独立珠宝设计工作室，专注带有象征意义的日常佩戴珠宝。";

export default function DesignersPage() {
  return (
    <div className="ui-page">
      <section className="relative overflow-hidden border-b border-[var(--ui-line)]">
        {designerProducts[0] && <Image src={designerProducts[0].coverImage} alt="" fill priority className="object-cover object-[75%_center] opacity-35" />}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,10,11,.96)_8%,rgba(9,10,11,.78)_54%,rgba(9,10,11,.25))]" />
        <div className="ui-container relative flex min-h-[520px] items-center py-16">
          <div>
            <p className="ui-eyebrow">Designer collaboration</p>
            <h1 className="ui-display mt-5 max-w-3xl">{designerName}</h1>
            <p className="ui-copy mt-6 max-w-2xl">{designerBio}</p>
            <div className="mt-7 flex flex-wrap gap-2">{["符号珠宝", "日常佩戴", "JMTI 推荐", "支持定制"].map((item) => <span key={item} className="ui-badge border-white/20 text-white/70">{item}</span>)}</div>
          </div>
        </div>
      </section>

      <main className="ui-container py-16 lg:py-24">
        <div className="mb-10 border-b border-[var(--ui-line)] pb-6"><p className="ui-eyebrow">Capsule collection</p><h2 className="ui-title mt-3">合作系列</h2></div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {designerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
