"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const IDENTITY_LINES = [
  { text: "Every piece you wear", dim: true },
  { text: "tells a story", gold: true },
  { text: "only you can write.", dim: false },
];

const IDENTITY_TAGS = ["Zodiac", "Occasion", "Aesthetic", "Investment", "Energy", "Vision"];

const PROFILES = [
  {
    label: "The Sovereign",
    desc: "Quiet luxury, architectural forms, 18K gold.",
    border: "border-gold/30",
  },
  {
    label: "The Celestial",
    desc: "Cosmic symbols, moonstone, labradorite.",
    border: "border-ivory/15",
  },
  {
    label: "The Minimalist",
    desc: "Brushed silver, structural reduction.",
    border: "border-ivory/10",
  },
];

export function IdentitySection() {
  return (
    <section className="min-h-screen bg-ink-deep flex items-center py-24 px-6 lg:px-10 overflow-hidden">
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — editorial statement */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={fadeUp} className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-10">
              01 · Identity
            </motion.p>
            <div className="space-y-2 mb-14">
              {IDENTITY_LINES.map((line) => (
                <motion.p
                  key={line.text}
                  variants={fadeUp}
                  className={`font-serif leading-tight ${
                    line.gold
                      ? "text-gradient-gold"
                      : line.dim
                      ? "text-ivory/30"
                      : "text-ivory"
                  }`}
                  style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
                >
                  {line.text}
                </motion.p>
              ))}
            </div>
            <motion.p variants={fadeUp} className="text-sm text-ivory/45 leading-relaxed max-w-md mb-10">
              Stylix reads six dimensions of who you are — and translates them into jewelry that feels inevitable, not chosen.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-10">
              {IDENTITY_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                  className="border border-ivory/10 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-ivory/40"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                href="/vip"
                className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-gold/70 hover:text-gold transition-colors group"
              >
                Discover Your Profile
                <span className="h-px w-8 bg-gold/40 group-hover:w-14 transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — profile cards */}
          <motion.div
            className="flex flex-col gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {PROFILES.map((p, i) => (
              <motion.div
                key={p.label}
                variants={{
                  hidden: { opacity: 0, x: 40 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const } },
                }}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                className={`border ${p.border} bg-ink-soft/30 px-7 py-6 cursor-default`}
              >
                <p className="text-[9px] uppercase tracking-[0.4em] text-gold/50 mb-2">Archetype {i + 1}</p>
                <p className="font-serif text-xl text-ivory mb-2">{p.label}</p>
                <p className="text-xs text-ivory/40 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
            <motion.p
              variants={fadeUp}
              className="text-[9px] uppercase tracking-[0.3em] text-ivory/20 mt-2 text-right"
            >
              36 archetypes available
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
