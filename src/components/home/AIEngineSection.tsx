"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const AI_CARDS = [
  {
    label: "Personality Engine",
    title: "36 Identity Archetypes",
    body: "Analyzes aesthetic, mood, and occasion to map you to a precise jewelry identity — not a trend, but a permanent signature.",
    icon: "◈",
  },
  {
    label: "Material Intelligence",
    title: "Metal & Stone Matching",
    body: "Maps your profile to specific metals, stone energies, and surface treatments. Every material carries meaning.",
    icon: "◇",
  },
  {
    label: "Symbolic Intelligence",
    title: "What Jewelry Means",
    body: "Understands the language of form — what a ring communicates versus a cuff, a chain versus a choker. Meaning, not just aesthetics.",
    icon: "⌘",
  },
];

export function AIEngineSection() {
  return (
    <section className="min-h-screen bg-ink-soft/30 flex items-center py-24 px-6 lg:px-10 overflow-hidden relative">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(201,169,98,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,98,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto max-w-7xl w-full relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-20"
        >
          <motion.p variants={fadeUp} className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-6">
            02 · AI Engine
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-ivory mb-6"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
          >
            The Intelligence Layer
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-ivory/45 max-w-md mx-auto leading-relaxed">
            Stylix reads between the lines of your answers — and builds a jewelry identity from first principles.
          </motion.p>
        </motion.div>

        {/* Glass cards */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {AI_CARDS.map((card) => (
            <motion.div
              key={card.label}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
              }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25, ease: "easeOut" } }}
              className="relative group cursor-default"
              style={{
                backdropFilter: "blur(20px)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Gold top border on hover */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px bg-gold/0 group-hover:bg-gold/50 transition-colors duration-300"
              />
              <div className="px-7 py-8">
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gold/50">{card.label}</p>
                  <span className="text-gold/30 text-lg font-light">{card.icon}</span>
                </div>
                <p className="font-serif text-xl text-ivory mb-4">{card.title}</p>
                <p className="text-xs text-ivory/45 leading-relaxed">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting line */}
        <motion.div
          className="hidden lg:flex items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <span className="text-[8px] uppercase tracking-[0.4em] text-gold/30">Intelligence · Identity · Jewelry</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Link
            href="/vip"
            className="inline-flex items-center justify-center px-12 py-4 text-[11px] uppercase tracking-[0.28em] font-medium border border-gold/30 text-gold hover:border-gold hover:bg-gold/5 transition-all duration-200"
          >
            Discover Your Profile
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
