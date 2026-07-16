"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function CollectionPreview() {
  const { t } = useI18n();
  const cp = t.home.collectionPreview;

  const collections = [
    {
      name: cp.designerCapsuleName,
      eyebrow: cp.designerCapsuleEyebrow,
      description: cp.designerCapsuleDesc,
      href: "/collection?tab=designer-capsule",
      cta: cp.designerCapsuleCta,
      products: [
        {
          name: "Gemini Arc Talisman",
          image: "/products/08bbd545378298049f4ec03b77b783a2.png",
          href: "/product/gemini-arc-talisman-necklace",
        },
        {
          name: "Constellation Star Station",
          image: "/products/09fbcf7b14f107b8cef5c9a5690e9f8b.jpg",
          href: "/product/constellation-star-station-necklace",
        },
        {
          name: "Twin Stone Orbit",
          image: "/products/a2b9de3f928d061bba0a6f67e36b8be8.png",
          href: "/product/twin-stone-orbit-necklace",
        },
      ],
      designerNote: {
        quote: cp.designerQuote,
        attribution: cp.designerAttribution,
      },
    },
    {
      name: cp.celestialName,
      eyebrow: cp.celestialEyebrow,
      description: cp.celestialDesc,
      href: "/collection?tab=celestial-essentials",
      cta: cp.celestialCta,
      products: [
        { name: "Aurora Celestial Band", image: "/products/gold-ring.jpg", href: "/product/aurora-celestial-band" },
        { name: "Selene Moon Ring", image: "/products/微信图片_20260212130431_2_2.jpg", href: "/product/selene-moon-ring" },
        { name: "Eros Duo Stack", image: "/products/1961b5b431c6e985cd27e0b35696b561.png", href: "/product/eros-duo-stack-rings" },
      ],
    },
  ];

  return (
    <section className="bg-ink-deep border-t border-ivory/8 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70">{cp.eyebrow}</p>
          <h2 className="mt-6 font-serif text-3xl text-ivory lg:text-4xl">{cp.title}</h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory-dim/70">{cp.subtitle}</p>
        </div>

        <div className="grid gap-16 lg:gap-24">
          {collections.map((col) => (
            <div
              key={col.name}
              className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:items-start"
            >
              {/* Left: collection identity */}
              <div className="lg:sticky lg:top-28">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60">{col.eyebrow}</p>
                <h3 className="mt-5 font-serif text-2xl text-ivory lg:text-3xl">{col.name}</h3>
                <div className="my-6 h-px w-10 bg-gold/20" />
                <p className="text-sm leading-relaxed text-ivory-dim/80">{col.description}</p>
                {col.designerNote && (
                  <blockquote className="mt-6 border-l border-gold/20 pl-4">
                    <p className="text-xs leading-relaxed text-ivory/50 italic">
                      &ldquo;{col.designerNote.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-gold/40">
                      {col.designerNote.attribution}
                    </p>
                  </blockquote>
                )}
                <Link
                  href={col.href}
                  className="mt-8 inline-flex text-[10px] uppercase tracking-[0.35em] text-gold transition-colors hover:text-gold-light"
                >
                  {col.cta} →
                </Link>
              </div>

              {/* Right: curated product grid */}
              {col.products ? (
                <div className="grid grid-cols-3 gap-4">
                  {col.products.map((p) => (
                    <Link key={p.name} href={p.href} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-stone-50">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          sizes="(max-width:640px) 33vw, (max-width:1024px) 25vw, 18vw"
                        />
                      </div>
                      <p className="mt-3 text-[11px] leading-snug text-ivory-dim/70 group-hover:text-ivory transition-colors duration-300">
                        {p.name}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
