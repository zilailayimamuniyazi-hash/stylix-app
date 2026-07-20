"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const FEATURES = ["Virtual Try-On", "Private Atelier", "AI Stylist", "Bespoke Commissions"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Unable to join right now.");
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch {
      setError("Unable to join right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-ink-deep py-32 px-6 lg:px-10 overflow-hidden">
      {/* Gold rule */}
      <motion.div
        className="mx-auto max-w-7xl mb-20"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </motion.div>

      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.p variants={fadeUp} className="text-[9px] uppercase tracking-[0.5em] text-gold/50 mb-6">
            06 · Early Access
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-ivory mb-6"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}
          >
            The private list<br />is open.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-ivory/45 leading-relaxed mb-12 max-w-sm mx-auto">
            Be among the first to experience the full Stylix platform — AI styling, virtual try-on, and private atelier access.
          </motion.p>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0 mb-10 border border-ivory/12"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={success}
              className="flex-1 bg-transparent px-6 py-4 text-sm text-ivory placeholder:text-ivory/25 focus:outline-none border-b sm:border-b-0 sm:border-r border-ivory/12 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={submitting || success}
              className="px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-medium text-gold/80 hover:text-gold hover:bg-gold/5 transition-colors disabled:opacity-50"
            >
              {success ? "You're In" : submitting ? "Joining…" : "Request Access"}
            </button>
          </motion.form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-300 mb-8"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gold/70 mb-8 uppercase tracking-[0.3em]"
            >
              You are on the list. We will be in touch.
            </motion.p>
          )}

          {/* Feature pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            {FEATURES.map((f) => (
              <span
                key={f}
                className="border border-ivory/8 px-4 py-1.5 text-[8px] uppercase tracking-[0.3em] text-ivory/25"
              >
                {f}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom rule */}
      <motion.div
        className="mx-auto max-w-7xl mt-20"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </motion.div>
    </section>
  );
}
