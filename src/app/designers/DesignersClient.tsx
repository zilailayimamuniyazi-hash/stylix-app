"use client";

import Image from "next/image";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n/context";

const designerProducts = products.filter((product) => product.tags.collectionCategory === "designer-capsule");

export function DesignersClient() {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const designerName = designerProducts[0]?.collaboratorName ?? "KK WANG Jewelry";
  const bio = zh ? "KK WANG Jewelry 是由 KAI Wang 创立的独立珠宝品牌，专注于高级定制、原创设计与承载情感意义的日常珠宝。" : designerProducts[0]?.collaboratorBio ?? "An independent jewelry studio creating symbolic pieces for everyday wear.";
  const badges = zh ? ["寓意珠宝", "日常佩戴", "JMTI 甄选", "支持高级定制"] : ["Symbolic Jewelry", "Everyday Wear", "JMTI Selected", "Bespoke Available"];
  return <div className="ui-page">
    <section className="relative overflow-hidden border-b border-[var(--ui-line)]">
      {designerProducts[0] && <Image src={designerProducts[0].coverImage} alt="" fill priority className="object-cover object-[75%_center] opacity-35" />}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,248,.98)_8%,rgba(251,250,248,.88)_54%,rgba(251,250,248,.28))]" />
      <div className="ui-container relative flex min-h-[520px] items-center py-16"><div>
        <p className="ui-eyebrow">{zh ? "设计师合作" : "Designer collaboration"}</p><h1 className="ui-display mt-5 max-w-3xl">{designerName}</h1><p className="ui-copy mt-6 max-w-2xl">{bio}</p>
        <div className="mt-7 flex flex-wrap gap-2">{badges.map((item) => <span key={item} className="ui-badge">{item}</span>)}</div>
      </div></div>
    </section>
    <main className="ui-container py-16 lg:py-24"><div className="mb-10 border-b border-[var(--ui-line)] pb-6"><p className="ui-eyebrow">{zh ? "胶囊系列" : "Capsule collection"}</p><h2 className="ui-title mt-3">{zh ? "合作系列" : "The Collaboration"}</h2></div><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{designerProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></main>
  </div>;
}
