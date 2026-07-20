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

const BADGES = ["AR Technology", "Real-Time", "No Download Required", "Private Early Access"];

export function TryOnSection() {
  return (
    <section className="min-h-screen bg-ink-soft/20 flex items-center py-24 px-6 lg:px-10 overflow-hidden">
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid gap-16 lg:gap-24 lg:grid-cols-2 items-center">

          {/* Left — copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.p variants={fadeUp} className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-6">
              04 · Virtual Try-On
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-serif text-ivory mb-6"
              style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
            >
              See it on you
              <br />
              before you commit.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm text-ivory/45 leading-relaxed max-w-sm mb-10">
              Stylix AR overlays selected pieces directly onto your hand in real time. No app. No download. Just the piece, on you, before you decide.
            </motion.p>

            {/* Badge strip */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-10">
              {BADGES.map((b) => (
                <span key={b} className="border border-ivory/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-ivory/35">
                  {b}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/try-on"
                className="inline-flex items-center justify-center px-10 py-4 text-[11px] uppercase tracking-[0.28em] font-medium border border-ivory/20 text-ivory/60 hover:border-gold/40 hover:text-gold transition-colors"
              >
                Join Early Access
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-56 sm:w-64 border-2 border-ivory/15 rounded-[2.5rem] overflow-hidden shadow-luxury"
                style={{ background: "#080808", aspectRatio: "9/19" }}>

                {/* Screen content */}
                <div className="absolute inset-2 rounded-[2rem] overflow-hidden bg-ink-deep flex flex-col">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-ivory/8">
                    <span className="text-[8px] uppercase tracking-widest text-gold/50">Stylix · Try-On</span>
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-gold"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>

                  {/* Camera view placeholder */}
                  <div className="flex-1 relative bg-ink-soft/40 flex items-center justify-center">
                    {/* Hand silhouette hint */}
                    <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-20">
                      <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
                        <rect x="28" y="0" width="12" height="55" rx="6" fill="#c9a962" />
                        <rect x="42" y="8" width="11" height="47" rx="5.5" fill="#c9a962" />
                        <rect x="54" y="14" width="10" height="41" rx="5" fill="#c9a962" />
                        <rect x="16" y="10" width="11" height="45" rx="5.5" fill="#c9a962" />
                        <rect x="6" y="22" width="10" height="35" rx="5" fill="#c9a962" />
                        <rect x="6" y="50" width="68" height="50" rx="8" fill="#c9a962" />
                      </svg>
                    </div>

                    {/* Ring overlay on finger */}
                    <motion.div
                      className="absolute"
                      style={{ bottom: "38%", left: "50%", transform: "translateX(-50%)" }}
                      animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/products/gold-ring.jpg"
                        alt="Ring preview"
                        className="w-10 h-10 rounded-full object-cover border border-gold/40"
                        style={{ boxShadow: "0 0 12px rgba(201,169,98,0.4)" }}
                      />
                    </motion.div>

                    {/* Live preview label */}
                    <motion.div
                      className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 border border-gold/20 px-3 py-1"
                      style={{ background: "rgba(5,5,5,0.7)", backdropFilter: "blur(8px)" }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="w-1 h-1 rounded-full bg-gold animate-pulse" />
                      <span className="text-[7px] uppercase tracking-[0.3em] text-gold/70">Live Preview</span>
                    </motion.div>
                  </div>

                  {/* Bottom bar */}
                  <div className="px-5 py-4 border-t border-ivory/8">
                    <p className="text-[8px] text-ivory/40 text-center">Aurora Celestial Band · $295</p>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10" />
              </div>

              {/* Glow under phone */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full blur-2xl"
                style={{ background: "rgba(201,169,98,0.12)" }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
