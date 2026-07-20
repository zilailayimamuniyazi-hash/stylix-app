"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { products } from "@/lib/data/products";

const STORIES = [
  {
    eyebrow: "The morning ring",
    body: "A piece light enough to forget, significant enough to miss when absent. Daily luxury is the hardest discipline.",
  },
  {
    eyebrow: "The occasion necklace",
    body: "Some pieces exist to mark time. Your anniversary. The promotion. The departure. Jewelry that holds the moment.",
  },
  {
    eyebrow: "The collector's arc",
    body: "For those who wear with intention. Three pieces, chosen across years. A vocabulary, not a wardrobe.",
  },
];

const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 3).length >= 3
  ? products.filter((p) => p.isFeatured).slice(0, 3)
  : products.slice(0, 3);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

export function DailyIdentitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={sectionRef} className="bg-ink-deep py-24 px-6 lg:px-10 overflow-hidden">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-20"
        >
          <motion.p variants={fadeUp} className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-6">
            03 · Daily Identity
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-ivory max-w-lg"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
          >
            Luxury is a daily practice.
          </motion.h2>
        </motion.div>

        {/* Product stories */}
        <div className="space-y-24">
          {featuredProducts.map((product, i) => {
            const story = STORIES[i] ?? STORIES[0];
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={product.id}
                className={`grid gap-12 lg:gap-20 items-center ${
                  isEven ? "lg:grid-cols-[1fr_1.2fr]" : "lg:grid-cols-[1.2fr_1fr]"
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Copy — swap order on odd */}
                <div className={`space-y-6 ${!isEven ? "lg:order-2" : ""}`}>
                  <p className="text-[9px] uppercase tracking-[0.45em] text-gold/50">{story.eyebrow}</p>
                  <h3 className="font-serif text-2xl text-ivory sm:text-3xl">{product.name}</h3>
                  <p className="text-sm text-ivory/45 leading-relaxed max-w-sm">{story.body}</p>
                  <p className="text-xs text-ivory/30 leading-relaxed">{product.material}</p>
                  <div className="flex items-center gap-6">
                    <span className="font-serif text-base text-ivory">{product.priceLabel}</span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-[10px] uppercase tracking-[0.3em] text-gold/60 hover:text-gold transition-colors group inline-flex items-center gap-2"
                    >
                      View Piece
                      <span className="h-px w-4 bg-gold/40 group-hover:w-8 transition-all duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Image */}
                <motion.div
                  className={`relative overflow-hidden ${!isEven ? "lg:order-1" : ""}`}
                  whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden border border-ivory/8">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/60 via-transparent to-transparent" />
                  </div>
                  {/* floating label */}
                  <div className="absolute bottom-4 left-4 border border-ivory/10 backdrop-blur-md px-4 py-2"
                    style={{ background: "rgba(5,5,5,0.6)" }}>
                    <p className="text-[8px] uppercase tracking-[0.3em] text-gold/60">{product.category}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/collection"
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-ivory/40 hover:text-gold transition-colors group"
          >
            <span className="h-px w-8 bg-ivory/20 group-hover:bg-gold/50 transition-colors" />
            View All Pieces
            <span className="h-px w-8 bg-ivory/20 group-hover:bg-gold/50 transition-colors" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
