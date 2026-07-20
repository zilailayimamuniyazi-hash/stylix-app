"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/lib/data/products";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const showcaseProducts = products.slice(0, 6);

export function CollectionsSection() {
  return (
    <section className="bg-ink-deep py-24 px-6 lg:px-10 overflow-hidden">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-6">
            05 · The Collection
          </p>
          <div className="flex items-end justify-between gap-8">
            <h2
              className="font-serif text-ivory max-w-xs"
              style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
            >
              Pieces chosen<br />for who you are.
            </h2>
            <Link
              href="/collection"
              className="hidden sm:inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-ivory/30 hover:text-gold transition-colors group shrink-0"
            >
              <span className="h-px w-8 bg-ivory/20 group-hover:bg-gold/50 transition-colors" />
              View All
            </Link>
          </div>
        </motion.div>

        {/* Product grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {showcaseProducts.map((product, i) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
                },
              }}
              whileHover={{
                rotateY: i % 2 === 0 ? 3 : -3,
                rotateX: -2,
                scale: 1.03,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              style={{ transformStyle: "preserve-3d", perspective: 800 }}
              className="group cursor-default"
            >
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative overflow-hidden border border-ivory/8 group-hover:border-gold/20 transition-colors duration-300">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/70 via-transparent to-transparent" />

                    {/* Category label */}
                    <div
                      className="absolute top-4 left-4 px-3 py-1 border border-ivory/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(5,5,5,0.65)", backdropFilter: "blur(8px)" }}
                    >
                      <span className="text-[7px] uppercase tracking-[0.3em] text-gold/60">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Info bar */}
                  <div className="px-5 py-4 border-t border-ivory/8 bg-ink-soft/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-serif text-sm text-ivory leading-tight">{product.name}</p>
                        <p className="text-[10px] text-ivory/35 mt-1">{product.priceLabel}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.3em] text-gold/40 group-hover:text-gold transition-colors duration-200">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <motion.div
          className="mt-12 text-center sm:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
